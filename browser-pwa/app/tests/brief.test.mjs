// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {composeBrief,briefStale,editBrief,briefMemos,BRIEF_FIELDS} from '../public/patient-brief.js';
import {retentionDecision} from '../public/domain.js';
import {validate} from '../public/record-validation.js';
const rec=(id,type,data,e='a')=>({id,type,encounterId:e,version:1,createdAt:'2026-10-13T08:00:00Z',updatedAt:'2026-10-13T08:00:00Z',data});
const initial=rec('i','note',{kind:'initial',date:'2026-10-13',fields:{hpi:'No fever; possible infection, not confirmed.',pmh:'No known diabetes.'}}),daily=rec('d','note',{kind:'daily',date:'2026-10-14',fields:{course:'No new pain.',vitals:'SpO2 95% on 2 L/min'},problems:[{title:'Uncertain cause',assessment:'Needs review',plan:'Reassess after results'}]}),task=rec('t','task',{title:'Culture pending',kind:'result',done:false,due:'2026-10-01'});
test('brief extracts exact source wording without other patients, diagnoses or memo contents',()=>{
 const rows=[initial,daily,task,rec('foreign','note',{...initial.data,fields:{hpi:'FOREIGN'}},'b'),rec('memo','memo',{title:'Private reminder',text:'NOT_A_CLINICAL_ASSESSMENT'})];const data=composeBrief(rows,'a');validate('brief',data);
 assert.equal(data.fields.reason,initial.data.fields.hpi);assert.equal(data.fields.background,initial.data.fields.pmh);assert.ok(data.fields.status.includes('SpO2 95% on 2 L/min'));assert.ok(data.fields.focus.includes('Culture pending'));assert.ok(!JSON.stringify(data).includes('FOREIGN'));assert.ok(!JSON.stringify(data).includes('NOT_A_CLINICAL_ASSESSMENT'));assert.equal(data.review,null);
});
test('new meaningful records, deletions, updates and task completion invalidate a brief',()=>{
 const rows=[initial,daily,task],r=rec('brief','brief',composeBrief(rows,'a'));assert.equal(briefStale(r,rows),false);
 for(const changed of [[...rows,rec('new','note',{kind:'daily',date:'2026-10-15',fields:{course:'New change'}})],rows.map(x=>x.id==='t'?{...x,data:{...x.data,done:true}}:x),rows.filter(x=>x.id!=='i'),rows.map(x=>x.id==='d'?{...x,version:2}:x),rows.map(x=>x.id==='d'?{...x,data:{...x.data,fields:{course:'Unsaved edit'}}}:x)])assert.equal(briefStale(r,changed),true);
 assert.equal(briefStale(r,[...rows,rec('blank','note',{kind:'daily',date:'2026-10-16',fields:{},problems:[]}),rec('m','memo',{title:'Reminder',text:'Separate'})]),false);
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
