// Integration checks only; neither runtime nor device/clinical validation is implied.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, relative, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyManifest} from '../browser-pwa/scripts/release.mjs';

const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8').replace(/\r\n/g,'\n');
const names=JSON.parse(read('scripts/public-files.json')).files;
const publicSet=new Set(names);
assert.equal(verifyManifest(resolve(root,'browser-pwa')),186);
assert.equal(createHash('sha256').update(readFileSync(resolve(root,'browser-pwa/release-manifest.json'))).digest('hex'),'c2260672f66dc05895f957ccf856d0fd569e292c5591c91779438f135a341bca');

let linkCount=0;
for(const name of names.filter(n=>n.endsWith('.md'))){
  const text=read(name).replace(/```[\s\S]*?```/g,'');
  for(const match of text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)){
    const link=match[1].replace(/^<|>$/g,'');
    if(/^(https?:|mailto:|#)/i.test(link))continue;
    const target=decodeURIComponent(link.split('#')[0]);
    const path=relative(root,resolve(root,dirname(name),target)).split(sep).join('/');
    assert.ok(publicSet.has(path),`${name}: unpublished relative link ${link}`);
    assert.ok(existsSync(resolve(root,path)),path);
    linkCount++;
  }
}
const urls=name=>new Set([...read(name).matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map(m=>m[1]));
assert.deepEqual([...urls('README.md')].sort(),[...urls('README.en.md')].sort());
assert.equal(read('LICENSE').slice(read('LICENSE').indexOf('1. Scope and licensor')),read('browser-pwa/LICENSE').slice(read('browser-pwa/LICENSE').indexOf('1. Scope and licensor')));
const workflow=read('.github/workflows/main-project-ci.yml');
assert.ok(workflow.includes('working-directory: browser-pwa\n'));
assert.equal((workflow.match(/working-directory: browser-pwa\/app/g)||[]).length,4);
assert.ok(workflow.includes('os: [ubuntu-latest, windows-latest, macos-latest]'));
for(const command of ['npm test','node scripts/release.mjs --check','node scripts/release.mjs --zip','node scripts/test-package.mjs','npm run test:browser'])assert.ok(workflow.includes('run: '+command));
assert.doesNotMatch(workflow,/secrets\.|gh release|git push/);
console.log(JSON.stringify({status:'passed',mainSourceFiles:186,mainUIRevision:'r2',historicalReleaseAssets:'preserved' ,publicFiles:names.length,relativeMarkdownLinks:linkCount,bilingualDownloadDestinations:'equal',licenseTerms:'equal',scope:'Combined source manifests, full bilingual copy, links and workflow paths; not device or clinical validation'}));
