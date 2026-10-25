import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {routeCandidates,routingSnapshot,planVoiceRoute} from '../public/voice-routing.js';
import {conversationCandidates,completeConversationReview,reviewReason} from '../public/voice-conversation.js';
import {groundCandidates,evidenceFor,audioEvidence} from '../public/voice-evidence.js';
import {modelDraft} from '../lib/model-service.mjs';
import {blankNote} from '../public/domain.js';
import {validate} from '../public/record-validation.js';
import {languageCodes} from '../public/languages.js';
import {translate} from '../public/locale-core.js';

const turns=[
 'Doctor: Good morning.',
 'Patient: My daughter moved out. I now live alone and cannot afford transport.',
 'Patient: My brother had a heart attack last year.',
 'Doctor: I have also been sleeping badly recently.',
 'Doctor: If the fever continues tomorrow, we might consider further tests.',
 'Patient: No chest pain. I cannot remember when the cough started.',
 'Speaker A: [overlap / inaudible] 15 or 50 mg?',
 'Patient: Sure, I feel like running a marathon! [laughs]',
 '患者：谢谢，但我上楼就喘。',
 '家属：我自己有糖尿病。患者没有说自己有。'
];
test('simulated mixed conversation preserves every utterance, person, qualifier and dose uncertainty for review',()=>{
 const text=turns.join('\n'),p=routeCandidates(text,'daily','conversation');
 assert.equal(p.length,turns.length);assert.equal(p[0].reviewReason,'smalltalk');
 assert.ok(p.slice(1).every(p=>p.reviewReason==='context'));
 for(let i=0;i<p.length;i++){assert.equal(p[i].text,turns[i]);assert.deepEqual(p[i].quotes,[turns[i]]);assert.equal(p[i].use,false);assert.equal(p[i].reviewOnly,true);assert.equal(p[i].section,'');}
 assert.equal(reviewReason('Hello, I feel faint.'),'context');
 assert.equal(reviewReason('今天天气真不错，但我走路头晕。'),'context');
 assert.equal(routeCandidates('Memo: Call tomorrow')[0].section,'memo.text');
 assert.equal(routeCandidates('Memo: Call tomorrow','daily','conversation')[0].section,'');
});
test('long and unlabelled dialogue retains exact evidence with no guessed speaker identity',()=>{
 const source=Array.from({length:170},()=> 'Speaker A: repeated words').join('\r\n');
 const p=conversationCandidates(source);assert.equal(p.length,100);
 for(const x of p)assert.ok(evidenceFor(x,source).length);
 assert.equal(p.at(-1).text.split('\r\n').length,71);
 assert.equal(conversationCandidates('Unlabelled uncertain statement')[0].reviewOnly,true);
});
test('model omissions are retained; repeated quotations never count as complete coverage',()=>{
 const source=turns.join('\n');const raw=[{section:'course',text:turns[5],quotes:[turns[5]]}];
 const out=completeConversationReview(groundCandidates(raw,source),source,raw);
 assert.equal(out[0].use,false);assert.equal(out.filter(p=>p.reviewOnly).length,2);
 for(const turn of turns)assert.ok(out.some(p=>p.quotes.some(q=>q.includes(turn))),turn);
 const repeat='Patient: No pain.\nRelative: No pain.';
 const result=completeConversationReview(groundCandidates([{section:'course',text:'No pain.',quotes:['No pain.']}],repeat),repeat);
 assert.ok(result.some(p=>p.reviewOnly&&p.text===repeat));
 assert.equal(completeConversationReview([],source)[0].text,source);
});
function fixture(){
 const date='2026-10-25',text=turns.join('\n'),at=date+'T08:00:00Z';
 const record=(id,type,data,encounterId='e')=>({id,type,data,encounterId,version:1,createdAt:at,updatedAt:at});
 const records=[record('e','encounter',{displayName:'Synthetic'},''),record('n','note',{...blankNote(),date})];
 const d=record('d','voiceDraft',{text,language:'original',inputMode:'conversation',noteId:'n',proposals:routeCandidates(text,'daily','conversation'),candidateSource:{...routingSnapshot(records,'e','n',date),text,language:'original',inputMode:'conversation',sourceId:null,sourceVersion:null}});
 return {records:[...records,d],d};
}
test('held content cannot be inserted even if checked; promotion and explicit review are separate steps',()=>{
 const {records,d}=fixture(),p=d.data.proposals[1];p.use=true;p.section='initial.social';
 assert.throws(()=>planVoiceRoute(records,d,1,'Synthetic'),/勾选/);p.use=false;p.reviewOnly=false;
 assert.throws(()=>planVoiceRoute(records,d,1,'Synthetic'),/勾选/);p.use=true;
 const out=planVoiceRoute(records,d,1,'Synthetic');
 assert.equal(out.changes.length,1);assert.equal(out.changes[0].data.fields.social,turns[1]);
 assert.equal(out.changes[0].data.assistance[0].inputMode,'conversation');
 assert.equal(out.draftData.text,d.data.text);assert.equal(out.draftData.proposals.length,9);
 assert.equal(out.draftData.candidateSource,null);assert.ok(out.draftData.proposals.every(p=>p.reviewOnly&&!p.use));
});
test('changing mode invalidates candidates and invalid stored modes are rejected',()=>{
 const {records,d}=fixture();d.data.inputMode='dictation';assert.throws(()=>planVoiceRoute(records,d,1,'Synthetic'),/原文或目标/);
 d.data.inputMode='arbitrary';assert.throws(()=>validate('voiceDraft',d.data),/语音草稿/);
 assert.throws(()=>routeCandidates('text','daily','arbitrary'),/语音草稿/);
});
test('held source retains playback anchors only when transcript and timing remain valid',()=>{
 const source=turns[0],p=conversationCandidates(source)[0],r={data:{transcript:source,duration:3,transcriptSegments:[{text:source,start:0,end:2,speaker:'A'}]}};
 const before=JSON.stringify(r);assert.equal(audioEvidence(evidenceFor(p,source),source,r)[0].start,0);
 assert.equal(JSON.stringify(r),before);assert.deepEqual(audioEvidence(evidenceFor(p,source),source+' change',r),[]);
});
test('eight interfaces have mode and review labels',()=>{
 const labels=['整理模式','医生口述','医患对话','暂不纳入记录','疑似寒暄 · 请回看','语境或人物待核对','模型未采用的原文 · 请回看','移至待核对候选'];
 for(const lang of languageCodes)for(const label of labels){const value=translate(label,lang);assert.ok(value);if(lang!=='zh')assert.doesNotMatch(value,/[\u3400-\u9fff]/);}
});
test('model adapter requests conversation safeguards, preserves omitted context and rejects fabricated quotes',async()=>{
 let request,reply=[];
 const service=http.createServer(async(req,res)=>{let body='';for await(const c of req)body+=c;request=JSON.parse(body);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:JSON.stringify({proposals:reply})}}]}));});
 await new Promise(r=>service.listen(0,'127.0.0.1',r));
 try{
  const config={llm:{enabled:true,provider:'custom',baseUrl:'http://127.0.0.1:'+service.address().port,model:'simulation'}},source=turns.join('\n');
  const empty=await modelDraft({text:source,inputMode:'conversation'},config);
  assert.equal(empty.proposals[0].text,source);assert.equal(empty.proposals[0].reviewOnly,true);assert.equal(request.messages[1].content,source);
  assert.match(request.messages[0].content,/NOT authenticated roles/);assert.match(request.messages[0].content,/conditional plans/);assert.equal(empty.provenance.inputMode,'conversation');
  reply=[{section:'course',text:turns[5],quotes:[turns[5]]}];
  const valid=await modelDraft({text:source,inputMode:'conversation'},config);assert.equal(valid.proposals.length,3);assert.ok(valid.proposals.every(p=>!p.use));
  reply=[{section:'',text:'Good morning.',quotes:[turns[0]],reviewOnly:true}];
  assert.ok((await modelDraft({text:source,inputMode:'conversation'},config)).proposals[0].reviewOnly);
  reply=[{section:'course',text:'invented',quotes:['NOT IN SOURCE']}];await assert.rejects(modelDraft({text:source,inputMode:'conversation'},config),/原文依据/);
 }finally{await new Promise(r=>service.close(r));}
});
