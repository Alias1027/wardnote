// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {roundChanges,composeHandoff,preserveHandoff} from '../public/continuity.js';
import {sourcesChanged} from '../public/domain.js';
import {languageCodes} from '../public/languages.js';
const at=n=>`2026-10-18T${n}:00:00.000Z`;
const r=(id,type,data={},encounterId='e',hour='08')=>({id,type,encounterId,version:1,createdAt:at(hour),updatedAt:at(hour),data});
const e=r('e','encounter',{displayName:'Fixture',admitted:'2026-10-01',allergySummary:'UNKNOWN / 未评估'},'');
const prev=r('prev','note',{kind:'daily',date:'2026-10-18',fields:{course:'No fever; uncertain cause.',vitals:'95% / 2 L/min'},problems:[]});
const current=r('current','note',{kind:'daily',date:'2026-10-18',fields:{course:'Cough improved; cause uncertain.'},problems:[{title:'Issue',assessment:'Possible, not confirmed',plan:'Review next result'}]},'e','10');
test('comparison uses the preceding same-day round, not another patient or later note',()=>{
 const later=r('later','note',{...current.data,fields:{course:'FUTURE'}},'e','12');
 const other=r('foreign','note',{...current.data,fields:{course:'FOREIGN'}},'other','09');
 const c=roundChanges([e,prev,current,later,other],'e','current',at('14'));
 assert.equal(c.previous.id,'prev');assert.equal(c.to,at('10'));assert.equal(c.fields[0].after,current.data.fields.course);assert.equal(c.problemsChanged,true);
});
test('missing current fields remain empty and absent baseline is explicit',()=>{
 const c=roundChanges([prev,current],'e','current',at('11'));
 assert.deepEqual(c.fields.find(f=>f.key==='vitals'),{key:'vitals',before:'95% / 2 L/min',after:''});
 assert.equal(roundChanges([current],'e','current').previous,undefined);
 assert.equal(roundChanges([current],'other','current').current,undefined);
});
test('event interval uses saved times and excludes deleted, future and foreign records',()=>{
 const memo=r('memo','memo',{title:'Late entry'},'e','09'),deleted=r('deleted','lab',{deletedAt:at('09')},'e','09');
 const c=roundChanges([prev,current,memo,deleted,r('future','task',{},'e','13'),r('foreign','memo',{},'other','09')],'e','current',at('11'));
 assert.deepEqual(c.events.map(x=>x.record.id),['memo']);assert.equal(c.events[0].added,true);assert.equal(c.from,prev.createdAt);
});
test('SBAR copies literal negatives, uncertainty and task responsibility with provenance',()=>{
 const task=r('task','task',{title:'Culture pending',owner:'Team A',due:'2026-10-19T10:00',next:'Review original report',done:false});
 const h=composeHandoff(e,[e,prev,current,task,r('foreign','note',{...current.data,fields:{course:'FOREIGN'}},'other')],'en',at('11'));
 assert.equal(h.review,null);assert.ok(h.text.includes('Possible, not confirmed'));assert.ok(h.text.includes('Team A'));assert.ok(h.text.includes('2026-10-19T10:00'));assert.ok(h.text.includes('UNKNOWN / 未评估'));assert.ok(!h.text.includes('FOREIGN'));assert.ok(!h.text.includes(prev.data.fields.course));assert.ok(h.sources.every(s=>s.updatedAt&&s.version));
});
test('empty latest round cannot silently borrow the older assessment',()=>{
 const blank=r('blank','note',{kind:'daily',date:'2026-10-18',fields:{},problems:[]},'e','12');
 const h=composeHandoff(e,[e,current,blank],'en',at('13'));assert.ok(!h.text.includes('Possible, not confirmed'));assert.ok(h.text.includes('Not recorded; verify and complete.'));
});
test('new, updated, deleted sources and task completion invalidate handoff; unrelated data do not',()=>{
 const task=r('t','task',{title:'Open',done:false}),records=[e,current,task],h=composeHandoff(e,records,'en',at('12'));
 const stale=rs=>sourcesChanged({data:h},rs);
 assert.equal(stale(records),false);assert.equal(stale([...records,r('other','memo',{text:'not used'})]),false);assert.equal(stale([...records,r('foreign','lab',{},'other')]),false);
 assert.equal(stale([...records,r('lab','lab',{})]),true);assert.equal(stale(records.map(r=>r.id==='t'?{...r,data:{...r.data,done:true}}:r)),true);assert.equal(stale(records.map(r=>r.id==='current'?{...r,version:2}:r)),true);assert.equal(stale(records.filter(r=>r.id!=='current')),true);
});
test('manual handoff edits clear review and cannot replace source metadata or saved language',()=>{
 const h={...composeHandoff(e,[e,current],'en',at('12')),review:{clinician:'Original'}};
 const edited=preserveHandoff(h,{text:'Edited',sources:[],sourceEntries:[],handoffSnapshot:{},format:'other',review:{clinician:'forged'},labelLanguage:'zh'});
 assert.equal(edited.text,'Edited');assert.equal(edited.review,null);assert.deepEqual(edited.sources,h.sources);assert.deepEqual(edited.sourceEntries,h.sourceEntries);assert.deepEqual(edited.handoffSnapshot,h.handoffSnapshot);assert.equal(edited.labelLanguage,'en');assert.equal(edited.format,'wardnote-sbar/1');
});
test('eight-language SBAR labels preserve clinical source wording without Chinese UI leakage',()=>{
 for(const language of languageCodes){const h=composeHandoff(e,[e,current],language,at('12'));assert.ok(h.text.includes('Possible, not confirmed'));if(language!=='zh')assert.doesNotMatch(h.text.replaceAll('UNKNOWN / 未评估',''),/[\u3400-\u9fff]/,language);}
});

test('patient order is numeric by bed, independent of locale, deterministic and nonmutating',async()=>{
 const {orderedPatients}=await import('../public/continuity.js');
 const a=r('a','encounter',{bed:'10'}),b=r('b','encounter',{bed:'2'}),c=r('c','encounter',{}),d=r('d','encounter',{bed:'2'});
 const records=[a,c,d,current,b],before=JSON.stringify(records);
 assert.deepEqual(orderedPatients(records).map(r=>r.id),['b','d','a','c']);assert.equal(JSON.stringify(records),before);
});
