// Same-origin desktop storage/asset upgrade simulation, NOT an Android package install.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..'),logs=join(root,'logs'),profile=join(root,'.test-tmp','upgrade-profile');
const oldWeb=process.env.WARDNOTE_PREVIOUS_ANDROID_WEB;
if(!oldWeb)throw Error('Set WARDNOTE_PREVIOUS_ANDROID_WEB to the retained previous source web directory.');
mkdirSync(profile,{recursive:true});process.env.TEMP=join(root,'.test-tmp');process.env.TMP=process.env.TEMP;
let assetRoot=resolve(oldWeb),context,page;const checks=[],errors=[];const mark=s=>{checks.push(s);console.log('PASS '+s);};
const server=createServer((req,res)=>{const path=decodeURIComponent(req.url.split('?')[0]),file=resolve(assetRoot,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(assetRoot+sep)){res.writeHead(403).end();return;}try{res.writeHead(200,{'Cache-Control':'no-store','Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'}[extname(file)]||'application/octet-stream'}).end(readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,password='Synthetic-upgrade-password';
const launch=async()=>{
 const ctx=await chromium.launchPersistentContext(profile,{executablePath:process.env.NOTE_BROWSER_EXECUTABLE||join(process.env.ProgramFiles||'C:/Program Files','Google/Chrome/Application/chrome.exe'),headless:true,viewport:{width:390,height:844}});
 await ctx.addInitScript(()=>{window.WardNoteNative={postMessage(raw){const {id,method}=JSON.parse(raw);queueMicrotask(()=>window.__wardnoteNativeResult({id,ok:true,result:method==='info'?{platform:'android',assets:true}:{}}));}};});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(origin))errors.push('Unexpected network request');});await p.goto(origin);await p.locator('#auth-form').waitFor();return {ctx,p};
};
try{
 ({ctx:context,p:page}=await launch());
 const before=await page.evaluate(async({password})=>{
  const {DeviceVault,digest}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const snapshots={};
  for(const mode of ['personal','institution']){
   const v=new DeviceVault();v.selectMode(mode);await authenticateAccount(v,{username:'upgrade.test',password,create:true});
   await v.mutate(s=>{s.records.push({id:'patient-'+mode,type:'encounter',encounterId:'',version:1,data:{displayName:'Synthetic '+mode}});s.records.push({id:'memo-'+mode,type:'memo',encounterId:'patient-'+mode,version:2,data:{text:'Synthetic preserved history'}});s.revisions['memo-'+mode]=[{version:1,data:{text:'Earlier synthetic text'}}];});
   if(mode==='personal'){
    await v.mutate(s=>s.records.push({id:'long-audio',type:'recording',encounterId:'patient-personal',version:1,data:{mime:'audio/wav',title:'Synthetic 18 MiB byte fixture',finalized:false}}));
    const chunk=new Uint8Array(1024*1024);chunk.fill(37);for(let i=0;i<18;i++)await v.chunk('long-audio',i,chunk);
    await v.mutate(s=>{s.records.find(x=>x.id==='long-audio').data.finalized=true;});
   }
   const s=await v.state();snapshots[mode]={records:s.records,revisions:s.revisions,audio:mode==='personal'?await digest(new Uint8Array(await(await v.audio('long-audio')).arrayBuffer())):null};v.lock();
  }return snapshots;
 },{password});
 await context.close();context=null;
 assetRoot=join(root,'web');({ctx:context,p:page}=await launch());
 assert.ok((await page.locator('#app').innerText()).includes('Android '+JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version));
 const after=await page.evaluate(async({password})=>{
  const {DeviceVault,digest}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const snapshots={};
  for(const mode of ['personal','institution']){const v=new DeviceVault();v.selectMode(mode);await authenticateAccount(v,{username:'upgrade.test',password});const s=await v.state();snapshots[mode]={records:s.records,revisions:s.revisions,audio:mode==='personal'?await digest(new Uint8Array(await(await v.audio('long-audio')).arrayBuffer())):null};if(await v.allowed())throw Error('Unexpected network authorization');v.lock();}return snapshots;
 },{password});
 assert.deepEqual(after,before);mark('Cold browser restart from retained previous assets to current assets preserves both account modes, records, revisions and 18 MiB audio');
 const backup=await page.evaluate(async({password})=>{
  const {DeviceVault,digest}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const v=new DeviceVault();await authenticateAccount(v,{username:'upgrade.test',password});const files=[];await v.backupSegmented(async(blob,name)=>files.push(new File([blob],name)));const verified=await v.verifyBackup(files,password);const partSizes=files.filter(f=>f.name.endsWith('.wnpart')).map(f=>f.size);v.lock();
  const restored=new DeviceVault();await authenticateAccount(restored,{username:'restored.long',password,file:files});const hash=await digest(new Uint8Array(await(await restored.audio('long-audio')).arrayBuffer()));restored.lock();return {verified,partSizes,hash};
 },{password});
 assert.ok(backup.partSizes.length>=2);assert.ok(backup.partSizes.every(n=>n<=16*1024*1024));assert.equal(backup.hash,before.personal.audio);
 mark('Multi-part backup above a 16 MiB part boundary verifies and restores exact synthetic audio bytes');
 assert.deepEqual(errors,[]);mark('No external traffic or page errors; network authorization stays off after restart');
}catch(e){errors.push(e.stack);console.error(e);process.exitCode=1;}
finally{await context?.close();server.close();writeFileSync(join(logs,'android-upgrade-results.json'),JSON.stringify({time:new Date().toISOString(),environment:'Desktop Chromium persistent-profile asset/storage upgrade simulation; not Android installer/device validation',checks,errors},null,2));if(profile.startsWith(join(root,'.test-tmp')+sep))rmSync(profile,{recursive:true,force:true});}
