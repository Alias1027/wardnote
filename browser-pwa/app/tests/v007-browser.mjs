import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {seed,localRecord,reloadAndUnlock} from './browser-support.mjs';
import {blankNote,dateLocal,SCHEMAS,PROBLEM_HINTS} from '../public/domain.js';
import {languageCodes} from '../public/languages.js';
import {translate} from '../public/locale-core.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const qa=resolve(import.meta.dirname,'../../work/qa');mkdirSync(qa,{recursive:true});const temp=mkdtempSync(join(qa,'v007-'));process.env.TEMP=temp;process.env.TMP=temp;
const app=createApp({dataDir:join(temp,'server')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
let browser,page;const errors=[],checks=[],external=[],password='synthetic-v007-password';const mark=s=>{checks.push(s);console.log('PASS '+s);};
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.NOTE_BROWSER||undefined,args:['--disable-background-networking','--no-first-run']});
 const context=await browser.newContext({viewport:{width:1366,height:1000}});
 await context.route('**/*',r=>{const url=r.request().url();if(url.startsWith(base+'/')||/^(data:|blob:)/.test(url))return r.continue();external.push(url);return r.abort();});
 await context.addInitScript(()=>{window.print=()=>{window.printCalls=(window.printCalls||0)+1;};});
 page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
 await page.locator('#username').fill('test-user');await page.locator('#password').fill(password);await page.locator('#repeat').fill(password);await page.locator('#auth-form button[type=submit]').click();await page.locator('.shell').waitFor();
 const e=await seed(page,'encounter','',{displayName:'Synthetic V007',admitted:dateLocal(),dob:'1970-01-01',caseId:'TEST-V007'});
 const n=await seed(page,'note',e.id,{...blankNote(),fields:{course:'Original course',vitals:'BP 120/80'},problems:[{title:'Synthetic question',assessment:'UNCERTAIN_ORIGINAL',monitor:'Reassess tomorrow'}]});
 const b=await seed(page,'background',e.id,{fields:{pmh:'BACKGROUND_ONLY',updates:'Reviewed with patient'}});
 const r=await seed(page,'reflection',e.id,{title:'Synthetic decision',date:'2026-11-01',reason:'LEGACY_REASON',concern:'Alternative',next:'Tomorrow',feedback:''});
 await reloadAndUnlock(page,password);await page.locator('[data-patient-entry][data-id="'+e.id+'"]').click();
 const order=await page.locator('.round-sheet [data-path]').evaluateAll(es=>es.map(x=>x.dataset.path));assert.ok(order.indexOf('fields.course')<order.indexOf('fields.vitals'));assert.ok(order.indexOf('fields.vitals')<order.indexOf('fields.medications'));
 await page.locator('[data-path="fields.course"]').fill('Saved before printing');
 const print=async(background=false,hints=false)=>{
  await page.locator('.patient-banner details').first().evaluate(d=>d.open=true);
  await page.locator('[data-action=print]').click();await page.locator('#modal').waitFor();
  assert.equal(await page.locator('#modal input[name=background]').isChecked(),false);assert.equal(await page.locator('#modal input[name=hints]').isChecked(),false);
  if(background)await page.locator('#modal input[name=background]').check();if(hints)await page.locator('#modal input[name=hints]').check();
  await page.locator('#modal button[type=submit]').click();await page.locator('#modal').waitFor({state:'hidden'});
 };
 await print();assert.equal((await localRecord(page,n.id)).data.fields.course,'Saved before printing');assert.equal(await page.locator('#print-area .hint').count(),0);assert.equal(await page.locator('#print-area .printed-background').count(),0);assert.ok((await page.locator('#print-area').textContent()).includes('V007'));mark('Vitals precede trends; default print saves edits and excludes optional prompts/background');
 await print(true,true);assert.ok((await page.locator('#print-area .printed-background').textContent()).includes('BACKGROUND_ONLY'));assert.ok(await page.locator('#print-area .hint').count()>0);assert.ok((await page.locator('#print-area .print-boundary').textContent()).includes('Junhui Liu'));assert.equal((await localRecord(page,b.id)).version,1);
 await page.emulateMedia({media:'print'});await page.pdf({path:join(qa,'v007-daily-with-hints.pdf'),format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});mark('Optional background and teaching hints print with V007 boundary and author, without changing source records');
 await page.locator('[data-action=tab][data-tab=learning]').click();const date=()=>page.locator('[data-path=reviewDate]');assert.equal(await date().inputValue(),'');assert.equal((await localRecord(page,r.id)).data.reviewDate,undefined);await date().fill('2026-11-05');await page.locator('[data-path=reason]').fill('LEGACY_REASON');
 await page.locator('[data-action=tab][data-tab=daily]').first().click();await page.locator('.round-sheet').waitFor();assert.equal((await localRecord(page,r.id)).data.reviewDate,'2026-11-05');await page.locator('[data-action=tab][data-tab=learning]').click();await page.locator('.reflection-card').waitFor();assert.equal(await date().inputValue(),'2026-11-05');assert.equal(await page.locator('.reflection-card .hint:visible').count(),0);await page.locator('[data-action=teaching]').click();assert.equal(await page.locator('.reflection-card .hint:visible').count(),4);mark('Old reflection dates remain empty; optional review date saves and teaching prompts are collapsible');
 for(const code of languageCodes){
  await page.locator('[data-ui-language]').selectOption(code);await page.waitForFunction(()=>!document.querySelector('[data-ui-language]')?.disabled);
  assert.equal(await page.locator('label[for$="reviewDate"]').textContent(),translate('复盘日期（可选）',code));assert.equal(await page.locator('[data-path=reason]').inputValue(),'LEGACY_REASON');
  if(code!=='zh')assert.doesNotMatch((await page.locator('.reflection-card .hint').allTextContents()).join(''),/[\u3400-\u9fff]/);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(['zh','en','ur'].includes(code))await page.screenshot({path:join(qa,'v007-reflection-'+code+'.png'),fullPage:true});await page.setViewportSize({width:1366,height:1000});
  await page.locator('[data-action=tab][data-tab=daily]').first().click();await page.locator('.round-sheet').waitFor();await print(true,true);
  const expected=translate(SCHEMAS.daily.find(x=>x[0]==='discharge')[2],code);assert.ok((await page.locator('#print-area').textContent()).includes(expected));
  for(const hint of Object.values(PROBLEM_HINTS)){const translated=translate(hint,code);if(code!=='zh')assert.doesNotMatch(translated,/[\u3400-\u9fff]/);assert.ok((await page.locator('.round-sheet .hint').allTextContents()).includes(translated));assert.ok((await page.locator('#print-area').textContent()).includes(translated));}
  assert.equal(await page.locator('[data-path="problems.0.assessment"]').inputValue(),'UNCERTAIN_ORIGINAL');
  await page.locator('[data-action=tab][data-tab=learning]').click();await page.locator('.reflection-card').waitFor();
 }
 mark('Eight languages preserve entered text, localize new hints/print options and fit 390px layouts');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
}catch(e){errors.push(e.stack||e.message);console.error(e);process.exitCode=1;await page?.screenshot({path:join(qa,'v007-failure.png'),fullPage:true}).catch(()=>{});}
finally{writeFileSync(join(qa,'v007-results.json'),JSON.stringify({checks,errors,externalRequests:external.length,scope:'Synthetic browser checks, not physical device or clinical validation'},null,2));await browser?.close();await app.close();const rel=relative(qa,temp);if(!rel||rel==='..'||rel.startsWith('..'+sep))throw Error('Unsafe cleanup');rmSync(temp,{recursive:true,force:true,maxRetries:5,retryDelay:300});}

