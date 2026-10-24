// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LANGUAGES,languageCodes,isReportLanguage,isSpeechLanguage} from '../public/languages.js';
import {EN} from '../public/translations.js';
import {dictionaries,translate,isolateNumericRanges} from '../public/locale-core.js';
import {setLanguage,t,ui,reportDirection,reportLanguages} from '../public/i18n.js';
import {SCHEMAS,classify,composeSummary} from '../public/domain.js';
import {transcribe} from '../lib/integrations.mjs';

test('eight catalogs have identical nonempty keys and retain markup',()=>{
 assert.deepEqual(languageCodes,['zh','en','es','fr','ru','ar','hi','ur']);
 const keys=Object.keys(EN).sort(),tags=s=>(s.match(/<\/?[a-z][^>]*>/gi)||[]);
 for(const [code,dict] of Object.entries(dictionaries)){
  assert.deepEqual(Object.keys(dict).sort(),keys,code);
  for(const key of keys){assert.equal(typeof dict[key],'string',`${code}: ${key}`);assert.ok(dict[key].trim(),`${code}: ${key}`);assert.doesNotMatch(dict[key],/[\u3400-\u9fff\ufffd]/,`${code}: ${key}`);assert.deepEqual(tags(dict[key]),tags(EN[key]),`${code}: markup ${key}`);}
  for(const fields of Object.values(SCHEMAS))for(const [,label,hint] of fields){assert.ok(dict[label]);assert.ok(dict[hint]);}
  assert.notEqual(dict['病重'],dict['病危'],code);
 }
});
test('language switching preserves all interpolated clinical content and numeric values',()=>{
 const source='患者：لا ألم / दर्द नहीं / درد نہیں / no pain; 1.2 mg/dL, 120/70; 2026-10-13';
 for(const code of languageCodes){setLanguage(code);assert.equal(ui`<p>病程记录</p><textarea>${source}</textarea>`,`<p>${translate('病程记录',code)}</p><textarea>${source}</textarea>`);assert.equal(t('病重'),translate('病重',code));}
 setLanguage('zh');
});
test('all template heading languages classify to the same field without rewriting the source',()=>{
 for(const code of languageCodes)for(const kind of ['daily','initial'])for(const [key,label] of SCHEMAS[kind]){
  const source=`${translate(label,code)}: No new symptom; 1.2 mg/dL`;
  const [result]=classify(source,kind);assert.equal(result.section,key,`${code} ${kind} ${key}`);assert.equal(result.text,source);
 }
 assert.equal(classify('अनिश्चित सामग्री / غیر واضح مواد','daily')[0].section,'continuation');
});
test('summary labels localize while source values and saved report direction stay independent',()=>{
 const encounter={id:'a',version:1,data:{displayName:'Synthetic',caseId:'A1',admitted:'2026-10-01'}},source='لا ألم / 1.2 mg/dL / 患者原文';
 const notes=[{id:'b',type:'note',encounterId:'a',version:1,createdAt:'2026-10-02',data:{date:'2026-10-02',kind:'daily',fields:{course:source},problems:[]}},...['lab','background','memo','task','recording'].map(type=>({id:type,type,encounterId:'a',version:1,createdAt:'2026-10-02',data:{name:'Fixture',value:'1.2',unit:'mg/dL',title:'Fixture',text:'No pain',fields:{pmh:'No pain'},important:true,hold:true}}))];
 for(const code of languageCodes){const summary=composeSummary(encounter,notes,'2026-10-01','2026-10-13',code);assert.ok(summary.text.includes(source));assert.ok(summary.text.includes(translate('住院病程与近期变化',code)));assert.equal(summary.labelLanguage,code);if(code!=='zh')assert.doesNotMatch(summary.text.replaceAll(source,''),/[\u3400-\u9fff]/,code);}
 setLanguage('zh');assert.equal(reportDirection({language:'ur'}),'rtl');assert.equal(reportDirection({language:'original',labelLanguage:'ar'}),'rtl');setLanguage('ar');assert.equal(reportDirection({language:'en'}),'ltr');setLanguage('zh');
});
test('report choices include eight languages while speech contract remains separate',async()=>{
 assert.equal(reportLanguages().length,9);assert.deepEqual(reportLanguages(false).map(x=>x[0]),['auto','zh','en']);
 for(const code of languageCodes)assert.ok(isReportLanguage(code));assert.ok(!isReportLanguage('xx'));
 assert.ok(!isSpeechLanguage('hi'));await assert.rejects(transcribe(Buffer.from('fixture'),'audio/wav',{transcribeUrl:'http://127.0.0.1:1',language:'hi'}),/识别语言无效/);
});
test('every locale and localized manifest belongs to the offline application shell',()=>{
 const sw=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
 for(const code of languageCodes){assert.ok(sw.includes(`/manifest-${code}.webmanifest`));if(!['zh','en'].includes(code))assert.ok(sw.includes(`/locales/${code}.js`));const manifest=JSON.parse(readFileSync(new URL(`../public/manifest-${code}.webmanifest`,import.meta.url)));assert.equal(manifest.lang,LANGUAGES[code].locale);assert.equal(manifest.dir,LANGUAGES[code].dir);}
 assert.ok(sw.includes("url.pathname.startsWith('/api/')"));
});
test('RTL numeric ranges are isolated only in display strings and never in HTML attributes',()=>{
 for(const code of ['ar','ur']){assert.equal(isolateNumericRanges('24–48; 2026-10-13',code),'\u206624–48\u2069; \u20662026-10-13\u2069');assert.equal(isolateNumericRanges('<input data-id="2026-10">',code),'<input data-id="2026-10">');}
 assert.equal(isolateNumericRanges('24–48','hi'),'24–48');
});
