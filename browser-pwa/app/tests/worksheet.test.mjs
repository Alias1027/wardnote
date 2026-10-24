// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {hospitalDay,SCHEMAS,classify} from '../public/domain.js';
import {selectedTrends} from '../public/worksheet-ui.js';
import {t,ui,setLanguage} from '../public/i18n.js';

test('hospital day uses calendar days and rejects invalid or future admissions',()=>{
 assert.equal(hospitalDay('2026-10-10','2026-10-11'),2);
 assert.equal(hospitalDay('2026-03-08','2026-03-09'),2);
 assert.equal(hospitalDay('2026-10-11','2026-10-11'),1);
 for(const [start,end] of [['2026-10-12','2026-10-11'],['2026-02-30','2026-03-02'],['','2026-10-11'],['2026-01-01','invalid']])assert.equal(hospitalDay(start,end),null);
});
test('data trends keep units separate, show recent three values and exclude other patients',()=>{
 const make=(id,unit,time,encounterId='a')=>({id,type:'lab',encounterId,createdAt:time,data:{name:'Creatinine',unit,sampledAt:time,value:id}});
 const rows=selectedTrends([make('1','mg/dL','2026-10-01'),make('2','mg/dL','2026-10-02'),make('3','mg/dL','2026-10-03'),make('4','mg/dL','2026-10-04'),make('5','umol/L','2026-10-05'),make('other','mg/dL','2026-10-06','b')],'a');
 assert.equal(rows.length,2);
 assert.deepEqual(rows.find(r=>r.unit==='mg/dL').values.map(r=>r.id),['2','3','4']);
 assert.deepEqual(rows.find(r=>r.unit==='umol/L').values.map(r=>r.id),['5']);
 assert.deepEqual(selectedTrends([make('1','mg/dL','2026-10-01'),make('later','mg/dL','2026-10-05')],'a','2026-10-02')[0].values.map(r=>r.id),['1']);
});
test('interface translation never translates interpolated clinical text',()=>{
 setLanguage('en');
 const clinical='患者说：每日查房后无胸痛。Plan unchanged. &lt;script&gt;';
 assert.equal(t('初诊病史采集与查体'),'Initial History and Examination');
 assert.equal(t('住院每日查房记录'),'Inpatient Daily Review');
 assert.equal(ui`<h2>每日查房</h2><p>${clinical}</p>`,`<h2>Daily review</h2><p>${clinical}</p>`);
 assert.equal(t('保留期限'),'Retention review');
 setLanguage('zh');assert.equal(t('每日查房'),'每日查房');
});
test('initial vitals get their own field without removing any previous data fields',()=>{
 for(const key of ['source','contacts','hpi','pmh','procedures','medications','allergies','family','social','reproductive','function','ros','exam','vaccines','prevention','results','communication','continuation','vitals'])assert.ok(SCHEMAS.initial.some(s=>s[0]===key));
 assert.equal(classify('Vitals: BP 120/70','initial')[0].section,'vitals');
});
test('English template labels classify without rewriting the source text',()=>{
 const text='Hospital course and interval events: no chest pain.\nDaily medication and device review: verify home list.\nContingency plan and handoff: awaiting review.';
 const result=classify(text,'daily');assert.deepEqual(result.map(p=>p.section),['course','medications','handoff']);assert.equal(result.map(p=>p.text).join('\n'),text);
 assert.equal(classify('Presenting concerns and history of present illness: onset uncertain.','initial')[0].section,'hpi');
});
test('all worksheet labels and prompts have English coverage',()=>{
 setLanguage('en');
 for(const fields of Object.values(SCHEMAS))for(const [,label,hint] of fields){assert.doesNotMatch(t(label),/[\u3400-\u9fff]/,label);assert.doesNotMatch(t(hint),/[\u3400-\u9fff]/,hint);}
 setLanguage('zh');
});
