// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,symlinkSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {createServer} from 'node:http';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRelease} from '../../scripts/release.mjs';
import {NODE_RUNTIME,readVerifiedRuntime,createPortable,verifyPortable} from '../../scripts/portable.mjs';
const work=resolve(import.meta.dirname,'../../work');mkdirSync(work,{recursive:true});
function fixture(fn){const dir=mkdtempSync(join(work,'portable-test-'));try{return fn(dir);}finally{const rel=relative(work,resolve(dir));assert.ok(rel&&!rel.startsWith('..'+sep)&&rel!=='..');rmSync(dir,{recursive:true,force:true});}}
function runtimeFixture(dir){mkdirSync(dir,{recursive:true});for(const name of ['node.exe','LICENSE','SHASUMS256.txt',NODE_RUNTIME.archive])writeFileSync(join(dir,name),'synthetic');}
function sourceFixture(dir){const src=join(dir,'src'),release=join(dir,'release');mkdirSync(join(src,'app'),{recursive:true});writeFileSync(join(src,'app/package.json'),'{"version":"0.0.0"}');writeFileSync(join(src,'private.txt'),'must not ship');createRelease(src,release,['app/package.json'],'0.0.0');return release;}

test('portable runtime pins official assets and all original licensing evidence',()=>{
 assert.equal(NODE_RUNTIME.version,'24.19.0');assert.equal(NODE_RUNTIME.arch,'x64');
 assert.equal(new URL(NODE_RUNTIME.checksumURL).hostname,'nodejs.org');
 for(const key of ['archiveSHA256','executableSHA256','licenseSHA256'])assert.match(NODE_RUNTIME[key],/^[a-f0-9]{64}$/);
 assert.ok(Object.isFrozen(NODE_RUNTIME));
});
test('a substituted Node runtime is rejected before any portable output is written',()=>fixture(dir=>{
 const release=sourceFixture(dir),runtime=join(dir,'runtime'),out=join(dir,'portable');runtimeFixture(runtime);
 assert.throws(()=>createPortable(release,out,runtime),/Node executable checksum mismatch/);assert.equal(existsSync(out),false);
}));
test('source manifest tampering prevents portable packaging',()=>fixture(dir=>{
 const release=sourceFixture(dir),out=join(dir,'portable');writeFileSync(join(release,'app/package.json'),'{}');
 assert.throws(()=>createPortable(release,out,join(dir,'runtime')),/Manifest mismatch/);assert.equal(existsSync(out),false);
}));
test('an existing portable destination or ZIP is never overwritten',()=>fixture(dir=>{
 const out=join(dir,'portable');writeFileSync(out+'.zip','existing');
 assert.throws(()=>createPortable('missing',out,'missing'),/refusing to overwrite/);assert.equal(readFileSync(out+'.zip','utf8'),'existing');
}));
test('runtime input through a symlink or junction is refused',()=>fixture(dir=>{
 const runtime=join(dir,'runtime'),alias=join(dir,'alias');runtimeFixture(runtime);symlinkSync(runtime,alias,process.platform==='win32'?'junction':'dir');
 assert.throws(()=>readVerifiedRuntime(alias),/Symbolic links and junctions/);
}));
test('portable manifest cannot use path traversal to verify outside files',()=>fixture(dir=>{
 const out=join(dir,'portable');mkdirSync(out);writeFileSync(join(out,'portable-manifest.json'),JSON.stringify({format:'wardnote-portable/1',target:'windows-x64',runtime:NODE_RUNTIME,files:[{path:'../outside',sha256:'0'.repeat(64),size:0}]}));
 assert.throws(()=>verifyPortable(out),/Unsafe release path/);
}));
test('a portable manifest without the executable and original license is invalid',()=>fixture(dir=>{
 writeFileSync(join(dir,'portable-manifest.json'),JSON.stringify({format:'wardnote-portable/1',target:'windows-x64',runtime:NODE_RUNTIME,files:[]}));
 assert.throws(()=>verifyPortable(dir),/Runtime evidence missing/);
}));

const exec=promisify(execFile);
async function launchFixture(version,fn){
 const dir=mkdtempSync(join(work,'portable-launch-test-'));let requests=0;
 const server=createServer((req,res)=>{requests++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({app:'wardnote-local',version}));});
 try{
  mkdirSync(join(dir,'app'));writeFileSync(join(dir,'app/package.json'),JSON.stringify({version:'0.0.1'}));
  const script=join(dir,'launch.ps1');writeFileSync(script,readFileSync(resolve(import.meta.dirname,'../../启动应用.ps1')));
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const port=server.address().port;
  const run=async()=>{
   const shell=join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/powershell.exe');
   // A parent PowerShell 7 session may otherwise inject incompatible module paths into Windows PowerShell 5.
   const options={windowsHide:true,timeout:15000,env:{...process.env,PATH:join(process.env.SystemRoot,'System32'),PSModulePath:join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/Modules'),NOTE_NODE:join(dir,'absent-node.exe'),NOTE_PORT:String(port),NOTE_HOST:'127.0.0.1',NOTE_DATA_DIR:join(dir,'data')}};
   try{return {code:0,...await exec(shell,['-NoProfile','-ExecutionPolicy','Bypass','-File',script,'-NoBrowser'],options)};}catch(error){return {code:error.code,stdout:error.stdout||'',stderr:error.stderr||''};}
  };
  await fn({dir,run,requests:()=>requests,server});
 }finally{
  server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
  const rel=relative(work,resolve(dir));assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+sep));rmSync(dir,{recursive:true,force:true});
 }
}
test('Windows launcher refuses an existing different-version service without stopping it',{skip:process.platform!=='win32'},()=>launchFixture('0.0.0',async({dir,run,server,requests})=>{
 const result=await run();assert.notEqual(result.code,0);assert.match(result.stderr,/different WardNote version/);assert.match(result.stderr,/Save work and recordings/);
 assert.equal(server.listening,true);assert.ok(requests()>0);assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));
test('Windows launcher reuses only the expected version without requiring external Node',{skip:process.platform!=='win32'},()=>launchFixture('0.0.1',async({dir,run,server})=>{
 const result=await run();assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/WardNote is ready/);
 assert.equal(server.listening,true);assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));
test('Windows launcher validates bundled runtime even when the expected service is already running',{skip:process.platform!=='win32'},()=>launchFixture('0.0.1',async({dir,run,requests,server})=>{
 mkdirSync(join(dir,'runtime/node'),{recursive:true});writeFileSync(join(dir,'runtime/node/node.exe'),'substituted runtime');
 writeFileSync(join(dir,'portable-manifest.json'),JSON.stringify({format:'wardnote-portable/1',target:'windows-x64',runtime:NODE_RUNTIME}));
 const result=await run();assert.notEqual(result.code,0);assert.match(result.stderr,/Portable runtime verification failed/);
 assert.equal(requests(),0);assert.equal(server.listening,true);assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));
test('Windows launcher refuses an incomplete runtime before consulting an existing service',{skip:process.platform!=='win32'},()=>launchFixture('0.0.1',async({dir,run,requests,server})=>{
 writeFileSync(join(dir,'portable-manifest.json'),JSON.stringify({format:'wardnote-portable/1',target:'windows-x64',runtime:NODE_RUNTIME}));
 const result=await run();assert.notEqual(result.code,0);assert.match(result.stderr,/Portable runtime is incomplete/);
 assert.equal(requests(),0);assert.equal(server.listening,true);
}));
