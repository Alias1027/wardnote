// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Explicit headings suggest destinations. Nothing is inserted before review.
import {SCHEMAS,PROBLEM_FIELDS,blankNote,classify} from './domain.js';
import {dictionaries,translate} from './locale-core.js';
import {appliedEvidence} from './voice-evidence.js';
import {validate,RecordError} from './record-validation.js';

const extra={
 memo:[['text','备忘']],
 task:[['title','待办'],['next','下一步 / 联系方式']],
 pending:[['title','待回报']],
 lab:[['name','检验 / 检查项目'],['value','原始结果'],['unit','单位（无量纲填“无”）'],['sampledAt','采样 / 检查时间'],['source','原报告来源 / 报告标识'],['reference','参考范围 / 备注']],
 reflection:[['title','决策与简短背景'],['reason','为什么这样判断'],['concern','担心什么'],['next','下一步验证'],['feedback','实际结果 / 带教反馈']]
};
export const GROUP_LABELS={initial:'初诊与背景',daily:'每日查房',background:'住院患者背景与持续照护需求',memo:'备忘',task:'待办',pending:'待回报',lab:'检查与化验',reflection:'决策复盘'};
const short={hpi:['主诉','现病史','chief complaint','HPI','historia de la enfermedad actual','histoire de la maladie','анамнез заболевания','تاريخ المرض الحالي','वर्तमान बीमारी का इतिहास','موجودہ بیماری کی تاریخ'],pmh:['既往史','PMH'],medications:['用药','药物','medication','medications','meds'],allergies:['过敏','allergies'],vitals:['生命体征','vitals'],results:['检查结果','化验','影像','results','labs','imaging'],exam:['查体','体检','exam'],family:['家族史','family history'],social:['社会史','social history'],course:['患者诉','患者说','subjective','病程','病程记录','间期事件','hospital course','interval events'],handoff:['交接','预案','handoff'],communication:['沟通','communication'],discharge:['出院','discharge'],goal:['今日目标','goals'],continuation:['补充记录','additional notes'],assessment:['评估','判断','assessment'],plan:['计划','plan'],evidence:['依据','evidence'],alternative:['替代解释','differential'],contingency:['应变预案','contingency']};
const special={'memo.text':['备忘','备忘录','memo','note to self','nota','mémo','заметки','مذكرات','मेमो','یادداشت'],'task.title':['待办','todo','to do','task'],'pending.title':['待回报','pending result'],'lab.name':['检验项目','检查项目','test name'],'lab.value':['检验结果','检查数值','test result'],'lab.unit':['检验单位','单位','unit'],'lab.sampledAt':['采样时间','检查时间','sample time'],'lab.source':['报告来源','检验来源','report source'],'lab.reference':['参考范围','reference range'],'reflection.reason':['决策复盘','复盘','reflection']};
const words=label=>[label,...Object.values(dictionaries).map(d=>d[label])].filter(Boolean);
export function routeTargets(kind='daily'){
 const out=[];
 for(const [group,fields] of Object.entries({...SCHEMAS,...extra})){
  for(const [field,label] of fields)out.push({id:group===kind?field:group+'.'+field,group,field,label});
  if(['initial','daily'].includes(group))for(const [field,label] of PROBLEM_FIELDS)out.push({id:group+'.problem.'+field,group,field:'problem.'+field,label});
 }
 return out;
}
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const headingCache=new Map();
export function routeCandidates(text,kind='daily'){
 if(typeof text!=='string'||!text.trim()||text.length>200000||!['initial','daily','background'].includes(kind))throw new RecordError(400,'转写文本不正确');
 const targets=routeTargets(kind);let cached=headingCache.get(kind);
 if(!cached){const aliases=new Map();
 const add=(word,t,priority)=>{const key=word.toLocaleLowerCase();if(!aliases.has(key)||aliases.get(key).priority<priority)aliases.set(key,{t,priority});};
 for(const t of targets){
  const field=t.field.replace('problem.',''),labels=[...words(t.label),...(short[field]||[]),...(special[t.group+'.'+t.field]||[])];
  const priority=t.group===kind?3:t.group==='initial'?2:1;
  for(const label of labels){add(label,t,priority);for(const prefix of [...words(GROUP_LABELS[t.group]),...({initial:['初诊','initial'],daily:['查房','daily'],background:['住院背景','background'],reflection:['复盘','reflection']}[t.group]||[])])for(const sep of [' ',' · ','/','：',':'])add(prefix+sep+label,t,6);}
 }
 const pattern=new RegExp('(^|[\\n\\r。！？；;.!?，,،؛۔।\\t ]+)('+[...aliases.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')+')\\s*[:：]','giu');
 cached={aliases,pattern};headingCache.set(kind,cached);}
 const {aliases,pattern}=cached;const hits=[...text.matchAll(pattern)],parts=[];
 // A labelled but unknown line must not be silently swallowed by the preceding field.
 for(const m of text.matchAll(/(^|\n)([^\n:：]{1,60})[:：]/gu)){if(!hits.some(h=>h.index+h[1].length>=m.index+m[1].length&&h.index+h[1].length<m.index+m[0].length))hits.push(m);}
 hits.sort((a,b)=>(a.index+a[1].length)-(b.index+b[1].length));
 const append=(chunk,t)=>{const quote=chunk.trim();if(!quote)return;parts.push({section:t?.id||'',text:quote,quotes:[quote],use:false});};
 if(!hits.length){for(const line of text.split(/\n+/)){const legacy=classify(line,kind)[0];append(line,legacy&&legacy.section!=='continuation'?targets.find(t=>t.id===legacy.section):null);}return parts;}
 append(text.slice(0,hits[0].index),null);
 for(let i=0;i<hits.length;i++){
  const hit=hits[i],start=hit.index+hit[1].length,end=i+1<hits.length?hits[i+1].index:text.length,t=aliases.get(hit[2].trim().toLocaleLowerCase())?.t;
  const quote=text.slice(start,end).trim(),body=text.slice(hit.index+hit[0].length,end).trim();
  if(!body||!t){append(quote,null);continue;}
  parts.push({section:t.id,text:['initial','daily','background'].includes(t.group)?quote:body,quotes:[quote],use:false});
 }
 return parts;
}
function targetRecords(records,encounterId,noteId,date){
 const same=records.filter(r=>r.encounterId===encounterId&&!r.data.deletedAt),selected=same.find(r=>r.id===noteId&&r.type==='note');
 if(noteId&&!selected)throw new RecordError(400,'请先选择目标记录');
 const newest=list=>list.sort((a,b)=>String(b.data.date||b.createdAt).localeCompare(String(a.data.date||a.createdAt))||b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id))[0];
 const out={};for(const kind of ['initial','daily'])out[kind]=selected?.data.kind===kind?selected:newest(same.filter(r=>r.type==='note'&&r.data.kind===kind&&(kind==='initial'||r.data.date===date)));
 out.background=newest(same.filter(r=>r.type==='background'));
 return Object.fromEntries(Object.entries(out).map(([k,r])=>[k,r?{id:r.id,version:r.version}:null]));
}
export function routingSnapshot(records,encounterId,noteId,date){return {routing:1,noteId:noteId||'',date,targets:targetRecords(records,encounterId,noteId,date)};}

