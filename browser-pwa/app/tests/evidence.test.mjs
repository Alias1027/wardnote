// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {groundCandidates,evidenceFor,normalizeTranscript,audioEvidence,appliedEvidence} from '../public/voice-evidence.js';
import {composeSummary,blankNote} from '../public/domain.js';

test('source quotes preserve medication status, negation, uncertainty and the information subject',()=>{
 const source='家属：母亲有高血压。\n用药：阿莫西林 500 mg，先不要吃，频次待核实。';
 const p=groundCandidates([{section:'medications',text:'Amoxicillin 500 mg withheld; frequency uncertain.',quotes:['用药：阿莫西林 500 mg，先不要吃，频次待核实。']}],source)[0];
 assert.equal(p.use,false);assert.equal(p.quotes[0],source.split('\n')[1]);
 assert.throws(()=>groundCandidates([{section:'medications',text:'Take twice daily',quotes:['阿莫西林 500 mg，每日两次']}],source),/原文依据/);
 const kept=appliedEvidence([{...p,use:true}],source,null)[0];assert.deepEqual(kept.quotes,p.quotes);assert.equal(kept.text,p.text);
});
test('plain-text transcription remains compatible and malformed optional segments are rejected',()=>{
 assert.deepEqual(normalizeTranscript({text:'No pain'}),{text:'No pain',segments:[]});
 for(const segments of [{},[{text:'invented',start:0,end:1}],[{text:'No pain',start:2,end:1}],[{text:'No pain',start:0,end:Infinity}],[{text:'No pain',start:0,end:1,speaker:{role:'patient'}}]])assert.throws(()=>normalizeTranscript({text:'No pain',segments}),/片段格式/);
 assert.throws(()=>normalizeTranscript({text:' '}),/text/);
});
test('audio anchors require exact unchanged text and valid segment positions',()=>{
 const text='No chest pain.\nDose uncertain.',segments=normalizeTranscript({text,segments:[{text:'No chest pain.',start:2,end:5,speaker:'A'},{text:'Dose uncertain.',start:7,end:9,speaker:'B'}]}).segments;
 const r={data:{transcript:text,transcriptSegments:segments,duration:12}};
 const evidence=evidenceFor({quotes:['Dose uncertain.']},text);
 assert.deepEqual(audioEvidence(evidence,text,r),[{start:7,end:9,speakers:['B']}]);
 assert.deepEqual(audioEvidence(evidence,text+' edited',r),[]);
 assert.deepEqual(audioEvidence(evidence,text,{data:{...r.data,duration:3}}),[]);
 assert.deepEqual(audioEvidence(evidence,text,{data:{...r.data,deletedAt:'today'}}),[]);
});
test('repeated quotes never receive an invented unique text or audio position',()=>{
 const text='No pain. No pain.',e=evidenceFor({quotes:['No pain.']},text);
 assert.equal(e[0].start,null);assert.equal(e[0].end,null);
 assert.deepEqual(audioEvidence(e,text,{data:{transcript:text,transcriptSegments:[{text:'No pain.',start:1,end:2},{text:'No pain.',start:3,end:4}],duration:5}}),[]);
 assert.equal(groundCandidates([{section:'course',text:'No pain.',quotes:['No pain.']}],text)[0].quotes[0],'No pain.');
});
test('reviewed evidence remains a snapshot when a draft is reused',()=>{
 const p={section:'course',text:'No pain',quotes:['No pain'],use:true},out=appliedEvidence([p],'No pain',null);
 p.text='Other';p.quotes[0]='Other';assert.equal(out[0].text,'No pain');assert.equal(out[0].quotes[0],'No pain');
 assert.throws(()=>appliedEvidence([{section:'course',text:'Invented',quotes:['absent']}],'No pain',null),/原文依据/);
});
test('pre-round review and completion evidence survive summary export without creating new orders',()=>{
 const e={id:'e',version:1,data:{displayName:'Fixture',admitted:'2026-10-16'}},n={id:'n',type:'note',encounterId:'e',version:1,createdAt:'2026-10-16',data:{...blankNote(),date:'2026-10-16',preRound:{nursing:{checkedAt:'2026-10-16T01:00:00Z'},notes:'Review overnight chart'}}},task={id:'t',type:'task',encounterId:'e',version:1,createdAt:'2026-10-16',data:{title:'Check report',done:true,outcome:'Source checked; discussed with supervisor',completedAt:'2026-10-16T03:00:00Z'}};
 const summary=composeSummary(e,[n,task],'2026-10-16','2026-10-16','en');
 for(const value of ['Nursing notes','Review overnight chart','Source checked; discussed with supervisor','2026-10-16T03:00:00Z'])assert.ok(summary.text.includes(value));
 assert.equal(blankNote().preRound,undefined);
});
