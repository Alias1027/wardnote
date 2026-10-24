// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,rmSync,symlinkSync,existsSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {inflateRawSync} from 'node:zlib';
import {VERSION} from '../public/domain.js';
import {validatePath,collectFiles,createRelease,verifyManifest,writeZip,checkMarkdownLinks} from '../../scripts/release.mjs';

const root=resolve(import.meta.dirname,'../..'),work=join(root,'work');
mkdirSync(work,{recursive:true});
function fixture(fn){
  const dir=mkdtempSync(join(work,'release-test-'));
  try{return fn(dir);}finally{
    const rel=relative(work,dir);
    assert.ok(rel && rel!=='..' && !rel.startsWith('..'+sep));
    rmSync(dir,{recursive:true,force:true});
  }
}

test('release paths exclude clinical data, private configuration and traversal',()=>{
  for(const path of ['../secret','/tmp/a','a\\b','C:/secret','data/a.json','logs/history.txt','work/a.png','.git/config','app/node_modules/a.js','x/.env.prod','config.local.json','audio.wav','backup.db','key.pem'])assert.throws(()=>validatePath(path));
  assert.equal(validatePath('.github/workflows/ci.yml'),'.github/workflows/ci.yml');
});

test('only allowlisted files are copied and existing release output is preserved',()=>fixture(dir=>{
  const source=join(dir,'source'),out=join(dir,'output');mkdirSync(source);writeFileSync(join(source,'public.txt'),'public');writeFileSync(join(source,'private.txt'),'private');
  const manifest=createRelease(source,out,['public.txt'],'test');assert.equal(manifest.files.length,1);assert.equal(existsSync(join(out,'private.txt')),false);
  assert.throws(()=>createRelease(source,out,['public.txt'],'test'),/refusing to overwrite/);
  assert.equal(readFileSync(join(out,'public.txt'),'utf8'),'public');
}));

test('release manifest detects a changed file',()=>fixture(dir=>{
  const source=join(dir,'source'),out=join(dir,'output');mkdirSync(source);writeFileSync(join(source,'public.txt'),'first');
  createRelease(source,out,['public.txt'],'test');assert.equal(verifyManifest(out),1);writeFileSync(join(out,'public.txt'),'tampered');assert.throws(()=>verifyManifest(out),/mismatch/);
}));

test('symlink or junction directories cannot bring external files into a release',()=>fixture(dir=>{
  const source=join(dir,'source'),outside=join(dir,'outside');mkdirSync(source);mkdirSync(outside);writeFileSync(join(outside,'file.txt'),'private');
  symlinkSync(outside,join(source,'alias'),process.platform==='win32'?'junction':'dir');assert.throws(()=>collectFiles(source,['alias/file.txt']),/Symlink/);
}));

test('ZIP includes dotfiles and preserves UTF-8 names and file bytes',()=>fixture(dir=>{
  mkdirSync(join(dir,'.github'));writeFileSync(join(dir,'.github','配置.txt'),'synthetic text');
  const target=join(dir,'source.zip');writeZip(dir,target,['.github/配置.txt'],'wardnote-test');
  const bytes=readFileSync(target);assert.equal(bytes.readUInt32LE(0),0x04034b50);const length=bytes.readUInt16LE(26);const size=bytes.readUInt32LE(18);
  assert.equal(bytes.subarray(30,30+length).toString('utf8'),'wardnote-test/.github/配置.txt');assert.equal(inflateRawSync(bytes.subarray(30+length,30+length+size)).toString(),'synthetic text');
  assert.ok(existsSync(target+'.sha256'));assert.throws(()=>writeZip(dir,target,['.github/配置.txt'],'wardnote-test'),/refusing/);
}));

test('version and locked development dependency agree',()=>{
  const pkg=JSON.parse(readFileSync(join(root,'app/package.json'),'utf8')),lock=JSON.parse(readFileSync(join(root,'app/package-lock.json'),'utf8'));
  assert.equal(pkg.version,VERSION);assert.equal(lock.version,VERSION);assert.equal(lock.packages[''].version,VERSION);assert.equal(lock.packages[''].devDependencies.playwright,pkg.devDependencies.playwright);
  assert.match(readFileSync(join(root,'app/public/sw.js'),'utf8'),new RegExp(`wardnote-shell-v${VERSION.replaceAll('.','\\.')}`));
});

test('public source allowlist and relative documentation links are complete',()=>{
  const list=JSON.parse(readFileSync(join(root,'scripts/release-files.json'),'utf8'));
  const files=collectFiles(root,list);assert.ok(files.length>30);checkMarkdownLinks(files);
  assert.equal(list.some(p=>p.startsWith('logs/')||p.startsWith('reference/')),false);
});

