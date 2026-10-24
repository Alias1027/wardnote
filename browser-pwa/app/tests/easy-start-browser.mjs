// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Synthetic component environment; never opens an existing workspace or asks for microphone permission.
import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {languageCodes,LANGUAGES} from '../public/languages.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const qa=resolve(import.meta.dirname,'../../work/qa');mkdirSync(qa,{recursive:true});const temp=mkdtempSync(join(qa,'easy-start-'));process.env.TEMP=temp;process.env.TMP=temp;
const app=createApp({dataDir:join(temp,'server')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;
const checks=[],errors=[],external=[];let browser,page;
const mark=value=>{checks.push(value);console.log('PASS '+value);};
const mount=options=>page.evaluate(options=>window.mountEasy(options),options);
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.NOTE_BROWSER||undefined,args:['--disable-background-networking','--no-first-run']});
 const context=await browser.newContext({viewport:{width:1366,height:960}});page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url())&&!request.url().startsWith(base))external.push(request.url());});
 await page.route('**/easy-start-fixture.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/easy-start.css"></head><body><main id="fixture" style="width:min(760px,100%);padding:16px;margin:auto"></main></body></html>'}));
 await page.goto(base+'/easy-start-fixture.html');
 await page.evaluate(async()=>{
  const module=await import('/easy-start.js');
  window.mountEasy=({language='en',href='https://ward.example/patient/private?patient=SYNTHETIC_PRIVATE#account-secret',ua='Desktop Chrome',open=false,standalone=false,install=false,secure=true,realInspect=false}={})=>{
   window.easyBinding?.dispose();window.easyCalls={checks:[],copies:[],shares:[],installs:0,microphone:0};window.easyShareFailure='';window.easyInstallOutcome='accepted';window.easyCheckFailure=false;
   const env={location:{href},isSecureContext:secure,crypto:globalThis.crypto,indexedDB:globalThis.indexedDB,caches:globalThis.caches,MessageChannel:globalThis.MessageChannel,MediaRecorder:globalThis.MediaRecorder,matchMedia:()=>({matches:standalone}),navigator:{userAgent:ua,clipboard:{writeText:async value=>easyCalls.copies.push(value)},share:async value=>{if(window.easyShareFailure)throw new DOMException('Synthetic failure',window.easyShareFailure);easyCalls.shares.push(value);},locks:globalThis.navigator.locks,storage:globalThis.navigator.storage,serviceWorker:globalThis.navigator.serviceWorker,mediaDevices:{getUserMedia(){easyCalls.microphone++;throw new Error('Must not request microphone');}}}};
   window.easyEnv=env;window.easyInstallAvailable=install;
   const options={language,env,open,installAvailable:()=>window.easyInstallAvailable};document.querySelector('#fixture').innerHTML=module.easyStartHTML(options);
   const inspect=realInspect?undefined:async({probe})=>{easyCalls.checks.push(probe);if(window.easyCheckFailure)throw new Error('Synthetic unavailable');return {level:'ready',secure:true,crypto:true,locks:true,storage:{supported:true,writable:probe?true:null},offline:{supported:true,ready:true,controlled:true}};};
   window.easyBinding=module.bindEasyStart(document.querySelector('#fixture'),{...options,...(inspect?{inspect}:{}),onInstall:async()=>{easyCalls.installs++;window.easyInstallAvailable=false;return {outcome:window.easyInstallOutcome};}});
  };
 });
 await mount({});assert.deepEqual(await page.evaluate(()=>easyCalls),{checks:[],copies:[],shares:[],installs:0,microphone:0});
 await page.locator('[data-easy-start]>summary').click();await page.locator('[data-easy-level=prepare]').waitFor();assert.deepEqual(await page.evaluate(()=>easyCalls.checks),[false]);
 assert.equal(await page.locator('[data-easy-start]').getByText('Not checked',{exact:true}).count(),1);
 await page.locator('[data-easy-action=check]').click();await page.locator('[data-easy-level=ready]').waitFor();assert.deepEqual(await page.evaluate(()=>easyCalls.checks),[false,true]);
 mark('collapsed panel has no side effects; opening is read-only and explicit check alone runs the isolated write probe');
 await page.locator('[data-easy-action=copy]').click();await page.waitForFunction(()=>easyCalls.copies.length===1);await page.locator('[data-easy-action=share]').click();await page.waitForFunction(()=>easyCalls.shares.length===1);
 assert.deepEqual(await page.evaluate(()=>({copies:easyCalls.copies,shares:easyCalls.shares,microphone:easyCalls.microphone})),{copies:['https://ward.example/'],shares:[{title:'WardNote',url:'https://ward.example/'}],microphone:0});
 assert.ok(!(await page.locator('[data-easy-start]').innerText()).includes('SYNTHETIC_PRIVATE'));
 await page.evaluate(()=>window.easyShareFailure='AbortError');await page.locator('[data-easy-action=share]').click();await page.getByText('Sharing cancelled.',{exact:true}).waitFor();
 await page.evaluate(()=>{window.easyEnv.navigator.clipboard.writeText=async()=>{throw new Error('Denied');};});await page.locator('[data-easy-action=copy]').click();await page.getByText('Copy failed. Select the secure launch link above manually.',{exact:true}).waitFor();
 mark('copy/share require clicks, contain only HTTPS origin and handle cancellation or denied clipboard without raw errors');
 await page.evaluate(()=>{window.easyEnv.isSecureContext=false;window.easyEnv.navigator.clipboard.writeText=async value=>easyCalls.copies.push(value);});await page.locator('[data-easy-action=copy]').click();assert.equal(await page.evaluate(()=>easyCalls.copies.length),1);mark('security is checked again at click time');
 for(const href of ['http://localhost:8787/','https://localhost:8787/','https://127.0.0.1:8787/','http://192.168.1.3:8787/']){await mount({href,open:true});assert.equal(await page.locator('[data-easy-action=copy],[data-easy-action=share]').count(),0);}
 mark('loopback and insecure LAN URLs are never offered as phone launch links');
 await mount({ua:'iPhone Safari/605.1',open:true});await page.getByText(/iPhone \/ iPad: open in Safari/).waitFor();assert.equal(await page.locator('[data-easy-action=install]').count(),0);
 await mount({ua:'iPhone CriOS/131 Safari/605.1',open:true});await page.getByText(/Open this address in Safari first/).waitFor();
 await mount({ua:'Android Chrome/131',open:true});await page.getByText(/Android Chrome: open the/).waitFor();
 await mount({install:true,open:true});await page.locator('[data-easy-action=install]').click();await page.getByText('The browser accepted the install request. Check for the icon on your device.',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>easyCalls.installs),1);assert.equal(await page.locator('[data-easy-action=install]').count(),0);
 await mount({install:true,open:true});await page.evaluate(()=>window.easyInstallOutcome='dismissed');await page.locator('[data-easy-action=install]').click();await page.getByText('Installation cancelled. You can still use the browser.',{exact:true}).waitFor();
 await mount({install:true,standalone:true,open:true});await page.getByText('Running in a standalone window',{exact:true}).waitFor();assert.equal(await page.locator('[data-easy-action=install]').count(),0);
 mark('Safari, iOS alternate browser, Android, absent install event, acceptance, dismissal and standalone have distinct guidance');
 for(const code of languageCodes){
  await mount({language:code,ua:'Android Chrome',open:true,install:true});await page.evaluate(({locale,dir})=>{document.documentElement.lang=locale;document.documentElement.dir=dir;},LANGUAGES[code]);await page.locator('[data-easy-level=prepare]').waitFor();
  for(const width of [1366,390]){
   await page.setViewportSize({width,height:960});
   const audit=await page.locator('[data-easy-start]').evaluate(root=>({text:root.innerText,overflow:[root,...root.querySelectorAll('li,.easy-start-body,.actions,button,dd,dt')].filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+1).map(el=>el.tagName+'.'+el.className),pageOverflow:document.documentElement.scrollWidth>innerWidth+1}));
   if(code!=='zh')assert.ok(!/[\u3400-\u9fff\ufffd]/u.test(audit.text),code+' untranslated text');assert.deepEqual(audit.overflow,[],code+' '+width+' element overflow');assert.equal(audit.pageOverflow,false,code+' '+width+' page overflow');
   if(width===390&&['zh','en','ar','ur'].includes(code))await page.screenshot({path:join(qa,`easy-start-${code}-390.png`),fullPage:true});
  }
  mark(code+' guidance and actions fit desktop and 390px with native direction');
 }
 await mount({language:'en',open:true});await page.locator('[data-easy-level=prepare]').waitFor();await page.evaluate(()=>window.easyCheckFailure=true);await page.locator('[data-easy-action=check]').click();await page.getByText('The check did not finish. Try again.',{exact:true}).waitFor();assert.equal(await page.locator('[data-easy-action=check]').isDisabled(),false);
 await page.evaluate(()=>window.easyCheckFailure=false);await page.locator('[data-easy-action=check]').click();await page.locator('[data-easy-level=ready]').waitFor();mark('a failed capability check stays unready and can be retried');
 await page.evaluate(()=>window.easyBinding.dispose());await page.locator('[data-easy-action=copy]').click();assert.equal(await page.evaluate(()=>easyCalls.copies.length),0);mark('disposed bindings no longer handle actions after app rerender');
 await page.evaluate(()=>{document.documentElement.lang='en';document.documentElement.dir='ltr';});
 const before=await page.evaluate(async()=>(await indexedDB.databases()).map(value=>value.name).sort());
 await mount({open:true,realInspect:true,href:base});await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);const afterReadonly=await page.evaluate(async()=>(await indexedDB.databases()).map(value=>value.name).sort());assert.deepEqual(afterReadonly,before);
 await page.locator('[data-easy-action=check]').click();await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);await page.waitForFunction(async()=>!(await indexedDB.databases()).some(value=>value.name?.startsWith('wardnote-readiness-probe-')));
 const afterProbe=await page.evaluate(async()=>(await indexedDB.databases()).map(value=>value.name).sort());assert.deepEqual(afterProbe,before);assert.equal(await page.evaluate(()=>easyCalls.microphone),0);
 mark('real inspectDevice integration preserves database inventory and cleans its isolated probe without microphone requests');
 // Exercise the real app's integration separately from the synthetic component fixture.
 await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('#auth-form').waitFor();assert.equal(await page.locator('[data-easy-start]').count(),1);
 const password='synthetic-easy-start-password';await page.locator('#username').fill('easy.browser');await page.locator('#password').fill(password);await page.locator('#repeat').fill(password);
 const formValues=()=>page.locator('#auth-form').evaluate(form=>Object.fromEntries(new FormData(form)));const originalForm=await formValues();
 await page.locator('[data-easy-start]>summary').click();await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);await page.locator('[data-easy-action=check]').click();await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);assert.deepEqual(await formValues(),originalForm);
 await page.evaluate(()=>{window.syntheticInstallPrompts=0;const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=async()=>{window.syntheticInstallPrompts++;};event.userChoice=Promise.resolve({outcome:'dismissed'});window.dispatchEvent(event);});
 await page.locator('[data-easy-action=install]').click();await page.waitForFunction(()=>window.syntheticInstallPrompts===1);assert.deepEqual(await formValues(),originalForm);assert.equal(await page.locator('[data-easy-action=install]').count(),0);
 for(const code of ['en','ur','zh']){await page.locator('[data-ui-language]').selectOption(code);await page.waitForFunction(locale=>document.documentElement.lang===locale,LANGUAGES[code].locale);assert.deepEqual(await formValues(),originalForm,code+' pre-login inputs preserved');}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:join(qa,'easy-start-auth-390.png'),fullPage:true});
 mark('real 390px login form keeps all entered values through device checks, synthetic install events and language changes');
 await page.locator('#auth-form button[type=submit]').click();await page.locator('.shell').waitFor();
 const recordsBefore=await page.evaluate(async()=>JSON.stringify(await(await import('/offline-api.js')).device.state()));
 await page.locator('[data-action=menu]').click();await page.locator('[data-view=settings]').click();await page.locator('[data-easy-start][open]').waitFor();await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);
 await page.locator('[data-easy-action=check]').click();await page.waitForFunction(()=>!document.querySelector('[data-easy-action=check]').disabled);
 for(const code of ['en','ur']){await page.locator('[data-ui-language]').selectOption(code);await page.waitForFunction(locale=>document.documentElement.lang===locale,LANGUAGES[code].locale);assert.equal(await page.locator('[data-easy-start]').count(),1);assert.ok(!/[\u3400-\u9fff\ufffd]/u.test(await page.locator('[data-easy-start]').innerText()));}
 const recordsAfter=await page.evaluate(async()=>JSON.stringify(await(await import('/offline-api.js')).device.state()));assert.equal(recordsAfter,recordsBefore);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.locator('[data-easy-start]').screenshot({path:join(qa,'easy-start-settings-ur-390.png')});
 mark('real settings panel survives language rerenders, fits 390px RTL and leaves the synthetic account records unchanged');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);mark('no page errors or external requests, including QR services');
}catch(error){errors.push(error.message);console.error(error);await page?.screenshot({path:join(qa,'easy-start-failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}
finally{
 writeFileSync(join(qa,'easy-start-browser-results.json'),JSON.stringify({time:new Date().toISOString(),checks,errors,externalRequests:external.length,synthetic:true,actualPWAInstallationVerified:false,physicalMobileDeviceVerified:false},null,2));
 await browser?.close();await app.close();const path=relative(qa,temp);if(!path||path==='..'||path.startsWith('..'+sep)||resolve(qa,path)!==temp)throw new Error('Unsafe cleanup path');rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:300});
}
