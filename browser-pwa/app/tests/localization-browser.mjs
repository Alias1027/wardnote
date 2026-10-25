import {PROJECT_NOTICE,PROJECT_REFERENCES,START_GUIDE} from '../public/project-info.js';
import {PROJECT_INTRODUCTIONS} from '../public/project-introduction.js';
import {installLocalProbe,localJson,seed,localRecord,reloadAndUnlock,failDeviceWrites,authorizeConnection} from './browser-support.mjs';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Entirely isolated synthetic workspace: no patient data or external model requests.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {blankNote,dateLocal,SCHEMAS,VERSION} from '../public/domain.js';
import {LANGUAGES,languageCodes} from '../public/languages.js';
import {translate} from '../public/locale-core.js';
const require=createRequire(import.meta.url),{chromium}=require(process.env.NOTE_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(import.meta.dirname,'../../work/qa');mkdirSync(root,{recursive:true});
const temp=mkdtempSync(join(root,'localization-test-'));process.env.TEMP=temp;process.env.TMP=temp;
const app=createApp({dataDir:join(temp,'data')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${app.server.address().port}`,checks=[],errors=[];let context;
const mark=(language,check)=>{checks.push({language,check});console.log('PASS '+language+' '+check);};
const original='患者原文 / لا ألم / दर्द नहीं / درد نہیں / no pain; 1.2 mg/dL; BP 120/70; 2026-10-13';
try{
 context=await chromium.launchPersistentContext(join(temp,'profile'),{headless:true,executablePath:process.env.NOTE_BROWSER||undefined,viewport:{width:1440,height:1000},locale:'en-US',env:{...process.env,TEMP:temp,TMP:temp},args:['--disable-background-networking','--no-first-run']});
 const page=await context.newPage();await installLocalProbe(page);page.on('pageerror',e=>errors.push(e.message));
 const switchTo=async code=>{await page.locator('[data-ui-language]').selectOption(code);await page.waitForFunction(({lang,dir})=>document.documentElement.lang===lang&&document.documentElement.dir===dir,{lang:LANGUAGES[code].locale,dir:LANGUAGES[code].dir});};
 const audit=async(code,section)=>{
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,code+' overflow '+section);
  const untranslated=await page.evaluate(()=>{const out=[],w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode,p=n.parentElement;if(!p||p.closest('script,style,textarea,option,.language-picker,#print-area,#toast')||!p.getClientRects().length||getComputedStyle(p).visibility==='hidden')continue;const text=n.textContent.trim();if(/[\u3400-\u9fff\ufffd]/.test(text))out.push(text);}return [...new Set(out)];});
  if(code!=='zh')assert.deepEqual(untranslated.filter(text=>text!==original),[],code+' untranslated '+section);
 };
 const shot=async name=>{await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:join(root,name),fullPage:true});};
 const closePanels=async()=>{if(await page.locator('#patient-memos').count()&&await page.locator('#patient-memos').evaluate(el=>el.open))await page.locator('#patient-memos>summary').click();for(const panel of ['voice','tasks'])if(await page.locator('#float-'+panel).count())await page.locator('.tool-rail [data-panel='+panel+']').click();};
 const nav=async view=>{if(await page.locator('.mobile-menu').isVisible())await page.locator('.mobile-menu').click();await page.locator('.sidebar [data-action=nav][data-view='+view+']').click();};
 const tab=async name=>{if(['initial','daily','timeline','results'].includes(name)){if(!await page.locator('.record-tabs').count()){await page.locator('.primary-tabs [data-tab=daily]').click();await page.locator('.record-tabs').waitFor();}await page.locator('.record-tabs [data-tab='+name+']').click();await page.locator('.record-tabs .primary[data-tab='+name+']').waitFor();}else{await page.locator('.primary-tabs [data-tab='+name+']').click();await page.locator('.primary-tabs .active[data-tab='+name+']').waitFor();}};
 const checkGuide=async(code,id)=>{
  const guide=page.locator('#'+id);assert.equal(await guide.evaluate(el=>el.open),false);
  await guide.locator('>summary').click();
  for(const key of Object.keys(START_GUIDE))assert.ok((await guide.textContent()).includes(translate(START_GUIDE[key],code)),code+' '+key);
  assert.equal(await guide.locator('a,button,input').count(),0);
  assert.equal(await guide.locator('.local-address').textContent(),base+'/');
  assert.equal(await guide.locator('.local-address').getAttribute('dir'),'ltr');
  await audit(code,id+' desktop');
  await page.setViewportSize({width:390,height:844});await audit(code,id+' mobile');if(id==='auth-start-guide')await guide.screenshot({path:join(root,'start-'+code+'-mobile.png')});
  assert.ok(await guide.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await guide.locator('>summary').click();assert.equal(await guide.evaluate(el=>el.open),false);
  await page.setViewportSize({width:1440,height:1000});mark(code,id+' available entry points, deployment and validation limits on desktop/mobile');
 };
 await page.goto(base);
 for(const code of languageCodes){await switchTo(code);await audit(code,'setup');await checkGuide(code,'auth-start-guide');assert.equal(await page.locator('#clinician').count(),0);assert.equal(await page.locator('input[name=username]').count(),1);await page.locator('#username').fill('test-user');await page.locator('#password').fill('only-synthetic-pass');await page.locator('#repeat').fill('wrong-synthetic-pass');await page.locator('#auth-form button[type=submit]').click();assert.equal(await page.locator('.form-error').textContent(),translate('两次密码不一致',code));mark(code,'setup and validation message');}
 await switchTo('zh');await page.locator('#repeat').fill('only-synthetic-pass');await page.locator('#auth-form button[type=submit]').click();await page.locator('.census,.empty').first().waitFor();
 const encounter=await seed(page,'encounter','',{displayName:'Synthetic patient',caseId:'QA-001',bed:'12A',admitted:dateLocal(),acuity:'serious',service:'Internal medicine'});
 const followup=await seed(page,'task',encounter.id,{title:'DISCHARGE_FOLLOWUP',kind:'result',owner:'Synthetic clinician',next:'FOLLOWUP_CONTACT',done:false});
 await seed(page,'note',encounter.id,{...blankNote('daily'),date:dateLocal(),fields:{course:original,vitals:'BP 120/70, SpO2 98%, 1.2 mg/dL'},problems:[]});
 await seed(page,'note',encounter.id,{...blankNote('initial'),date:dateLocal(),kind:'initial',fields:{hpi:original},problems:[]});
 await seed(page,'summary',encounter.id,{text:'لا ألم. 1.2 mg/dL. محفوظ بالعربية.',language:'ar',labelLanguage:'ar',from:dateLocal(),to:dateLocal(),sources:[],review:null});
 await reloadAndUnlock(page,'only-synthetic-pass');await page.locator('[data-patient-entry]').first().waitFor();
 for(const code of languageCodes){
  await page.setViewportSize({width:1440,height:1000});await switchTo(code);await nav('dashboard');await audit(code,'dashboard');
  await page.locator('[data-action=new-patient]').first().click();await audit(code,'patient dialog');assert.equal(await page.locator('#m-acuity option[value=serious]').textContent(),translate('病重',code));assert.equal(await page.locator('#m-acuity option[value=critical]').textContent(),translate('病危',code));await page.locator('#modal [data-action=close-modal]').first().click();
  await page.locator('[data-patient-entry]').first().click();await page.locator('.round-sheet').waitFor();assert.equal(await page.locator('textarea[data-path="fields.course"]').inputValue(),original);await audit(code,'daily');
  await page.locator('.patient-tools > summary').click();await page.locator('[data-action=edit-patient]').click();
  assert.ok(await page.locator('#discharge-followup').isHidden());await page.locator('#m-discharged').fill(dateLocal());
  assert.ok(await page.locator('#discharge-followup').isVisible());assert.ok((await page.locator('#discharge-followup').textContent()).includes(translate('请在待办中注明出院后的跟进负责人、联系方式及期限；可继续保存，事项不会自动完成。',code)));
  assert.equal(await page.locator('#m-discharged').getAttribute('aria-describedby'),'discharge-followup');
  await page.setViewportSize({width:390,height:844});await audit(code,'discharge reminder');
  await page.locator('#discharge-followup').scrollIntoViewIfNeeded();
  if(['zh','en','ur'].includes(code))await page.screenshot({path:join(root,'locale-'+code+'-discharge.png'),fullPage:false});
  await page.locator('#m-discharged').fill('');assert.ok(await page.locator('#discharge-followup').isHidden());await page.locator('#m-discharged').fill(dateLocal());
  await page.locator('#modal button[type=submit]').click();await page.locator('#modal').waitFor({state:'hidden'});
  assert.equal((await localRecord(page,encounter.id)).data.discharged,dateLocal());assert.equal((await localRecord(page,followup.id)).version,followup.version);assert.equal((await localRecord(page,followup.id)).data.done,false);
  await nav('dashboard');assert.ok(await page.getByText('DISCHARGE_FOLLOWUP',{exact:true}).isVisible());
  await nav('patients');await page.locator('[data-patient-entry]').first().click();await page.locator('.patient-tools > summary').click();await page.locator('[data-action=edit-patient]').click();assert.ok(await page.locator('#discharge-followup').isVisible());await page.locator('#m-discharged').fill('');await page.locator('#modal button[type=submit]').click();await page.locator('#modal').waitFor({state:'hidden'});
  await page.setViewportSize({width:1440,height:1000});mark(code,'discharge reminder localizes, does not block saving or close tasks, and follow-up remains visible');
  await page.locator('[data-action=note-tools]').click();await page.locator('#note-tools-drawer [data-action=teaching]').click();await audit(code,'teaching hints');await page.locator('[data-action=close-note-tools]').click();
  await tab('initial');await audit(code,'initial');assert.equal(await page.locator('textarea[data-path="fields.hpi"]').inputValue(),original);
  const order=await page.locator('.round-sheet > .paper-sheet textarea[data-path^="fields."]').evaluateAll(els=>els.map(el=>el.dataset.path));assert.deepEqual(order.slice(0,14),['hpi','pmh','procedures','medications','allergies','family','social','contacts','source','vitals','ros','exam','reproductive','function'].map(k=>'fields.'+k));
  await page.locator('.background-section > summary').click();await page.waitForFunction(()=>document.querySelector('.background-fields')?.disabled===false);await audit(code,'background');
  await page.locator('.patient-tools > summary').click();await page.evaluate(()=>window.print=()=>{});await page.locator('[data-action=print]').click();assert.equal(await page.locator('#print-area .printed-sheet').count(),2);assert.ok((await page.locator('#print-area').textContent()).includes(original));assert.equal(await page.locator('#print-area pre').first().getAttribute('dir'),'auto');
  await page.emulateMedia({media:'print'});assert.equal(await page.locator('.shell').evaluate(el=>getComputedStyle(el).display),'none');await page.emulateMedia({media:'screen'});
  await tab('daily');await page.locator('.tool-rail [data-panel=voice]').click();await page.locator('#float-voice').waitFor();assert.equal(await page.locator('#report-language option').count(),9);assert.equal(await page.locator('#speech-language option').count(),3);await page.locator('#report-language').selectOption('ur');await audit(code,'voice');await closePanels();
  await page.locator('#patient-memos>summary').click();await audit(code,'embedded memos');await closePanels();for(const name of ['tasks']){await page.locator('.tool-rail [data-panel='+name+']').click();await page.locator('#float-'+name).waitFor();await audit(code,name);if(name==='tasks'){await page.locator('[data-action=new-task]').click();await audit(code,'task dialog');assert.equal(await page.locator('#m-next').getAttribute('aria-describedby'),'m-next-hint');await page.setViewportSize({width:390,height:844});await audit(code,'mobile task dialog');if(['zh','en','ur'].includes(code))await shot('locale-'+code+'-task-hint.png');await page.locator('#modal [data-action=close-modal]').first().click();await page.setViewportSize({width:1440,height:1000});}await closePanels();}
  await tab('timeline');await audit(code,'timeline');await tab('results');await audit(code,'results');await tab('review');await audit(code,'review');assert.equal(await page.locator('.summary-text').getAttribute('dir'),'rtl');assert.equal(await page.locator('.summary-text').inputValue(),'لا ألم. 1.2 mg/dL. محفوظ بالعربية.');
  await page.locator('[data-action=summary]').click();assert.equal(await page.locator('#m-language option').count(),9);assert.equal(await page.locator('#m-language').inputValue(),'original');await audit(code,'summary dialog');await page.locator('#modal [data-action=close-modal]').first().click();
  await tab('learning');await audit(code,'reflection');await nav('data');await audit(code,'data');await nav('settings');await audit(code,'settings');await checkGuide(code,'start-guide');
  const notice=page.locator('#project-notice');await notice.scrollIntoViewIfNeeded();
  const introduction=PROJECT_INTRODUCTIONS[code];
  for(const key of ['purpose','infrastructure','framework','scope','license','email'])assert.ok((await notice.textContent()).includes(introduction[key]),code+':'+key);
  assert.deepEqual(await notice.locator('.project-acknowledgments p').allTextContents(),introduction.acknowledgments);
  assert.equal(await notice.locator('.project-acknowledgments a,.project-acknowledgments details,.project-acknowledgments button').count(),0);
  assert.ok((await notice.textContent()).includes(translate(PROJECT_NOTICE.license,code)));
  assert.equal(await notice.locator('.project-copyright').textContent(),introduction.copyright);
  assert.equal(await notice.locator('a').count(),0);
  await notice.locator('.project-sources > summary').click();
  assert.deepEqual(await notice.locator('.reference-address').allTextContents(),PROJECT_REFERENCES.map(r=>r.url));
  for(const source of PROJECT_REFERENCES)assert.ok((await notice.locator('[data-reference="'+source.id+'"]').textContent()).includes(translate(source.label,code)));
  await audit(code,'expanded references');
  if(['zh','en'].includes(code))await notice.screenshot({path:join(root,'notice-'+code+'-desktop.png'),animations:'disabled',style:'.topbar,.sidebar{visibility:hidden!important}'});
  await page.setViewportSize({width:390,height:844});await notice.scrollIntoViewIfNeeded();await audit(code,'mobile references');
  assert.ok(await notice.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await notice.screenshot({path:join(root,'notice-'+code+'-mobile.png'),animations:'disabled',style:'.topbar,.sidebar{visibility:hidden!important}'});
  await page.setViewportSize({width:1440,height:1000});await notice.locator('.project-sources > summary').click();
  mark(code,'reference notice, copyable source addresses, scope and copyright on desktop and mobile');await page.locator('[data-action=offline-connect]').click();await audit(code,'connection authorization');await page.locator('#offline-form details > summary').click();await audit(code,'connection setup');await page.locator('#modal [data-action=close-modal]').first().click();
  await nav('dashboard');await page.locator('[data-patient-entry]').first().click();await tab('initial');await shot('locale-'+code+'-desktop.png');
  await page.setViewportSize({width:390,height:844});
  for(const name of ['initial','daily','timeline','results','review','learning']){await tab(name);await audit(code,'mobile '+name);}
  await tab('daily');await page.locator('#patient-memos>summary').click();await audit(code,'mobile embedded memos');await closePanels();for(const panel of ['voice','tasks']){await page.locator('.tool-rail [data-panel='+panel+']').click();await page.locator('#float-'+panel).waitFor();await audit(code,'mobile '+panel);const box=await page.locator('#float-'+panel).boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=391,code+' panel outside viewport');await closePanels();}
  await shot('locale-'+code+'-mobile.png');await reloadAndUnlock(page,'only-synthetic-pass');await page.locator('[data-patient-entry]').first().waitFor();assert.equal(await page.locator('html').getAttribute('lang'),LANGUAGES[code].locale);assert.equal(await page.locator('html').getAttribute('dir'),LANGUAGES[code].dir);await audit(code,'mobile dashboard');
  mark(code,'desktop/mobile forms, hints, panels, print, reports, persistence and unchanged clinical source');
 }
 assert.deepEqual(errors,[]);mark('all','no browser exceptions');
 writeFileSync(join(root,'localization-browser-checks.json'),JSON.stringify({date:new Date().toISOString(),version:VERSION,languages:languageCodes,checks,errors,patientData:'isolated synthetic',externalSpeechOrModelCalls:false},null,2)+'\n');
}catch(error){if(context)await context.pages().at(-1)?.screenshot({path:join(root,'localization-failure.png'),fullPage:true});writeFileSync(join(root,'localization-browser-failure.json'),JSON.stringify({checks,errors,failure:error.message},null,2));throw error;
}finally{if(context)await context.close();await app.close();const absolute=resolve(temp);assert.ok(absolute.startsWith(root+'\\')||absolute.startsWith(root+'/'));rmSync(absolute,{recursive:true,force:true,maxRetries:5,retryDelay:300});}
