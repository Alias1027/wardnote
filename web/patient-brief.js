// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Local extraction only. Source words, negatives and uncertainty remain verbatim.
export const BRIEF_FIELDS=[['reason','就诊原因'],['background','既往重点'],['status','最近状态'],['focus','当前重点']];
const text=v=>typeof v==='string'?v.trim():'';
const newest=list=>list.sort((a,b)=>(b.data.date||b.updatedAt).localeCompare(a.data.date||a.updatedAt)||b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id))[0];
export const currentBrief=(records,id)=>newest(records.filter(r=>r.type==='brief'&&r.encounterId===id&&!r.data.deletedAt));
function extract(records,id){
 const same=records.filter(r=>r.encounterId===id&&!r.data.deletedAt),entries=[];
 const add=(key,r,path,value)=>{if(r&&text(value))entries.push({key,sourceId:r.id,path,text:text(value)});};
 const initial=newest(same.filter(r=>r.type==='note'&&r.data.kind==='initial'&&['hpi','pmh','function'].some(k=>text(r.data.fields?.[k]))));
 const bg=newest(same.filter(r=>r.type==='background'&&['pmh','function','updates'].some(k=>text(r.data.fields?.[k]))));
 const daily=newest(same.filter(r=>r.type==='note'&&r.data.kind==='daily'&&(['course','vitals','goal'].some(k=>text(r.data.fields?.[k]))||(r.data.problems||[]).some(p=>text(p.title)||text(p.assessment)||text(p.plan)))));
 add('reason',initial,'hpi',initial?.data.fields?.hpi);
 for(const r of [initial,bg])for(const k of ['pmh','function',...(r===bg?['updates']:[])])add('background',r,k,r?.data.fields?.[k]);
 for(const k of ['course','vitals'])add('status',daily,k,daily?.data.fields?.[k]);
 add('focus',daily,'goal',daily?.data.fields?.goal);
 (daily?.data.problems||[]).forEach((p,i)=>{
  if(text(p.assessment))add('status',daily,'problems.'+i+'.assessment',[text(p.title),text(p.assessment)].filter(Boolean).join('：'));
  if(text(p.plan))add('focus',daily,'problems.'+i+'.plan',[text(p.title),text(p.plan)].filter(Boolean).join('：'));
 });
 for(const r of same.filter(r=>r.type==='task'&&!r.data.done).sort((a,b)=>(a.data.due||'9999').localeCompare(b.data.due||'9999')||a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id)))add('focus',r,'task',[text(r.data.title),text(r.data.next)].filter(Boolean).join('\n'));
 const ids=new Set(entries.map(x=>x.sourceId));
 const sources=same.filter(r=>ids.has(r.id)).sort((a,b)=>a.id.localeCompare(b.id)).map(r=>({id:r.id,version:r.version,type:r.type,kind:r.data.kind||'',date:r.data.date||r.createdAt.slice(0,10),updatedAt:r.updatedAt,reviewed:!!r.data.review}));
 return {entries,sources};
}
export function composeBrief(records,id,labelLanguage='zh',now=new Date().toISOString()){
 const {entries,sources}=extract(records,id);
 const fields=Object.fromEntries(BRIEF_FIELDS.map(([key])=>[key,[...new Set(entries.filter(e=>e.key===key).map(e=>e.text))].join('\n\n')]));
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
