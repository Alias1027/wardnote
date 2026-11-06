// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {composeBrief,briefStale,editBrief,briefMemos,BRIEF_FIELDS,briefEntryLabel} from '../public/patient-brief.js';
import {renderBriefCard,briefSourcesContent} from '../public/patient-brief-ui.js';
import {setLanguage} from '../public/i18n.js';
import {retentionDecision} from '../public/domain.js';
import {validate} from '../public/record-validation.js';
const rec=(id,type,data,e='a')=>({id,type,encounterId:e,version:1,createdAt:'2026-10-13T08:00:00Z',updatedAt:'2026-10-13T08:00:00Z',data});
const initial=rec('i','note',{kind:'initial',date:'2026-10-13',fields:{hpi:'No fever; possible infection, not confirmed.',pmh:'No known diabetes.'}}),daily=rec('d','note',{kind:'daily',date:'2026-10-14',fields:{course:'No new pain.',vitals:'SpO2 95% on 2 L/min'},problems:[{title:'Uncertain cause',assessment:'Needs review',plan:'Reassess after results'}]}),task=rec('t','task',{title:'Culture pending',kind:'result',done:false,due:'2026-10-01'});
test('brief extracts exact source wording without other patients, diagnoses or memo contents',()=>{
 const rows=[initial,daily,task,rec('foreign','note',{...initial.data,fields:{hpi:'FOREIGN'}},'b'),rec('memo','memo',{title:'Private reminder',text:'NOT_A_CLINICAL_ASSESSMENT'})];const data=composeBrief(rows,'a');validate('brief',data);
 assert.equal(data.fields.reason,initial.data.fields.hpi);assert.equal(data.fields.background,initial.data.fields.pmh);assert.ok(data.fields.status.includes('SpO2 95% on 2 L/min'));assert.ok(data.fields.focus.includes('Culture pending'));assert.ok(!JSON.stringify(data).includes('FOREIGN'));assert.ok(!JSON.stringify(data).includes('NOT_A_CLINICAL_ASSESSMENT'));assert.equal(data.review,null);
});
test('new latest records, deletions, updates and task completion invalidate a brief',()=>{
 const rows=[initial,daily,task],r=rec('brief','brief',composeBrief(rows,'a'));assert.equal(briefStale(r,rows),false);
 for(const changed of [[...rows,rec('new','note',{kind:'daily',date:'2026-10-15',fields:{course:'New change'}})],rows.map(x=>x.id==='t'?{...x,data:{...x.data,done:true}}:x),rows.filter(x=>x.id!=='i'),rows.map(x=>x.id==='d'?{...x,version:2}:x),rows.map(x=>x.id==='d'?{...x,data:{...x.data,fields:{course:'Unsaved edit'}}}:x)])assert.equal(briefStale(r,changed),true);
 assert.equal(briefStale(r,[...rows,rec('blank','note',{kind:'daily',date:'2026-10-16',fields:{},problems:[]})]),true);
 assert.equal(briefStale(r,[...rows,rec('m','memo',{title:'Reminder',text:'Separate'})]),false);
});
test('manual editing preserves provenance and clears review without modifying sources',()=>{
 const original=composeBrief([initial,daily],'a');original.review={clinician:'A',time:'2026-10-14T12:00:00Z'};const fields={...original.fields,reason:'Doctor clarified this.'};const edited=editBrief(original,fields);assert.equal(edited.review,null);assert.equal(edited.manuallyEdited,true);assert.deepEqual(edited.sources,original.sources);assert.deepEqual(edited.entries,original.entries);assert.equal(initial.data.fields.hpi,'No fever; possible infection, not confirmed.');assert.ok(original.review);
});
test('empty source fields remain empty and old daily content is not labeled current',()=>{
 const newer=rec('new','note',{kind:'daily',date:'2026-10-15',fields:{course:'New course without vitals'}});const data=composeBrief([daily,newer],'a');assert.equal(data.fields.status,'New course without vitals');assert.equal(data.fields.reason,'');assert.ok(!data.fields.status.includes('SpO2'));assert.ok(BRIEF_FIELDS.every(([k])=>typeof composeBrief([],'a').fields[k]==='string'));
});
test('memo index includes only this encounter and compact briefs never authorize audio cleanup',()=>{
 const r=rec('audio','recording',{title:'Old audio',memo:'Reminder',finalized:true,audioReviewed:true,noFurtherNeed:true,date:'2026-09-01'});r.createdAt='2026-09-01T00:00:00Z';const brief=rec('b','brief',{...composeBrief([],'a'),sources:[{id:r.id,version:1}],review:{clinician:'A'}});assert.equal(briefMemos([r,rec('m','memo',{title:'Other'},'b')],'a').length,1);assert.equal(retentionDecision(r,[r,brief],{days:14},Date.parse('2026-10-17')).eligible,false);
});
test('invalid fields, source references and formats are rejected',()=>{
 const data=composeBrief([initial],'a');for(const d of [{...data,fields:{reason:'x'}},{...data,generatedAt:'bad'},{...data,entries:[{key:'wrong',sourceId:'i',path:'hpi',text:'x'}]},{...data,format:'unknown'}])assert.throws(()=>validate('brief',d));
});

