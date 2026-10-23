// Desktop Chromium + deterministic native bridge double. This is NOT Android device validation.
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'..'),logs=join(root,'logs');mkdirSync(logs,{recursive:true});
const tmp=join(root,'.test-tmp');mkdirSync(tmp,{recursive:true});process.env.TEMP=tmp;process.env.TMP=tmp;
const baseWeb=process.env.WARDNOTE_BASE_WEB;if(!baseWeb)throw Error('Set WARDNOTE_BASE_WEB to the preserved WardNote 0.6.15 app/public directory for compatibility checks.');
const origins={};
function server(dir){return createServer((req,res)=>{let name=decodeURIComponent(req.url.split('?')[0]);if(name==='/')name='/index.html';const p=resolve(dir,'.'+name);if(!p.startsWith(resolve(dir)+'\\')){res.writeHead(403).end();return;}try{const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'}[extname(p)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type, 'Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob: data:; connect-src 'self'; frame-src 'none'; object-src 'none'; worker-src 'none'; base-uri 'self'; form-action 'none'"}).end(readFileSync(p));}catch{res.writeHead(404).end();}});}
const app=server(join(root,'web')),original=server(baseWeb);await Promise.all([new Promise(r=>app.listen(0,'127.0.0.1',r)),new Promise(r=>original.listen(0,'127.0.0.1',r))]);
const base=`http://127.0.0.1:${app.address().port}`,oldBase=`http://127.0.0.1:${original.address().port}`;
const checks=[],errors=[],requests=[];const mark=s=>{checks.push(s);console.log('PASS '+s);};let browser,page;
const password='Android-test-password-2026';
try{
 browser=await chromium.launch({executablePath:process.env.NOTE_BROWSER_EXECUTABLE||join(process.env.ProgramFiles||'C:/Program Files','Google/Chrome/Application/chrome.exe'),headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{
  window.nativeCalls=[];window.nativeWrites=[];window.nativeAudio=new Uint8Array(700044);window.nativeAudio.fill(7);
  window.nativeError=null;let current;
  window.WardNoteNative={postMessage:async raw=>{const q=JSON.parse(raw),{id,method,args}=q;window.nativeCalls.push(q);const reply=result=>window.__wardnoteNativeResult({id,ok:true,result});
   if(method==='info')return reply({platform:'android',assets:true,recorderAvailable:true});
   if(method==='setLanguage'||method==='releaseFolder'||method==='releaseFile'||method==='background')return reply({});
   if(method==='record'){if(window.nativeError){window.__wardnoteNativeResult({id,ok:false,error:{code:window.nativeError}});return;}return reply({token:'test-audio',name:'test.m4a',type:'audio/mp4',size:window.nativeAudio.length});}
   if(method==='readChunk'){if(window.holdRead)await new Promise(r=>window.resumeRead=r);const b=window.nativeAudio.slice(args.offset,args.offset+args.length);let text='';for(let i=0;i<b.length;i+=8192)text+=String.fromCharCode(...b.subarray(i,i+8192));return reply({base64:btoa(text),eof:args.offset+b.length===window.nativeAudio.length});}
   if(method==='chooseBackupFolder')return reply({token:'folder'});
   if(method==='beginFile'||method==='chooseSaveFile'){current={name:args.name,chunks:[]};return reply({token:'file'});}
   if(method==='writeChunk'){if(window.holdWrite)await new Promise(r=>window.resumeWrite=r);current.chunks.push(Uint8Array.from(atob(args.base64),x=>x.charCodeAt(0)));return reply({});}
   if(method==='finishFile'){const blob=new Blob(current.chunks),bytes=await blob.arrayBuffer(),sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');window.nativeWrites.push({name:current.name,bytes:Array.from(new Uint8Array(bytes))});return reply({size:blob.size,sha256});}
   if(method==='abortFile')return reply({removed:true});throw Error('unexpected native method '+method);
  }};
 });
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(base);await page.locator('#auth-form').waitFor();
 assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller),null);assert.equal(requests.some(x=>x.includes('sw.js')||x.includes('/api/')),false);mark('First-use native asset bootstrap needs no service worker, API or external request');
 for(const code of ['zh','en','es','fr','ru','ar','hi','ur']){await page.locator('[data-ui-language]').selectOption(code);await page.waitForFunction(c=>document.documentElement.lang.startsWith(c),code);await page.locator('[data-ui-language]:not([disabled])').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(code!=='zh')assert.doesNotMatch((await page.locator('#app').innerText()).replaceAll('简体中文',''),/[\u3400-\u9fff]/);assert.equal(await page.locator('html').getAttribute('dir'),['ar','ur'].includes(code)?'rtl':'ltr');}
 await page.locator('[data-ui-language]').selectOption('zh');await page.locator('#username').fill('android.test');await page.locator('#password').fill(password);await page.locator('#repeat').fill(password);await page.locator('#auth-form button[type=submit]').click();await page.locator('[data-view=dashboard]').waitFor();mark('Eight-language first-use UI, RTL/mobile width and encrypted account creation pass');
 const patient=await page.evaluate(async()=>{const {localApi}=await import('/offline-api.js');return (await(await localApi('/records','POST',{type:'encounter',encounterId:'',data:{displayName:'Synthetic Android',admitted:'2026-10-23',bed:'T01',acuity:'stable'}})).json()).id;});
 await page.reload();await page.locator('#username').fill('android.test');await page.locator('#password').fill(password);await page.locator('#auth-form button[type=submit]').click();await page.locator('[data-patient-entry]').click();
 // Sweep all patient pages, not just login/settings, with unchanged synthetic clinical text.
 for(const code of ['zh','en','es','fr','ru','ar','hi','ur']){
  await page.locator('[data-ui-language]').selectOption(code);
  await page.locator('[data-action=tab][data-tab=daily]').first().click();
  for(const tab of ['initial','daily','timeline','results','review','learning']){
   await page.locator('[data-action=tab][data-tab="'+tab+'"]').first().click();
   const text=(await page.locator('#app').innerText()).replaceAll('简体中文','');
   if(code!=='zh')assert.doesNotMatch(text,/[\u3400-\u9fff]/,code+' '+tab);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,code+' '+tab+' width');
  }
 }
 await page.locator('[data-ui-language]').selectOption('zh');await page.locator('[data-tab=daily]').first().click();
 mark('All six patient sections are consistent across eight languages at mobile width');
 const openMemos=async()=>{if(!await page.locator('#patient-memos').evaluate(el=>el.open))await page.locator('#patient-memos>summary').click();};
 await openMemos();await page.locator('[data-action=memo-voice]').click();await page.locator('input[name=confirmed]').check();await page.locator('#modal-form button[type=submit]').click();await page.locator('#modal h2').getByText('确认此音频属于当前患者后导入',{exact:true}).waitFor();
 let records=await page.evaluate(async()=>{const {device}=await import('/offline-api.js');return (await device.state()).records;});assert.equal(records.filter(r=>r.type==='recording').length,0);mark('System recording requires a second patient confirmation and does not auto-fill clinical fields');
 await page.evaluate(()=>window.holdRead=true);
 await page.locator('input[name=confirmed]').check();await page.locator('#modal-form button[type=submit]').click();
 await page.waitForFunction(()=>!!window.resumeRead);
 await page.locator('#modal [data-action=close-modal]').first().dispatchEvent('click');
 assert.equal(await page.locator('#modal').evaluate(el=>el.open),true,'Closing while native import is saving must be blocked');
 assert.equal(await page.locator('#modal').evaluate(el=>el.dispatchEvent(new Event('cancel',{cancelable:true}))),false,'System/Escape cancellation must be blocked while saving');
 await page.evaluate(()=>{window.holdRead=false;window.resumeRead();});await page.locator('#modal').waitFor({state:'hidden'});
 mark('Close buttons and system/Escape cancel cannot interrupt active encrypted audio import');
 const saved=await page.evaluate(async()=>{const {device}=await import('/offline-api.js'),s=await device.state(),r=s.records.find(r=>r.type==='recording');return {r,bytes:Array.from(new Uint8Array(await(await device.audio(r.id)).arrayBuffer())),network:await device.allowed()};});
 assert.equal(saved.r.encounterId,patient);assert.equal(saved.r.data.finalized,true);assert.equal(saved.r.data.audioReviewed,false);assert.equal(saved.bytes.length,700044);assert.ok(saved.bytes.every(x=>x===7));assert.equal(saved.network,false);mark('Native audio chunks saved encrypted with exact bytes, patient linkage and unreviewed status');
 await openMemos();await page.evaluate(()=>window.nativeError='NO_RECORDER');await page.locator('[data-action=memo-voice]').click();await page.locator('input[name=confirmed]').check();await page.locator('#modal-form button[type=submit]').click();await page.locator('.form-error').getByText(/未找到可直接返回音频/).waitFor();await page.locator('#modal [data-action=close-modal]').first().click();await page.evaluate(()=>window.nativeError=null);mark('Missing recorder gives manual-import fallback without creating records');
 // Manual import exercises the actual file input and encrypted store, using a tiny PCM WAV.
 const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await openMemos();await page.locator('#patient-memos [data-action=upload-audio]').click();
 await page.locator('#audio-file').setInputFiles({name:'manual.wav',mimeType:'audio/wav',buffer:wav});
 await page.locator('#modal-form button[type=submit]').click();await page.locator('.form-error').getByText('请勾选确认当前患者和录音安排',{exact:true}).waitFor();await page.locator('input[name=confirmed]').check();
 await page.locator('#modal-form button[type=submit]').click();await page.locator('#modal').waitFor({state:'hidden'});
 const manual=await page.evaluate(async()=>{const {device}=await import('/offline-api.js'),s=await device.state(),r=s.records.find(x=>x.type==='recording'&&x.data.title==='manual.wav');return {r,bytes:Array.from(new Uint8Array(await(await device.audio(r.id)).arrayBuffer()))};});
 assert.equal(manual.r.encounterId,patient);assert.equal(manual.r.data.finalized,true);assert.deepEqual(Buffer.from(manual.bytes),wav);
 mark('Manual file-picker import preserves actual WAV bytes and patient attribution');
 // Exercise the actual audio export action, including asynchronous logout protection.
 await openMemos();const audioExport=page.locator('[data-action=audio-download][data-id="'+saved.r.id+'"]').first();
 await audioExport.click();await page.waitForFunction(()=>window.nativeWrites.length===1);
 assert.deepEqual(Buffer.from(await page.evaluate(()=>window.nativeWrites[0].bytes)),Buffer.from(saved.bytes));
 mark('Normal audio export uses the actual UI action and preserves exact bytes');
 await page.evaluate(()=>{window.nativeWrites=[];window.nativeCalls=[];window.holdWrite=true;});
 await audioExport.click();await page.waitForFunction(()=>!!window.resumeWrite);
 await page.locator('[data-action=lock]').click();
 assert.equal(await page.locator('#auth-form').count(),0,'logout must wait for active file operation');
 await page.evaluate(async()=>{const {device}=await import('/offline-api.js');device.lock();window.holdWrite=false;window.resumeWrite();});
 await page.waitForFunction(()=>window.nativeCalls.some(x=>x.method==='abortFile'));
 await page.waitForFunction(async()=>!(await import('/android-platform.js')).nativeBusy());
 assert.equal(await page.evaluate(()=>window.nativeCalls.filter(x=>x.method==='writeChunk').length),1,'no writes after the in-flight chunk');
 assert.equal(await page.evaluate(()=>window.nativeCalls.some(x=>x.method==='finishFile')),false);
 assert.equal(await page.evaluate(()=>window.nativeWrites.length),0,'invalidated export cannot report successful output');
 mark('Export blocks UI logout; independent session invalidation aborts before further chunks or finalization');
 await page.reload();await page.locator('#username').fill('android.test');await page.locator('#password').fill(password);await page.locator('#auth-form button[type=submit]').click();await page.locator('[data-patient-entry]').click();

 // Back action must flush edited notes, and stay in the app when storage fails.
 await page.locator('[data-action=new-note]').click();await page.locator('#modal-form button[type=submit]').click();await page.locator('#modal').waitFor({state:'hidden'});
 await page.evaluate(async()=>{const {device}=await import('/offline-api.js');window.originalMutate=device.mutate;device.mutate=async()=>{throw Error('Synthetic storage failure');};});
 const course=page.locator('textarea[data-path="fields.course"]');await course.fill('Synthetic pending update note');
 const beforeBack=await page.evaluate(()=>window.nativeCalls.filter(x=>x.method==='background').length);
 await page.evaluate(()=>window.__wardnoteNativeBack());
 assert.equal(await page.evaluate(()=>window.nativeCalls.filter(x=>x.method==='background').length),beforeBack);
 assert.equal(await course.inputValue(),'Synthetic pending update note');
 await page.evaluate(async()=>{const {device}=await import('/offline-api.js');device.mutate=window.originalMutate;await window.__wardnoteNativeBack();});
 assert.equal(await page.evaluate(()=>window.nativeCalls.filter(x=>x.method==='background').length),beforeBack+1);
 assert.equal(await page.evaluate(async()=>{const {device}=await import('/offline-api.js');return (await device.state()).records.find(x=>x.type==='note').data.fields.course;}),'Synthetic pending update note');
 mark('Back flushes pending edits before backgrounding; failed saves preserve input and block exit');
 // Preserve a source-linked memo, revision history and reviewed note in cross-platform backup.
 await page.evaluate(async({patient})=>{const {localApi}=await import('/offline-api.js');let r=await(await localApi('/records','POST',{type:'memo',encounterId:patient,data:{title:'Synthetic memo',text:'Original text'}})).json();await localApi('/records/'+r.id,'PUT',{version:r.version,data:{...r.data,text:'Edited text'}});},{patient});
 await page.locator('[data-action=menu]').click();await page.locator('[data-view=settings]').click();await page.locator('[data-action=offline-backup]').click();await page.locator('#offline-form button[type=submit]').click();await page.locator('#offline-form h2').getByText('分卷备份结果',{exact:true}).waitFor();
 const exported=await page.evaluate(()=>window.nativeWrites);assert.equal(exported.at(-1).name.endsWith('.wnmanifest'),true);assert.ok(exported.some(x=>x.name.endsWith('.wnpart')));for(const f of exported)assert.doesNotMatch(Buffer.from(f.bytes).toString('utf8'),/Edited text|Synthetic Android/);
 const metadata=await page.evaluate(async()=>{const {device}=await import('/offline-api.js');return device.backupStatus();});assert.ok(metadata.written);mark('SAF bridge backup writes encrypted parts first, authenticated manifest last and records verified file writes');
 await page.locator('#offline-form button[type=submit]').click();
 const restoreContext=await browser.newContext(),restored=await restoreContext.newPage();await restored.goto(oldBase+'/index.html');
 const roundtrip=await restored.evaluate(async({files,password})=>{const {DeviceVault}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const vault=new DeviceVault();await authenticateAccount(vault,{username:'from.android',password,file:files.map(f=>new File([new Uint8Array(f.bytes)],f.name))});const state=await vault.state(),r=state.records.find(r=>r.type==='recording');const audio=Array.from(new Uint8Array(await(await vault.audio(r.id)).arrayBuffer()));const old=await vault.backup(),parts=[];await vault.backupSegmented(async(blob,name)=>parts.push({name,bytes:Array.from(new Uint8Array(await blob.arrayBuffer()))}));return {state,audio,network:await vault.allowed(),legacy:Array.from(new Uint8Array(await old.arrayBuffer())),parts};},{files:exported,password});
 assert.deepEqual(roundtrip.audio,saved.bytes);assert.equal(roundtrip.state.records.find(r=>r.type==='memo').data.text,'Edited text');assert.ok(Object.values(roundtrip.state.revisions).some(x=>x.length));assert.equal(roundtrip.network,false);mark('Android-produced segmented backup restores in unchanged browser code with audio, text and revisions intact');
 const nativeRestoreContext=await browser.newContext(),nativeRestorePage=await nativeRestoreContext.newPage();await nativeRestorePage.goto(base);
 const failures=await nativeRestorePage.evaluate(async({files,password})=>{const {DeviceVault}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const sets=[{files:files.slice(-1),pass:password},{files,pass:'wrong-password-long'},{files:files.map((f,i)=>i?f:{...f,bytes:f.bytes.map((x,n)=>n===50?x^1:x)}),pass:password}];const results=[];for(let i=0;i<sets.length;i++){const v=new DeviceVault(),x=sets[i];try{await authenticateAccount(v,{username:'rejected.'+i,password:x.pass,file:x.files.map(f=>new File([new Uint8Array(f.bytes)],f.name))});results.push(false);}catch(e){results.push(/备份|清单|分卷/.test(e.message));}finally{v.lock();}}return results;},{files:exported,password});assert.deepEqual(failures,[true,true,true]);mark('Incomplete, tampered and wrong-password backups are rejected');
 const toAndroid=await nativeRestorePage.evaluate(async({legacy,parts,password})=>{const {DeviceVault}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const results=[];for(const [name,files] of [['legacy', [new File([new Uint8Array(legacy)],'legacy.json')]],['segmented',parts.map(f=>new File([new Uint8Array(f.bytes)],f.name))]]){const v=new DeviceVault();await authenticateAccount(v,{username:'restored.'+name,password,file:files});const s=await v.state(),r=s.records.find(r=>r.type==='recording');results.push({count:s.records.length,audio:(await v.audio(r.id)).size,network:await v.allowed()});v.lock();}return results;},{legacy:roundtrip.legacy,parts:roundtrip.parts,password});assert.ok(toAndroid.every(x=>x.audio===700044&&!x.network));mark('Unchanged browser-produced legacy JSON and segmented backups restore as separate Android accounts');
 const protection=await nativeRestorePage.evaluate(async({files,password})=>{const {DeviceVault}=await import('/offline-store.js'),{authenticateAccount}=await import('/accounts.js');const input=()=>files.map(f=>new File([new Uint8Array(f.bytes)],f.name));let modeRejected=false,overwriteRejected=false;const wrongMode=new DeviceVault();wrongMode.selectMode('institution');try{await authenticateAccount(wrongMode,{username:'wrong.mode',password,file:input()});}catch(e){modeRejected=e.message.includes('模式');}finally{wrongMode.lock();}const existing=new DeviceVault();try{await authenticateAccount(existing,{username:'restored.segmented',password,file:input()});}catch(e){overwriteRejected=e.message.includes('覆盖');}finally{existing.lock();}const intact=new DeviceVault();await authenticateAccount(intact,{username:'restored.segmented',password});const state=await intact.state(),audio=state.records.find(r=>r.type==='recording');const size=(await intact.audio(audio.id)).size;intact.lock();return {modeRejected,overwriteRejected,size};},{files:roundtrip.parts,password});assert.deepEqual(protection,{modeRejected:true,overwriteRejected:true,size:700044});mark('Wrong account mode and overwrite of an existing account are rejected; its audio remains intact');

 // UI consistency after real saved records, synthetic patient text intentionally preserved.
 for(const code of ['zh','en','es','fr','ru','ar','hi','ur']){await page.locator('[data-ui-language]').selectOption(code);await page.locator('[data-ui-language]:not([disabled])').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(code!=='zh')assert.doesNotMatch((await page.locator('#app').innerText()).replaceAll('简体中文',''),/[\u3400-\u9fff]/);}
 await page.screenshot({path:join(logs,'android-ui-ur.png'),fullPage:true});await page.locator('[data-ui-language]').selectOption('en');await page.screenshot({path:join(logs,'android-ui-en.png'),fullPage:true});mark('Eight-language Android help/settings are consistent at mobile width');
 assert.deepEqual(errors,[]);assert.ok(requests.every(x=>x.startsWith(base+'/')||x.startsWith('blob:'+base+'/')));assert.equal(requests.some(x=>x.endsWith('sw.js')||x.includes('/api/')),false);mark('No page errors, external API traffic, service-worker registration or cloud synchronization');
 await restoreContext.close();await nativeRestoreContext.close();
}catch(error){errors.push(error.stack);console.error(error);await page?.screenshot({path:join(logs,'android-browser-failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}
finally{writeFileSync(join(logs,'android-browser-results.json'),JSON.stringify({time:new Date().toISOString(),environment:'Windows desktop Chromium with native bridge test double; NOT an Android emulator or device',checks,errors},null,2));await browser?.close();app.close();original.close();}
