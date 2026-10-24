import test from 'node:test';import assert from 'node:assert/strict';
import {routeCandidates,routeTargets,routingSnapshot,planVoiceRoute} from '../public/voice-routing.js';
import {SCHEMAS,blankNote} from '../public/domain.js';
import {translate} from '../public/locale-core.js';
import {languageCodes} from '../public/languages.js';
const date='2026-10-18',at=date+'T12:00:00Z';
const record=(id,type,data,encounterId='e')=>({id,type,data,encounterId,version:1,createdAt:at,updatedAt:at});
const encounter=()=>record('e','encounter',{displayName:'Fictional',admitted:date},'');
function fixture(text,noteId='',rest=[]){const records=[encounter(),...rest],draft=record('d','voiceDraft',{text,language:'original',noteId,proposals:routeCandidates(text,rest.find(r=>r.id===noteId)?.data.kind||'daily').map(p=>({...p,use:true})),candidateSource:{...routingSnapshot(records,'e',noteId,date),text,language:'original',sourceId:null,sourceVersion:null}});return {records:[...records,draft],draft};}
test('one-line dictation splits explicit headings into reviewed destinations without changing clinical words',()=>{
 const r=routeCandidates('备忘：明天核对。现病史：无胸痛，起病不详。计划：暂缓阿莫西林 500 mg');
 assert.deepEqual(r.map(p=>p.section),['memo.text','initial.hpi','daily.problem.plan']);assert.equal(r[1].text,'现病史：无胸痛，起病不详');assert.ok(r.every(p=>p.use===false));assert.ok(r[2].text.includes('暂缓阿莫西林 500 mg'));
});
test('all eight interface headings route initial, daily and background fields consistently',()=>{
 for(const lang of languageCodes)for(const [kind,fields] of Object.entries(SCHEMAS))for(const [key,label] of fields){const text=translate(label,lang)+': SOURCE_UNCHANGED';const p=routeCandidates(text,kind);assert.equal(p.length,1,lang+' '+label);assert.equal(p[0].section,key,lang+' '+kind+' '+label);assert.equal(p[0].text,text);}
 for(const lang of languageCodes){const [p]=routeCandidates(translate('备忘',lang)+': ORIGINAL');assert.equal(p.section,'memo.text');assert.equal(p.text,'ORIGINAL');}
});
test('unclassified text and empty headings require manual selection; evidence is always an exact substring',()=>{
 for(const text of ['不明确的口述','Memo:'])assert.equal(routeCandidates(text)[0].section,'');
 assert.notEqual(routeCandidates('患者说他记得备忘录上写着未定')[0].section,'memo.text');
 const text='Unknown intro\nMemo: Keep original\nHPI: No pain';const r=routeCandidates(text);assert.equal(r[0].section,'');for(const p of r)for(const q of p.quotes)assert.ok(text.includes(q));
});
test('no clinical records are created by classification; planning appends and leaves checks unsigned',()=>{
 const note=record('n','note',{...blankNote(),date,fields:{course:'OLD'},review:{clinician:'old'}});const {records,draft}=fixture('病程：无变化。备忘：核对资料。待办：联系主管。交接：如发热请复核','n',[note]);const original=JSON.stringify(records);
 const p=planVoiceRoute(records,draft,1,'Test');assert.equal(JSON.stringify(records),original);assert.equal(p.changes.length,3);const n=p.changes.find(r=>r.type==='note');assert.equal(n.data.fields.course,'OLD\n病程：无变化');assert.equal(n.data.review,null);assert.ok(n.data.fields.handoff.includes('如发热'));assert.equal(p.changes.find(r=>r.type==='task').data.done,false);assert.equal(p.draftData.proposals.length,0);
});
test('all supported text destinations have a selectable target and new initial/background records are planned',()=>{
 const {records,draft}=fixture('现病史：无胸痛。住院患者背景与持续照护需求/相关既往病史：糖尿病。评估：原因不明。计划：复核。决策复盘：需验证');
 const p=planVoiceRoute(records,draft,1,'Test');assert.equal(p.changes.length,4);assert.ok(p.changes.find(r=>r.type==='background').data.fields.pmh.includes('糖尿病'));assert.equal(p.changes.find(r=>r.type==='reflection').data.reason,'需验证');assert.ok(p.changes.find(r=>r.data.kind==='daily').data.problems[0].assessment.includes('原因不明'));assert.ok(routeTargets().every(t=>t.group&&t.field&&t.label));
});
test('structured lab fields require exact source data; missing unit/time/source abort the whole plan',()=>{
 const {records,draft}=fixture('备忘：保留。检验项目：肌酐。检验结果：1.2');const before=JSON.stringify(records);assert.throws(()=>planVoiceRoute(records,draft,1,'Test'),/检验需要/);assert.equal(JSON.stringify(records),before);
 const f=fixture('检验项目：肌酐\n检验结果：1.2\n单位：mg/dL\n采样时间：2026-10-18T08:30\n报告来源：DEMO_REPORT');const lab=planVoiceRoute(f.records,f.draft,1,'Test').changes[0];assert.equal(lab.type,'lab');assert.equal(lab.data.value,'1.2');assert.equal(lab.data.unit,'mg/dL');assert.equal(lab.data.verified,false);
});
test('stale target, newly created target and changed transcript reject all changes',()=>{
 const f=fixture('备忘：原文');f.draft.data.text+=' changed';assert.throws(()=>planVoiceRoute(f.records,f.draft,1,'Test'),/原文或目标/);
 const g=fixture('病程：原文');g.records.push(record('new','note',{...blankNote(),date}));assert.throws(()=>planVoiceRoute(g.records,g.draft,1,'Test'),/记录已变化/);
 assert.throws(()=>planVoiceRoute(g.records,g.draft,99,'Test'),/记录已变化/);
});
test('cross-patient target/source, invented quotes and unchecked content cannot be applied',()=>{
 const f=fixture('备忘：原文');f.draft.data.proposals[0].use=false;assert.throws(()=>planVoiceRoute(f.records,f.draft,1,'Test'),/勾选/);
 f.draft.data.proposals[0].use=true;f.draft.data.proposals[0].quotes=['invented'];assert.throws(()=>planVoiceRoute(f.records,f.draft,1,'Test'),/原文依据/);
 const foreign=record('foreign','note',blankNote(),'other');assert.throws(()=>fixture('病程：原文','foreign',[foreign]),/目标记录/);
 const g=fixture('备忘：原文');g.records.push(record('a','recording',{transcript:'备忘：原文'},'other'));Object.assign(g.draft.data,{sourceId:'a',sourceVersion:1});Object.assign(g.draft.data.candidateSource,{sourceId:'a',sourceVersion:1});assert.throws(()=>planVoiceRoute(g.records,g.draft,1,'Test'),/录音来源/);
});
test('memo provenance retains original recording and exact source while correcting candidate text',()=>{
 const f=fixture('备忘：无胸痛');const audio=record('a','recording',{transcript:f.draft.data.text,title:'Original',duration:2,finalized:true});f.records.push(audio);Object.assign(f.draft.data,{sourceId:'a',sourceVersion:1});Object.assign(f.draft.data.candidateSource,{sourceId:'a',sourceVersion:1});f.draft.data.proposals[0].text='无胸痛，已回听核对';const p=planVoiceRoute(f.records,f.draft,1,'Test');assert.equal(p.changes[0].data.voiceSource.transcript,'备忘：无胸痛');assert.equal(p.changes[0].data.assistance[0].evidence[0].quotes[0],'备忘：无胸痛');assert.equal(audio.version,1);
});
