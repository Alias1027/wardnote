// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Read-only comparison and literal SBAR assembly. No inference or model calls.
import {translate} from './locale-core.js';
const text=v=>typeof v==='string'?v.trim():'';
const live=r=>!r.data.deletedAt;
const ordered=rs=>[...rs].sort((a,b)=>(b.data.date||'').localeCompare(a.data.date||'')||b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));
export const dailyNotes=(records,id)=>ordered(records.filter(r=>r.encounterId===id&&r.type==='note'&&r.data.kind==='daily'&&live(r)));
// Optional manual task links retain the selected source, never match by diagnosis text.
const problemSnapshot=p=>Object.fromEntries(['title','assessment','plan','monitor','contingency'].map(key=>[key,text(p?.[key])]));
export function validProblemReference(ref){
 return !!ref&&typeof ref==='object'&&!Array.isArray(ref)&&ref.format==='wardnote-task-problem/1'&&
  ['encounterId','noteId'].every(k=>typeof ref[k]==='string'&&ref[k].length>0&&ref[k].length<=100)&&
  Number.isSafeInteger(ref.problemIndex)&&ref.problemIndex>=0&&ref.problemIndex<1000&&Number.isSafeInteger(ref.sourceVersion)&&ref.sourceVersion>0&&
  ['sourceUpdatedAt','linkedAt'].every(k=>typeof ref[k]==='string'&&Number.isFinite(Date.parse(ref[k])))&&
  typeof ref.noteDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(ref.noteDate)&&
  !!ref.problem&&typeof ref.problem==='object'&&!Array.isArray(ref.problem)&&
  ['title','assessment','plan','monitor','contingency'].every(k=>typeof ref.problem[k]==='string'&&ref.problem[k].length<=50000)&&!!ref.problem.title.trim();
}
export function taskProblemChoices(records,encounterId){
 return ordered(records.filter(r=>r.encounterId===encounterId&&r.type==='note'&&['initial','daily'].includes(r.data.kind)&&live(r)))
  .flatMap(note=>(note.data.problems||[]).map((problem,index)=>({note,index,problem})).filter(({problem})=>text(problem.title)));
}
export function captureProblemReference(records,encounterId,noteId,problemIndex,now=new Date().toISOString()){
 const source=records.find(r=>r.id===noteId&&r.encounterId===encounterId&&r.type==='note'&&['initial','daily'].includes(r.data.kind)&&live(r));
 if(!source||!Number.isSafeInteger(problemIndex)||!source.data.problems?.[problemIndex]||!text(source.data.problems[problemIndex].title))throw new Error('关联来源已变化，请重新选择问题。');
 const ref={format:'wardnote-task-problem/1',encounterId,noteId,problemIndex,sourceVersion:source.version,noteDate:source.data.date,sourceUpdatedAt:source.updatedAt,linkedAt:now,problem:problemSnapshot(source.data.problems[problemIndex])};
 if(!validProblemReference(ref))throw new Error('关联来源已变化，请重新选择问题。');
 return ref;
}
export function problemReferenceState(task,records,encounterId=task?.encounterId){
 const ref=task?.data?.problemRef;
 if(!ref)return {state:'none',reference:null,source:null};
 if(!validProblemReference(ref)||task.type!=='task'||task.encounterId!==encounterId||ref.encounterId!==encounterId)return {state:'unavailable',reference:null,source:null};
 const actual=records.find(r=>r.id===ref.noteId);
 if(actual&&(actual.encounterId!==encounterId||actual.type!=='note'||!['initial','daily'].includes(actual.data.kind)))return {state:'unavailable',reference:null,source:null};
 const source=actual&&live(actual)?actual:null;
 if(!source)return {state:'unavailable',reference:ref,source:null};
 const same=source.version===ref.sourceVersion&&source.updatedAt===ref.sourceUpdatedAt&&JSON.stringify(problemSnapshot(source.data.problems?.[ref.problemIndex]))===JSON.stringify(ref.problem);
 return {state:same?'current':'changed',reference:ref,source};
}
export function roundFeedback(records,encounterId,noteId,now=new Date().toISOString()){
 const changes=roundChanges(records,encounterId,noteId,now);
 if(!changes.previous)return {previous:null,plans:[],linked:[]};
 const previous=changes.previous;
 const plans=(previous.data.problems||[]).map((problem,index)=>({index,...problemSnapshot(problem)})).filter(p=>p.title||p.plan||p.monitor);
 const linked=records.filter(r=>r.type==='task'&&r.encounterId===encounterId&&live(r)&&r.data.problemRef?.noteId===previous.id&&r.updatedAt<=changes.to)
  .map(task=>({task,...problemReferenceState(task,records,encounterId)})).filter(item=>item.reference)
  .sort((a,b)=>(a.task.data.done?1:0)-(b.task.data.done?1:0)||(b.task.updatedAt||'').localeCompare(a.task.updatedAt||''));
 return {previous,plans,linked};
}
export function roundChanges(records,id,noteId,now=new Date().toISOString()){
 const notes=dailyNotes(records,id),index=notes.findIndex(r=>r.id===noteId),current=notes[index],previous=notes[index+1];
 if(!current||!previous)return {current,previous,fields:[],missing:[],events:[]};
 const keys=[...new Set([...Object.keys(previous.data.fields||{}),...Object.keys(current.data.fields||{})])];
 const fields=keys.filter(k=>text(previous.data.fields?.[k])!==text(current.data.fields?.[k])).map(key=>({key,before:text(previous.data.fields?.[key]),after:text(current.data.fields?.[key])}));
 const from=previous.createdAt,to=index===0?now:current.updatedAt;
 const events=records.filter(r=>r.encounterId===id&&live(r)&&!notes.some(n=>n.id===r.id)&&['note','background','lab','task','memo','recording'].includes(r.type)&&r.updatedAt>from&&r.updatedAt<=to).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(r=>({record:r,added:r.createdAt>from}));
 return {current,previous,from,to,fields,events,problemsChanged:JSON.stringify(previous.data.problems||[])!==JSON.stringify(current.data.problems||[])};
}
const eligible=(records,id)=>records.filter(r=>live(r)&&(r.id===id&&r.type==='encounter'||r.encounterId===id&&(['note','background','lab'].includes(r.type)||r.type==='task'&&!r.data.done)));
const snapshot=(records,id)=>eligible(records,id).map(r=>({id:r.id,version:r.version})).sort((a,b)=>a.id.localeCompare(b.id));
export function handoffStale(data,records){return JSON.stringify(data.handoffSnapshot?.records)!==JSON.stringify(snapshot(records,data.handoffSnapshot?.encounterId));}
export function preserveHandoff(old,input){return old.format==='wardnote-sbar/1'?{...old,text:input?.text,review:null}:input?.format==='wardnote-sbar/1'?{...input,format:old.format,handoffSnapshot:undefined,sourceEntries:undefined}:input;}
export function composeHandoff(encounter,records,labelLanguage='zh',now=new Date().toISOString()){
 const t=s=>translate(s,labelLanguage),id=encounter.id,same=eligible(records,id),entries=[],sources=[];
 const add=(block,r,path,label,value)=>{if(!r||!text(value))return;if(!sources.some(s=>s.id===r.id))sources.push({id:r.id,version:r.version,type:r.type,kind:r.data.kind||'',date:r.data.date||r.createdAt.slice(0,10),updatedAt:r.updatedAt,reviewed:r.type==='lab'?!!r.data.verified:!!r.data.review});entries.push({block,sourceId:r.id,path,label,text:text(value)});};
 const daily=dailyNotes(same,id)[0],initial=ordered(same.filter(r=>r.type==='note'&&r.data.kind==='initial'))[0],background=ordered(same.filter(r=>r.type==='background'))[0];
 const f=(block,r,keys)=>{for(const [key,label] of keys)add(block,r,key,label,r?.data.fields?.[key]);};
 const d=encounter.data;
 add('S',encounter,'identity','患者信息',[d.displayName,d.bed,d.caseId].filter(Boolean).join(' · '));
 if(d.acuity)add('S',encounter,'acuity','病情状态',t(({stable:'稳定',serious:'病重',critical:'病危',watch:'旧状态待确认',urgent:'旧状态待确认'})[d.acuity]||'未核实'));
 add('S',encounter,'codeStatus','复苏医嘱状态 / Code status',d.codeStatus?d.codeStatus+' · '+t(d.codeVerified?'已核对':'待核对'):'');
 add('B',encounter,'allergySummary','重要过敏 / 反应',d.allergySummary);
 add('B',encounter,'precautions','隔离 / 防护及原因',d.precautions);
 f('S',daily,[['course','住院病程与近期变化'],['vitals','生命体征、氧疗与出入量']]);
 f('B',initial,[['hpi','就诊诉求与现病史'],['pmh','既往病史'],['medications','用药史'],['allergies','过敏史及反应']]);
 f('B',background,[['pmh','相关既往病史'],['function','基线功能与精神状态'],['goals','诊疗目标与决策'],['updates','背景信息更新（注明日期）']]);
 f('A',daily,[['exam','重点查体与系统回顾'],['results','关键结果与趋势']]);
 for(const [i,p] of (daily?.data.problems||[]).entries())for(const [key,label,block] of [['assessment','当前判断 / 状态','A'],['evidence','支持与反对的依据','A'],['alternative','替代解释 / 不确定性','A'],['plan','主要计划','R'],['monitor','预期反应 / 监测与复核','R'],['contingency','如果…则… / 升级条件','R']])add(block,daily,'problems.'+i+'.'+key,label,text(p[key])?[p.title,p[key]].filter(Boolean).join('：'):'');
 f('R',daily,[['goal','今日目标与优先级'],['handoff','应变预案与交接'],['discharge','出院计划']]);
 for(const r of same.filter(r=>r.type==='task').sort((a,b)=>(a.data.due||'9999').localeCompare(b.data.due||'9999')||a.createdAt.localeCompare(b.createdAt))){const d=r.data;add('R',r,'task',d.kind==='result'?'待回报':'待办',[d.title,t('负责人')+': '+(d.owner||t('未指定')),t('到期时间')+': '+(d.due||t('未填')),t('下一步 / 联系方式')+': '+(d.next||t('未填'))].join('\n'));}
 const blocks=[['S','S · 当前情况'],['B','B · 相关背景'],['A','A · 已记录的评估'],['R','R · 后续计划与待办']];
 const lines=[t('简版交接预览（SBAR）'),t('生成时间')+': '+now,t('仅汇集已记录内容；请补充遗漏并核对，不代表已完成正式交接。')];
 for(const [block,label] of blocks){lines.push('',t(label));const es=entries.filter(e=>e.block===block);lines.push(...(es.length?es.map(e=>t(e.label)+': '+e.text+' ['+(sources.findIndex(s=>s.id===e.sourceId)+1)+']'):[t('未录入；请核实并补充。')]));}
 lines.push('',t('来源记录与时间'));sources.forEach((s,i)=>lines.push('['+(i+1)+'] '+t(s.type==='encounter'?'患者信息':s.type==='task'?'待办':s.type==='background'?'初诊与背景':s.kind==='initial'?'初诊':'查房')+' · '+s.date+' · '+t('来源版本')+' '+s.version+' · '+s.updatedAt+' · '+t(s.reviewed?'已复核':'待核对')));
 return {format:'wardnote-sbar/1',text:lines.join('\n'),labelLanguage,language:'original',generatedAt:now,from:encounter.data.admitted,to:now.slice(0,10),sources,sourceEntries:entries,handoffSnapshot:{encounterId:id,records:snapshot(records,id)},review:null};
}

// Same bed order in the census and bedside navigation; never derive clinical priority.
export function orderedPatients(records){
 return records.filter(r=>r.type==='encounter').slice().sort((a,b)=>
  (a.data.bed||'\uffff').localeCompare(b.data.bed||'\uffff','en',{numeric:true})||
  a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
}