test('unresolved issues, follow-up and contingency preserve authored negatives and source paths in four fields',()=>{
 const problem={title:'Unconfirmed cause',assessment:'Possible A, not established.',alternative:'B remains possible; A does not explain all findings.',monitor:'Reassess after the pending result; response has not been documented.',contingency:'If the clinician confirms deterioration, seek senior review.',plan:'Review available evidence; do not infer a diagnosis.'};
 const n=rec('new','note',{kind:'daily',date:'2026-10-15',fields:{},problems:[problem]});
 const data=composeBrief([daily,n,rec('foreign','note',{...n.data,problems:[{alternative:'FOREIGN_UNCERTAINTY'}]},'b')],'a');
 assert.deepEqual(Object.keys(data.fields),['reason','background','status','focus']);
 for(const key of ['alternative','monitor','contingency','plan']){
  const entry=data.entries.find(e=>e.path==='problems.0.'+key);
  assert.equal(entry.sourceId,n.id);assert.equal(entry.text,problem.title+'：'+problem[key]);assert.ok(data.fields.focus.includes(problem[key]));assert.ok(briefEntryLabel(entry));
 }
 assert.ok(data.fields.status.includes(problem.assessment));assert.ok(!JSON.stringify(data).includes('FOREIGN_UNCERTAINTY'));
 assert.deepEqual(data.sources.map(s=>s.id),['new']);validate('brief',data);
});

test('an uncertainty-only current note prevents fallback to an older assessment or plan',()=>{
 const n=rec('uncertain','note',{kind:'daily',date:'2026-10-15',fields:{},problems:[{alternative:'Cause remains uncertain.'}]});
 const data=composeBrief([daily,n],'a');
 assert.equal(data.fields.status,'');assert.ok(data.fields.focus.includes('Cause remains uncertain.'));
 assert.ok(!data.fields.focus.includes('Reassess after results'));assert.deepEqual(data.sources.map(s=>s.id),['uncertain']);
});

test('empty newest records remain visible as sources and never silently reuse older diagnoses or history',()=>{
 const empty=rec('empty','note',{kind:'daily',date:'2026-10-16',fields:{},problems:[]});
 const emptyInitial=rec('initial-empty','note',{kind:'initial',date:'2026-10-16',fields:{},problems:[]});
 const oldBg=rec('bg-old','background',{fields:{pmh:'OLD_BACKGROUND'},date:'2026-10-13'}),newBg=rec('bg-new','background',{fields:{},date:'2026-10-16'});
 const rows=[initial,daily,oldBg,empty,emptyInitial,newBg],data=composeBrief(rows,'a');
 assert.ok(Object.values(data.fields).every(v=>v===''));assert.deepEqual(data.sources.map(s=>s.id),['bg-new','empty','initial-empty']);
 const r=rec('brief','brief',data);assert.equal(briefStale(r,rows),false);assert.equal(briefStale(r,rows.map(x=>x.id==='empty'?{...x,version:2}:x)),true);
 const rendered=briefSourcesContent(r,rows);assert.ok(rendered.includes('本次尚未录入'));assert.ok(rendered.includes('data-id="empty"'));assert.ok(!rendered.includes('OLD_BACKGROUND'));
});

test('new extraction rules invalidate legacy briefs without modifying their saved text or review history',()=>{
 const n=rec('new','note',{kind:'daily',date:'2026-10-15',fields:{},problems:[{plan:'Recorded plan',alternative:'NOT_CONFIRMED'}]});
 const data=composeBrief([n],'a');
 const legacy={...data,fields:{...data.fields,focus:'Previously reviewed summary'},entries:data.entries.filter(e=>!e.path.endsWith('.alternative')),review:{clinician:'Reviewer',time:'2026-10-15T12:00:00Z'}};
 const r=rec('brief','brief',legacy),before=JSON.stringify(r);
 assert.equal(briefStale(r,[n]),true);assert.equal(JSON.stringify(r),before);
 assert.equal(r.data.fields.focus,'Previously reviewed summary');assert.ok(r.data.review);
});

test('changes to uncertainty or reassessment invalidate review while outside-patient changes do not',()=>{
 const n=rec('current','note',{kind:'daily',date:'2026-10-15',fields:{},problems:[{alternative:'Not yet excluded',monitor:'Await evidence'}]});
 const r=rec('brief','brief',composeBrief([n],'a'));
 for(const key of ['alternative','monitor','contingency']){
  const changed={...n,data:{...n.data,problems:[{...n.data.problems[0],[key]:'Revised wording'}]}};
  assert.equal(briefStale(r,[changed]),true);
 }
 assert.equal(briefStale(r,[n,rec('other','note',{...n.data,date:'2026-10-17'},'b')]),false);
});

test('brief UI remains compact and review status does not imply diagnostic certainty',()=>{
 setLanguage('zh');
 const n=rec('current','note',{kind:'daily',date:'2026-10-15',fields:{},problems:[{alternative:'仍待核实；'.repeat(45),monitor:'下次查房复核。'}]});
 const data=composeBrief([n],'a');data.review={clinician:'Reviewer',time:'2026-10-15T12:00:00Z'};
 const r=rec('brief','brief',data),html=renderBriefCard([n,r],'a');
 assert.equal((html.match(/class="brief-item"/g)||[]).length,4);assert.ok(html.includes('展开全文'));
 assert.ok(html.includes('已核对记录内容，不代表诊断已经确证。'));
 assert.ok(briefSourcesContent(r,[n,r]).includes('未决问题'));
});
