import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {localJson,reloadAndUnlock,failDeviceWrites} from './browser-support.mjs';
import {languageCodes} from '../public/languages.js';
import {translate} from '../public/locale-core.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const qa=resolve(import.meta.dirname,'../../work/qa');mkdirSync(qa,{recursive:true});
const temp=mkdtempSync(join(qa,'conversation-'));process.env.TEMP=temp;process.env.TMP=temp;
const app=createApp({dataDir:join(temp,'server')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
let browser,page;const checks=[],errors=[],remote=[];const mark=s=>{checks.push(s);console.log('PASS '+s);};
const source='Doctor: Good morning.\nPatient: My daughter moved out. I live alone.\nPatient: My brother had a heart attack last year.\nDoctor: If fever persists, we may consider further tests.\nSpeaker A: [inaudible] 15 or 50 mg?';
const all=async()=>(await localJson(page,'/records')).records;
const open=async()=>{if(!await page.locator('#float-voice').count())await page.locator('.tool-rail [data-panel=voice]').click();};
const generate=async()=>{await page.locator('[data-action=voice-candidates]').click();await page.locator('.voice-review-item').first().waitFor();};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.NOTE_BROWSER||undefined,args:['--disable-background-networking','--no-first-run']});
 const context=await browser.newContext({viewport:{width:1366,height:1000}});
 await context.route('**/*',route=>{const url=route.request().url();if(url.startsWith(base+'/')||url.startsWith('data:')||url.startsWith('blob:'))return route.continue();remote.push(url);return route.abort();});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
 await page.locator('#username').fill('test-user');await page.locator('#password').fill('synthetic-conversation-password');await page.locator('#repeat').fill('synthetic-conversation-password');await page.locator('#auth-form button[type=submit]').click();await page.locator('.shell').waitFor();
 await page.locator('[data-action=new-patient]').first().click();await page.locator('#m-displayName').fill('Synthetic conversation');await page.locator('#modal button[type=submit]').click();await open();
 assert.equal(await page.locator('#voice-input-mode').inputValue(),'dictation');await page.locator('#voice-input-mode').selectOption('conversation');await page.locator('#voice-source').fill(source);await generate();
 assert.equal(await page.locator('.voice-review-item').count(),5);assert.equal(await page.locator('.voice-candidate').count(),0);assert.equal((await all()).filter(r=>['note','memo','background'].includes(r.type)).length,0);mark('Conversation separates source turns for review without creating clinical records');
 for(const lang of languageCodes){
  await page.locator('[data-ui-language]').selectOption(lang);await page.waitForFunction(()=>!document.querySelector('[data-ui-language]')?.disabled);
  assert.equal(await page.locator('#voice-input-mode option:checked').textContent(),translate('医患对话',lang));assert.equal(await page.locator('.voice-held > summary').textContent(),translate('暂不纳入记录',lang)+' · 5');assert.equal(await page.locator('#voice-source').inputValue(),source);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('html').getAttribute('dir'),['ar','ur'].includes(lang)?'rtl':'ltr');
  await page.screenshot({path:join(qa,'conversation-'+lang+'.png')});await page.setViewportSize({width:1366,height:1000});
 }
 mark('Eight localized modes and review controls preserve original text and fit mobile widths, including RTL');
 await page.locator('[data-ui-language]').selectOption('en');await page.waitForFunction(()=>!document.querySelector('[data-ui-language]')?.disabled);
 await page.locator('.voice-review-item').nth(1).locator('[data-action=voice-promote]').click();await page.locator('.voice-candidate').waitFor();
 assert.equal(await page.locator('.voice-candidate input').isChecked(),false);assert.equal(await page.locator('.voice-candidate select').inputValue(),'');
 await page.locator('.voice-candidate select').selectOption('initial.social');await page.locator('.voice-candidate input').check();
 await page.locator('.voice-candidate textarea').fill('Patient: My daughter moved out. I live alone. [reviewed]');assert.equal(await page.locator('.voice-candidate input').isChecked(),false);await page.locator('.voice-candidate input').check();
 await failDeviceWrites(page,true);await page.locator('[data-action=voice-apply]').click();assert.equal((await all()).filter(r=>r.type==='note').length,0);await failDeviceWrites(page,false);
 await page.locator('[data-action=voice-apply]').click();await page.locator('.voice-candidate').waitFor({state:'hidden'});
 let records=await all();assert.equal(records.find(r=>r.type==='note').data.fields.social,'Patient: My daughter moved out. I live alone. [reviewed]');assert.equal(records.find(r=>r.type==='voiceDraft').data.proposals.length,4);await open();assert.equal(await page.locator('.voice-review-item').count(),4);assert.equal(await page.locator('[data-action=voice-promote]').first().isEnabled(),false);mark('Promote, choose destination and check before apply; failed saves are retryable, held original remains afterward');
 await context.setOffline(true);await reloadAndUnlock(page,'synthetic-conversation-password');await page.locator('[data-patient-entry]').click();await open();assert.equal(await page.locator('#voice-source').inputValue(),source);assert.equal(await page.locator('#voice-input-mode').inputValue(),'conversation');assert.equal(await page.locator('.voice-review-item').count(),4);mark('Offline reload retains mode, full transcript, held excerpts and reviewed clinical text');
 await page.locator('#voice-input-mode').selectOption('dictation');assert.equal(await page.locator('.candidate-list').count(),0);await page.locator('#voice-source').fill('Memo: Retain original');await page.locator('[data-action=voice-candidates]').click();await page.locator('.voice-candidate').waitFor();assert.equal(await page.locator('.voice-candidate select').inputValue(),'memo.text');
 await page.locator('#voice-input-mode').selectOption('conversation');assert.equal(await page.locator('.candidate-list').count(),0);assert.equal(await page.locator('#voice-source').inputValue(),'Memo: Retain original');mark('Changing mode invalidates old candidates; explicit dictation routing remains available offline');
 assert.deepEqual(remote,[]);assert.deepEqual(errors,[]);
}catch(error){errors.push(error.stack||error.message);console.error(error);process.exitCode=1;await page?.screenshot({path:join(qa,'conversation-failure.png'),fullPage:true}).catch(()=>{});}
finally{writeFileSync(join(qa,'conversation-results.json'),JSON.stringify({checks,errors,externalRequests:remote.length,scope:'Synthetic desktop Chromium and simulated mobile viewport; no real ASR, physical device or clinical validation'},null,2));await browser?.close();await app.close();const rel=relative(qa,temp);if(!rel||rel.startsWith('..'+sep)||rel==='..')throw Error('Unsafe cleanup');rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:300});}
