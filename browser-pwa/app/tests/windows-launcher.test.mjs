// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,copyFileSync,openSync,closeSync} from 'node:fs';
import {join,resolve,relative,sep} from 'node:path';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
const root=resolve(import.meta.dirname,'../..'),work=join(root,'work');
mkdirSync(work,{recursive:true});
const windows={skip:process.platform!=='win32'};
const shell=join(process.env.SystemRoot||'C:\\Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
const quote=value=>"'"+value.replaceAll("'","''")+"'";
function psJSON(path){return JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));}
const syntheticServer=`import {createServer} from 'node:http';import {appendFileSync} from 'node:fs';
appendFileSync(process.env.NOTE_DATA_DIR+'/starts.txt',String(process.pid)+'\\n');
createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify({app:'wardnote-local',version:'0.0.1'}));}).listen(Number(process.env.NOTE_PORT),'127.0.0.1');`;
async function fixture(fn){
 const dir=mkdtempSync(join(work,'windows-launcher-测试 ')),data=join(dir,'synthetic data');
 mkdirSync(join(dir,'scripts'));mkdirSync(join(dir,'app'));mkdirSync(data);
 for(const file of ['Start-WardNote.ps1','启动应用.ps1','停止应用.ps1','scripts/windows-launcher.ps1'])copyFileSync(join(root,file),join(dir,file));
 writeFileSync(join(dir,'app/package.json'),JSON.stringify({version:'0.0.1'}));writeFileSync(join(dir,'app/server.mjs'),syntheticServer);
 writeFileSync(join(data,'saved.txt'),'synthetic saved record');
 const config='{"port":8787,"testPreserve":"synthetic private setting"}\n';writeFileSync(join(dir,'config.local.json'),config);
 const portProbe=createServer();await new Promise(resolve=>portProbe.listen(0,'127.0.0.1',resolve));const port=portProbe.address().port;await new Promise(resolve=>portProbe.close(resolve));
 const env={...process.env,PATH:join(process.env.SystemRoot,'System32'),PSModulePath:join(process.env.SystemRoot,'System32/WindowsPowerShell/v1.0/Modules'),NOTE_NODE:process.execPath,NOTE_HOST:'127.0.0.1',NOTE_PORT:String(port),NOTE_DATA_DIR:data};
 let runNumber=0;
 async function run(args,extraEnv={}){
  // Files prevent a long-lived Windows child from holding an execFile capture pipe open.
  const prefix=join(dir,'check-'+(++runNumber)),outPath=prefix+'.out',errPath=prefix+'.err',out=openSync(outPath,'w'),err=openSync(errPath,'w');
  try{
   const child=spawn(shell,['-NoProfile','-ExecutionPolicy','Bypass','-STA',...args],{windowsHide:true,stdio:['ignore',out,err],env:{...env,...extraEnv}});
   const code=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{child.kill();reject(new Error('PowerShell launcher check timed out'));},45000);child.once('error',error=>{clearTimeout(timeout);reject(error);});child.once('exit',value=>{clearTimeout(timeout);resolve(value);});});
   return {code,stdout:readFileSync(outPath,'utf8'),stderr:readFileSync(errPath,'utf8')};
  }finally{closeSync(out);closeSync(err);}
 }
 const launch=(extraEnv={})=>run(['-File',join(dir,'Start-WardNote.ps1'),'-NoBrowser'],extraEnv);
 const stop=(confirmed=false)=>run(['-Command',`. ${quote(join(dir,'scripts/windows-launcher.ps1'))}; Stop-WardNoteLauncherService -Root ${quote(dir)}${confirmed?' -SavedWorkConfirmed':''}`]);
 try { await fn({dir,data,port,run,launch,stop,config}); }
 finally {
  await run(['-File',join(dir,'停止应用.ps1')]);
  assert.equal(readFileSync(join(dir,'config.local.json'),'utf8'),config,'private config preserved');
  assert.equal(readFileSync(join(data,'saved.txt'),'utf8'),'synthetic saved record','saved data preserved');
  const rel=relative(work,resolve(dir));assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+sep));rmSync(dir,{recursive:true,force:true});
 }
}

