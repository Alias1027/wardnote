// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {localJson} from './browser-support.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const qa=resolve(import.meta.dirname,'../../work/qa');mkdirSync(qa,{recursive:true});
const temp=mkdtempSync(join(qa,'capture-storage-'));const app=createApp({dataDir:join(temp,'data'),config:{}});
await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const checks=[],errors=[],requests=[];let browser,page;
const mark=s=>{checks.push(s);console.log('PASS '+s);};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.NOTE_BROWSER||undefined,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--disable-background-networking']});
 const context=await browser.newContext({permissions:['microphone']});page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/api/'))requests.push(r.url());});
 await page.goto('http://127.0.0.1:'+app.server.address().port);await page.locator('#username').fill('capture-user');await page.locator('#password').fill('synthetic-storage-password');await page.locator('#repeat').fill('synthetic-storage-password');await page.locator('#auth-form button[type=submit]').click();await page.locator('.shell').waitFor();
 await page.locator('[data-action=new-patient]').first().click();await page.locator('#m-displayName').fill('Synthetic capacity patient');await page.locator('#modal button[type=submit]').click();await page.locator('#patient-memos').waitFor();
 await page.evaluate(()=>{globalThis.testCapacity='critical';Object.defineProperty(navigator.storage,'estimate',{configurable:true,value:async()=>{if(globalThis.testCapacity==='unknown')throw Error('not supported');return {quota:1024*1024*1024,usage:globalThis.testCapacity==='critical'?1024*1024*1024-1024:0};}});});
 const begin=async()=>{if(!await page.locator('#patient-memos').evaluate(el=>el.open))await page.locator('#patient-memos>summary').click();await page.locator('[data-action=memo-voice]').click();await page.locator('input[name=confirmed]').check();await page.locator('#modal button[type=submit]').click();};
 await begin();await page.locator('#modal .form-error').getByText('存储空间紧张，请先备份。已保存片段保留，暂停新增录音。',{exact:true}).waitFor();assert.equal((await localJson(page,'/records')).records.filter(r=>r.type==='recording').length,0);mark('Known critical capacity blocks a new recording before opening a microphone or creating an audio record');
 await page.locator('#modal [data-action=close-modal]').first().click();await page.evaluate(()=>globalThis.testCapacity='unknown');await begin();await page.locator('#capture-bar:not([hidden])').waitFor();await page.waitForTimeout(2300);await page.locator('[data-action=stop-record]').click();await page.locator('#capture-bar').waitFor({state:'hidden'});
 let audio=(await localJson(page,'/records')).records.filter(r=>r.type==='recording');assert.equal(audio.length,1);assert.ok(audio[0].data.finalized&&audio[0].data.bytes>0);mark('Unavailable estimate stays unknown and permits a recording with normal encrypted saving');
 await page.evaluate(()=>globalThis.testCapacity='ok');await begin();await page.locator('#capture-bar:not([hidden])').waitFor();await page.waitForTimeout(2300);await page.evaluate(()=>globalThis.testCapacity='critical');await page.locator('#capture-bar').waitFor({state:'hidden',timeout:20000});
 assert.ok((await page.locator('#toast').innerText()).includes('存储空间紧张'));audio=(await localJson(page,'/records')).records.filter(r=>r.type==='recording');assert.equal(audio.length,2);for(const r of audio){assert.ok(r.data.finalized&&r.data.bytes>0);const blob=await page.evaluate(async id=>{const {device}=await import('/offline-api.js');return (await device.audio(id)).size;},r.id);assert.equal(blob,r.data.bytes);}mark('Capacity becoming critical stops further capture and finalizes the saved original audio without deleting earlier recordings');
 assert.equal(requests.length,0);assert.deepEqual(errors,[]);mark('Capacity checks and recording do not make API requests or emit page errors');
 writeFileSync(join(qa,'capture-storage-results.json'),JSON.stringify({passed:checks.length,checks,errors,time:new Date().toISOString()},null,2));
}catch(e){if(page)await page.screenshot({path:join(qa,'capture-storage-failure.png')}).catch(()=>{});throw e;}
finally{await browser?.close();await app.close();rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:300});}