// Pure planning precedes one transaction in both local and server storage.
export function planVoiceRoute(records,draft,version,clinician,labelLanguage='zh',now=new Date().toISOString()){
 const d=draft?.data,s=d?.candidateSource,encounterId=draft?.encounterId;
 const fail=message=>{throw new RecordError(409,message);};
 if(!draft||draft.type!=='voiceDraft'||draft.version!==version)fail('记录已变化，请重新载入后核对');
 if(!records.some(r=>r.id===encounterId&&r.type==='encounter'))fail('请先选择患者');
 if(!s||s.routing!==1||s.text!==d.text||s.language!==d.language||s.noteId!==(d.noteId||'')||s.sourceId!==(d.sourceId||null)||s.sourceVersion!==(d.sourceVersion||null)||!/^\d{4}-\d{2}-\d{2}$/.test(s.date))fail('原文或目标已变化，请重新生成候选');
 if(JSON.stringify(s.targets)!==JSON.stringify(targetRecords(records,encounterId,d.noteId,s.date)))fail('记录已变化，请重新载入后核对');
 const selected=records.find(r=>r.id===d.noteId),kind=selected?.data.kind||'daily',targets=routeTargets(kind),chosen=d.proposals.filter(p=>p.use===true);
 if(!chosen.length||chosen.some(p=>!targets.some(t=>t.id===p.section)||typeof p.text!=='string'||!p.text.trim()))throw new RecordError(400,'请先勾选已核对的候选内容');
 const audio=d.sourceId?records.find(r=>r.id===d.sourceId&&r.type==='recording'):null;
 if(d.sourceId&&(!audio||audio.encounterId!==encounterId||audio.version!==d.sourceVersion||audio.data.deletedAt))fail('录音来源已变化，请重新核对');
 const evidence=appliedEvidence(chosen,d.text,audio),groups=new Map(),t=label=>translate(label,labelLanguage);
 for(const [i,p] of chosen.entries()){
  const target=targets.find(x=>x.id===p.section),key=target.group;
  if(!groups.has(key)){
   const ref=s.targets[key],old=ref?records.find(r=>r.id===ref.id):null;
   const type=['initial','daily'].includes(key)?'note':key==='pending'?'task':key;
   const data=old?structuredClone(old.data):type==='note'?{...blankNote(key),date:s.date}:key==='background'?{fields:{}}:key==='memo'?{title:t('语音录入'),text:'',date:s.date}:type==='task'?{title:'',kind:key==='pending'?'result':'task',done:false,owner:'',due:'',next:'',outcome:''}:key==='lab'?{name:'',value:'',unit:'',sampledAt:'',source:'',reference:'',verified:false}:{title:t('决策复盘'),date:s.date,reason:'',concern:'',next:'',feedback:''};
   groups.set(key,{id:old?.id,version:old?.version,type,encounterId,data,evidence:[],problem:null});
  }
  const g=groups.get(key);g.evidence.push(evidence[i]);
  const append=(o,k)=>o[k]=[o[k],p.text.trim()].filter(Boolean).join('\n');
  if(target.field.startsWith('problem.')){if(!g.problem){g.problem={};g.data.problems.push(g.problem);}append(g.problem,target.field.slice(8));}
  else append(['note','background'].includes(g.type)?g.data.fields:g.data,target.field);
 }
 const changes=[...groups.values()].map(g=>{
  const entry={...d.provenance,sourceId:d.sourceId||null,sourceVersion:d.sourceVersion||null,evidence:g.evidence,reviewedAt:now,clinician};
  g.data.assistance=[...(g.data.assistance||[]),entry];
  if(g.type==='note'){g.data.review=null;if(audio){g.data.sources=(g.data.sources||[]).filter(x=>x.id!==audio.id);g.data.sources.push({id:audio.id,version:audio.version});}}
  if(g.type==='memo'){g.data.voiceReview={clinician,time:now};if(audio)g.data.voiceSource={id:audio.id,version:audio.version,title:audio.data.title,recordedAt:audio.createdAt,transcript:d.text};}
  if(g.type==='lab'){g.data.date=g.data.sampledAt.slice(0,10);if(g.data.sampledAt&&!Number.isFinite(Date.parse(g.data.sampledAt)))throw new RecordError(400,'检验需要项目、结果、单位、采样时间和来源');}
  validate(g.type,g.data);return {id:g.id,version:g.version,type:g.type,encounterId,data:g.data};
 });
 return {changes,draftData:{...d,proposals:[],candidateSource:null}};
}