test('current release documentation agrees without relabeling historical evidence',()=>{
  const currentFiles=['README.md','README.en.md','docs/LOCALIZATION.md','docs/MODEL-INTERFACES.md','docs/RELEASING.md','docs/ROADMAP.md','docs/GITHUB-INTRO.md','LICENSES/README.md','docs/OFFLINE-AND-ACCOUNTS.md','docs/CLINICAL-SCOPE.md','docs/GETTING-STARTED.md','docs/RELEASE-CHECKLIST.md','NOTICE'];
  for(const file of currentFiles)assert.ok(readFileSync(join(root,file),'utf8').includes(VERSION),file+' must identify the current release');
  const report=JSON.parse(readFileSync(join(root,'docs/VALIDATION-RESULTS.json'),'utf8'));
  assert.equal(report.version,VERSION);
  assert.ok(readFileSync(join(root,'docs/VALIDATION.md'),'utf8').split('\n').slice(0,4).join('\n').includes(VERSION));
  assert.ok(readFileSync(join(root,'CHANGELOG.md'),'utf8').split('\n').find(line=>line.startsWith('## ')).startsWith('## '+VERSION+' '));
  const maintained=VERSION.split('.').slice(0,2).join('.')+'.x';
  assert.ok(readFileSync(join(root,'SECURITY.md'),'utf8').includes(maintained));
  assert.equal(report.previousReleaseChecks.version,'0.1.1');
});

test('CI and npm entry points include all core and browser suites and packaged-source validation',()=>{
  const ci=readFileSync(join(root,'.github/workflows/ci.yml'),'utf8');
  const pkg=JSON.parse(readFileSync(join(root,'app/package.json'),'utf8'));
  assert.equal(pkg.scripts.test,'node --test tests/*.test.mjs');
  assert.match(ci,/run: npm test\s/);
  assert.match(ci,/os: \[ubuntu-latest, windows-latest, macos-latest\]/);
  for(const command of ['node scripts/release.mjs --check','node scripts/release.mjs --zip','node scripts/test-package.mjs','npm run test:browser'])assert.ok(ci.includes('run: '+command));
  for(const file of ['browser.mjs','panels-browser.mjs','localization-browser.mjs','offline-browser.mjs','device-consistency-browser.mjs','evidence-browser.mjs','note-tools-browser.mjs'])assert.ok(pkg.scripts['test:browser'].includes('node tests/'+file));
  for(const evidence of ['browser-results.json','panels-results.json','localization-browser-failure.json','offline-failure.json','device-consistency-results.json','evidence-results.json','note-tools-results.json'])assert.ok(ci.includes(evidence));
});

test('public source contains every core suite and the standalone package test runner',()=>{
  const list=JSON.parse(readFileSync(join(root,'scripts/release-files.json'),'utf8'));
  const suites=readdirSync(join(root,'app/tests')).filter(name=>name.endsWith('.test.mjs')||name.endsWith('-browser.mjs'));
  assert.ok(suites.length>=5);
  for(const name of suites)assert.ok(list.includes('app/tests/'+name),'Missing packaged suite: '+name);
  assert.ok(list.includes('scripts/test-package.mjs'));
  assert.ok(list.includes('docs/GITHUB-INTRO.md'));
});

test('CSV review files are included in the publication secret scan',()=>fixture(dir=>{
  const token='ghp_'+'A'.repeat(36);
  writeFileSync(join(dir,'review.csv'),'key,review\nexample,'+token+'\n');
  assert.throws(()=>collectFiles(dir,['review.csv']),/Potential personal path or secret/);
  writeFileSync(join(dir,'review.csv'),'key,review\nexample,pending\n');
  assert.equal(collectFiles(dir,['review.csv']).length,1);
}));

test('current licensing metadata and published terms agree while preserving older grants',()=>{
  const list=JSON.parse(readFileSync(join(root,'scripts/release-files.json'),'utf8'));
  const pkg=JSON.parse(readFileSync(join(root,'app/package.json'),'utf8'));
  const lock=JSON.parse(readFileSync(join(root,'app/package-lock.json'),'utf8'));
  assert.equal(pkg.license,'SEE LICENSE IN ../LICENSE');
  assert.equal(lock.packages[''].license,pkg.license);
  const license=readFileSync(join(root,'LICENSE'),'utf8');
  assert.match(license,/WardNote Personal Noncommercial Source-Available License 1\.0/);
  assert.ok(license.includes('release '+VERSION));
  assert.match(license,/prior|Prior/);
  assert.match(license,/explicit written authorization/);
  assert.match(license,/does not\s+retroactively revoke rights/);
  for(const file of ['LICENSE','NOTICE','README.md','README.en.md','LICENSES/README.md','docs/GITHUB-INTRO.md']){
    const text=readFileSync(join(root,file),'utf8');
    assert.ok(text.includes('Junhui Liu M.D.'),file+' lacks confirmed licensor');
    assert.ok(text.includes('junhuiliu1025@gmail.com'),file+' lacks confirmed contact');
  }
  for(const file of list.filter(p=>/\.(?:js|mjs)$/.test(p))){
    assert.doesNotMatch(readFileSync(join(root,file),'utf8'),/^\/\/ SPDX-License-Identifier: Apache-2\.0$/m,file);
  }
  for(const file of ['LICENSES/Apache-2.0.txt','LICENSES/CC-BY-4.0.txt'])assert.ok(list.includes(file));
  assert.match(readFileSync(join(root,'LICENSES/Apache-2.0.txt'),'utf8'),/Apache License/);
  assert.match(readFileSync(join(root,'LICENSES/CC-BY-4.0.txt'),'utf8'),/Attribution 4.0 International/);
});
