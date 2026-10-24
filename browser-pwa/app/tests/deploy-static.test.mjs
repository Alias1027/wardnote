// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {resolve,join,dirname,relative,sep} from 'node:path';
import vm from 'node:vm';
import {request} from 'node:http';
import {validateOrigin,caddyConfig,inspectStaticSource,createStatic,verifyStatic,previewServer} from '../../scripts/deploy-static.mjs';
import {writeZip} from '../../scripts/release.mjs';
const ROOT=resolve(import.meta.dirname,'../..'),WORK=join(ROOT,'work');mkdirSync(WORK,{recursive:true});
async function fixture(run){const dir=mkdtempSync(join(WORK,'deploy-static-test-'));try{return await run(dir);}finally{const path=relative(WORK,dir);assert.ok(path&&!path.startsWith('..')&&!path.startsWith(sep));rmSync(dir,{recursive:true,force:true});}}
function write(root,path,body){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),body);}
function source(dir){
 const files={'index.html':'<!doctype html><script type="module" src="/app.js"></script>','app.js':"import './offline-ui.js';",'offline-ui.js':'export const local=true;','offline-store.js':'export const store=true;','offline-api.js':'export const api=true;','deployment-profile.js':'export const STATIC_ONLY=false;','manifest.webmanifest':JSON.stringify({scope:'/',start_url:'/',icons:[{src:'/icons/icon.png'}]}),'icons/icon.png':Buffer.from([137,80,78,71]),'sw.js':"const CACHE='wardnote-shell-v0.0.1-r1';\nconst FILES=['/','/app.js','/offline-ui.js','/offline-store.js','/offline-api.js','/deployment-profile.js','/manifest.webmanifest','/icons/icon.png'];"};
 for(const [path,body]of Object.entries(files))write(dir,'app/public/'+path,body);
 write(dir,'deployment/static-files.json',JSON.stringify(Object.keys(files).map(p=>'app/public/'+p)));
 write(dir,'app/package.json',JSON.stringify({version:'0.0.1'}));
 for(const path of ['deployment/STATIC-PWA.md','deployment/admin-setup.html','deployment/admin-wizard.js','deployment/static-headers.json','LICENSE','NOTICE','LICENSES/Apache-2.0.txt','LICENSES/CC-BY-4.0.txt'])write(dir,path,readFileSync(join(ROOT,path)));
 write(dir,'data/clinical.db','synthetic private data');write(dir,'config.local.json','synthetic private config');return dir;
}
test('deployment accepts only dedicated HTTPS origins and rejects subpaths and executable config input',()=>{
 assert.equal(validateOrigin('https://notes.example.org/'),'https://notes.example.org');
 for(const value of ['http://notes.example.org','https://127.0.0.1','https://localhost','https://notes.example.org:8443','https://notes.example.org/sub/','https://user:secret@notes.example.org','https://notes.example.org/?x=1','https://notes.example.org/#x','https://notes.example.org/\n}'])assert.throws(()=>validateOrigin(value));
});
test('static export uses public allowlist, forces static profile, preserves source and packages checksums',()=>fixture(dir=>{
 const src=source(join(dir,'source')),out=join(dir,'static'),manifest=createStatic(src,out,{origin:'https://notes.example.org'});
 assert.equal(verifyStatic(out),manifest.files.length);assert.equal(manifest.backend,false);assert.equal(manifest.rootPath,'/');
 assert.equal(existsSync(join(out,'data')),false);assert.equal(existsSync(join(out,'config.local.json')),false);assert.equal(existsSync(join(out,'app/server.mjs')),false);
 assert.match(readFileSync(join(out,'site/deployment-profile.js'),'utf8'),/STATIC_ONLY=true/);assert.match(readFileSync(join(src,'app/public/deployment-profile.js'),'utf8'),/STATIC_ONLY=false/);assert.match(readFileSync(join(out,'site/sw.js'),'utf8'),/-static'/);
 assert.match(readFileSync(join(out,'Caddyfile'),'utf8'),/notes\.example\.org \{/);assert.match(readFileSync(join(out,'Caddyfile'),'utf8'),/root \* \.\/site/);
 assert.match(readFileSync(join(out,'SHA256SUMS.txt'),'utf8'),/static-manifest\.json/);
 writeZip(out,out+'.zip',[...manifest.files.map(f=>f.path),'static-manifest.json','SHA256SUMS.txt'],'wardnote-static-test');assert.ok(existsSync(out+'.zip.sha256'));
 assert.throws(()=>createStatic(src,out),/refusing to overwrite/);
}));
test('static exporter rejects unsafe allowlist paths, missing imports and incomplete offline cache before writing output',()=>fixture(dir=>{
 const src=source(join(dir,'source')),out=join(dir,'static');
 const path=join(src,'deployment/static-files.json'),list=JSON.parse(readFileSync(path,'utf8'));
 writeFileSync(path,JSON.stringify([...list,'config.local.json']));assert.throws(()=>createStatic(src,out),/public application assets/);assert.equal(existsSync(out),false);
 writeFileSync(path,JSON.stringify(list));writeFileSync(join(src,'app/public/app.js'),"import {x} from './missing.js';");assert.throws(()=>inspectStaticSource(src),/Imported asset missing/);
 writeFileSync(join(src,'app/public/app.js'),'');writeFileSync(join(src,'app/public/sw.js'),"const CACHE='wardnote-shell-v0.0.1'; const FILES=['/'];");assert.throws(()=>inspectStaticSource(src),/must cache the deployment profile/);
}));
test('package verification rejects modified files and unexpected files rather than publishing them',()=>fixture(dir=>{
 const src=source(join(dir,'source')),out=join(dir,'static');createStatic(src,out);
 writeFileSync(join(out,'unlisted.txt'),'unexpected');assert.throws(()=>verifyStatic(out),/Unexpected or missing/);rmSync(join(out,'unlisted.txt'));
 writeFileSync(join(out,'site/app.js'),'modified');assert.throws(()=>verifyStatic(out),/checksum mismatch/);
}));
test('preview serves typed allowlisted resources only, with headers and no clinical API',()=>fixture(async dir=>{
 const out=join(dir,'static');createStatic(source(join(dir,'source')),out);const server=previewServer(out);await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{
  const html=await fetch(base);assert.equal(html.status,200);assert.match(html.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(html.headers.get('cache-control'),'no-cache');assert.match(html.headers.get('content-type'),/text\/html/);
  assert.match((await fetch(base+'/app.js')).headers.get('content-type'),/text\/javascript/);assert.match((await fetch(base+'/manifest.webmanifest')).headers.get('content-type'),/application\/manifest\+json/);
  for(const path of ['/api/status','/api/institution/status','/_headers','/config.local.json','/static-manifest.json','/data/clinical.db','/missing.html'])assert.equal((await fetch(base+path)).status,404,path);
  assert.equal((await fetch(base,{method:'POST'})).status,405);
  const wrongHost=await new Promise((resolve,reject)=>{const req=request(base,{headers:{Host:'wrong.example'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('error',reject);req.end();});assert.equal(wrongHost,403);
 }finally{await new Promise(r=>server.close(r));}
}));
test('offline administrator wizard and packaged Caddy generator agree and reject injection',()=>{
 const sandbox={URL};vm.runInNewContext(readFileSync(join(ROOT,'deployment/admin-wizard.js'),'utf8'),sandbox);
 const result=sandbox.WardNoteDeployment.configuration('https://notes.example.org/');const headers=JSON.parse(readFileSync(join(ROOT,'deployment/static-headers.json'),'utf8'));
 assert.equal(result.config,caddyConfig('notes.example.org',headers));assert.equal(result.origin,'https://notes.example.org');assert.match(result.start,/caddy validate/);assert.match(result.verify,/curl\.exe -i https:\/\/notes\.example\.org\/api\/status/);
 for(const input of ['http://notes.example.org','notes.example.org/path','notes.example.org:8443','notes.example.org\n{ reverse_proxy evil }','user:secret@notes.example.org','127.0.0.1','localhost'])assert.throws(()=>sandbox.WardNoteDeployment.configuration(input));
});
