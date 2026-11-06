// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Local extraction only. Source words, negatives and uncertainty remain verbatim.
import {translate} from './locale-core.js';
export const BRIEF_FIELDS=[['reason','就诊原因'],['background','既往重点'],['status','最近状态'],['focus','当前重点']];
const FOCUS_LABELS={alternative:'未决问题',monitor:'下一复核',contingency:'应变条件',plan:'主要计划'};
export const briefEntryLabel=entry=>entry.key==='focus'?FOCUS_LABELS[entry.path.match(/^problems\.\d+\.(alternative|monitor|contingency|plan)$/)?.[1]]||'':'';
const text=v=>typeof v==='string'?v.trim():'';
const newest=list=>list.sort((a,b)=>(b.data.date||b.updatedAt).localeCompare(a.data.date||a.updatedAt)||b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id))[0];
export const currentBrief=(records,id)=>newest(records.filter(r=>r.type==='brief'&&r.encounterId===id&&!r.data.deletedAt));
function extract(records,id){
 const same=records.filter(r=>r.encounterId===id&&!r.data.deletedAt),entries=[];
 const add=(key,r,path,value)=>{if(r&&text(value))entries.push({key,sourceId:r.id,path,text:text(value)});};
 // Select the latest record first, including an empty new entry. Never use an
 // older diagnosis or plan to fill a gap in the current record.
 const initial=newest(same.filter(r=>r.type==='note'&&r.data.kind==='initial'));
 const bg=newest(same.filter(r=>r.type==='background'));
 const daily=newest(same.filter(r=>r.type==='note'&&r.data.kind==='daily'));
 add('reason',initial,'hpi',initial?.data.fields?.hpi);
 for(const r of [initial,bg])for(const k of ['pmh','function',...(r===bg?['updates']:[])])add('background',r,k,r?.data.fields?.[k]);
 for(const k of ['course','vitals'])add('status',daily,k,daily?.data.fields?.[k]);
 add('focus',daily,'goal',daily?.data.fields?.goal);
 (daily?.data.problems||[]).forEach((p,i)=>{
  if(text(p.assessment))add('status',daily,'problems.'+i+'.assessment',[text(p.title),text(p.assessment)].filter(Boolean).join('：'));
  for(const key of ['alternative','monitor','contingency','plan'])if(text(p[key]))add('focus',daily,'problems.'+i+'.'+key,[text(p.title),text(p[key])].filter(Boolean).join('：'));
 });
 for(const r of same.filter(r=>r.type==='task'&&!r.data.done).sort((a,b)=>(a.data.due||'9999').localeCompare(b.data.due||'9999')||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)))add('focus',r,'task',[text(r.data.title),text(r.data.next)].filter(Boolean).join('\n'));
 // Empty latest records still belong to the snapshot: their creation or edits
 // invalidate an older brief while leaving its saved text/history untouched.
 const ids=new Set([...entries.map(x=>x.sourceId),...[initial,bg,daily].filter(Boolean).map(r=>r.id)]);
 const sources=same.filter(r=>ids.has(r.id)).sort((a,b)=>a.id.localeCompare(b.id)).map(r=>({id:r.id,version:r.version,type:r.type,kind:r.data.kind||'',date:r.data.date||r.createdAt.slice(0,10),updatedAt:r.updatedAt,reviewed:!!r.data.review}));
 return {entries,sources};
}
export function composeBrief(records,id,labelLanguage='zh',now=new Date().toISOString()){
 const {entries,sources}=extract(records,id);
 const fields=Object.fromEntries(BRIEF_FIELDS.map(([key])=>[key,[...new Set(entries.filter(e=>e.key===key).map(e=>{const label=briefEntryLabel(e);return label?translate(label,labelLanguage)+': '+e.text:e.text;}))].join('\n\n')]));
 return {format:'wardnote-brief/1',fields,entries,sources,labelLanguage,generatedAt:now,recordedThrough:sources.map(s=>s.updatedAt).sort().at(-1)||null,review:null,manuallyEdited:false};
}
export function briefStale(brief,records){
 if(!brief)return false;
 const now=extract(records,brief.encounterId);
 return JSON.stringify(now.sources)!==JSON.stringify(brief.data.sources)||JSON.stringify(now.entries)!==JSON.stringify(brief.data.entries);
}
export function editBrief(old,fields){return {...old,fields:Object.fromEntries(BRIEF_FIELDS.map(([k])=>[k,fields[k]])),review:null,manuallyEdited:true};}
export const briefHasContent=data=>BRIEF_FIELDS.some(([k])=>text(data.fields?.[k]));
export function briefMemos(records,id){return records.filter(r=>r.encounterId===id&&(r.type==='memo'||r.type==='recording'&&(r.data.important||text(r.data.memo)))).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id));}