test('Windows 5.1 constructs bilingual controls without showing UI or starting the service',windows,()=>fixture(async({dir,run})=>{
 const result=await run(['-File',join(dir,'Start-WardNote.ps1'),'-CheckInterface']);assert.equal(result.code,0,result.stderr);
 const ui=JSON.parse(result.stdout);assert.match(ui.Powershell,/^5\.1\./);assert.equal(ui.Visible,false);assert.match(ui.Title,/启动与停止/);
 assert.equal(ui.Buttons.length,4);assert.ok(ui.Buttons.some(text=>/Desktop shortcut/.test(text)));assert.ok(ui.Buttons.some(text=>/Getting started/.test(text)));assert.match(ui.Footer,/keeps WardNote running/);
 assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));

test('friendly launcher reopens its owned service and requires saved-work confirmation to stop',windows,()=>fixture(async({dir,port,launch,stop})=>{
 const first=await launch();assert.equal(first.code,0,first.stderr);assert.match(first.stdout,new RegExp('127.0.0.1:'+port));
 const state=psJSON(join(dir,'work/server-process.json'));const second=await launch();assert.equal(second.code,0,second.stderr);assert.equal(psJSON(join(dir,'work/server-process.json')).pid,state.pid);
 const refused=await stop();assert.notEqual(refused.code,0);assert.match(refused.stderr,/explicitly confirm/);assert.equal((await fetch(`http://127.0.0.1:${port}/api/status`)).status,200);
 const stopped=await stop(true);assert.equal(stopped.code,0,stopped.stderr);assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));

test('concurrent friendly launches create one service and preserve the fixed port',windows,()=>fixture(async({dir,data,port,launch})=>{
 const results=await Promise.all([launch(),launch()]);for(const result of results)assert.equal(result.code,0,result.stderr);
 assert.equal(readFileSync(join(data,'starts.txt'),'utf8').trim().split('\n').length,1);assert.equal(psJSON(join(dir,'work/server-process.json')).port,port);
 const changed=await launch({NOTE_PORT:String(port===65535?65534:port+1)});assert.notEqual(changed.code,0);assert.match(changed.stderr,/already running with different settings/);assert.equal(psJSON(join(dir,'work/server-process.json')).port,port);
}));

test('friendly launcher does not open a same-version service owned by another folder',windows,()=>fixture(async({dir,port,launch})=>{
 const other=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end('{"app":"wardnote-local","version":"0.0.1"}');});
 await new Promise(resolve=>other.listen(port,'127.0.0.1',resolve));
 try{const result=await launch();assert.notEqual(result.code,0);assert.match(result.stderr,/another folder/);assert.equal(other.listening,true);assert.equal(existsSync(join(dir,'work/server-process.json')),false);}
 finally{other.closeAllConnections();await new Promise(resolve=>other.close(resolve));}
}));

test('a failed child startup removes its process state without altering saved data',windows,()=>fixture(async({dir,launch})=>{
 writeFileSync(join(dir,'app/server.mjs'),'process.exit(2);');
 const result=await launch();assert.notEqual(result.code,0);assert.match(result.stderr,/Service did not start/);assert.equal(existsSync(join(dir,'work/server-process.json')),false);
}));

test('stop refuses a changed process identity even after saved-work confirmation',windows,()=>fixture(async({dir,port,launch,stop})=>{
 const started=await launch();assert.equal(started.code,0,started.stderr);
 const statePath=join(dir,'work/server-process.json'),original=readFileSync(statePath),state=psJSON(statePath);
 try{
  state.startedUtcTicks=String(BigInt(state.startedUtcTicks)+1n);writeFileSync(statePath,JSON.stringify(state));
  const refused=await stop(true);assert.notEqual(refused.code,0);assert.match(refused.stderr,/start time differs/);assert.equal((await fetch(`http://127.0.0.1:${port}/api/status`)).status,200);
 }finally{writeFileSync(statePath,original);}
}));

test('friendly entry refuses unattended stop and offers actionable runtime guidance',windows,()=>fixture(async({dir,run})=>{
 const stop=await run(['-File',join(dir,'Start-WardNote.ps1'),'-NoBrowser','-Stop']);assert.notEqual(stop.code,0);assert.match(stop.stderr,/saved-work confirmation/);
 const advice=await run(['-Command',`[Console]::OutputEncoding=New-Object Text.UTF8Encoding($false); . ${quote(join(dir,'scripts/windows-launcher.ps1'))}; Get-WardNoteLauncherAdvice 'Portable runtime verification failed'`]);
 assert.equal(advice.code,0,advice.stderr);assert.match(advice.stdout,/Windows x64 portable ZIP/);assert.match(advice.stdout,/Preserve the original data folder/);
}));
