// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Data preparation is shared by the patient table and worksheet previews.
export const PRE_ROUND=[['handoff','交班信息'],['nursing','护理记录'],['results','检查与化验'],['consults','会诊意见'],['medications','用药执行情况']];
// A missing or invalid clinical time is never replaced by the entry timestamp.
export function validSampleTime(value) {
 if(typeof value!=='string')return false;
 const m=/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(?:Z|[+-](\d{2}):(\d{2}))?)?$/.exec(value);
 if(!m||Number(m[1].slice(0,4))<1||[m[2],m[5]].some(x=>x!==undefined&&Number(x)>23)||[m[3],m[4],m[6]].some(x=>x!==undefined&&Number(x)>59))return false;
 const date=new Date(m[1]+'T00:00:00Z');return Number.isFinite(date.getTime())&&date.toISOString().slice(0,10)===m[1];
}
export const labSampleTime=data=>data?.sampleTimeUnknown===true||!validSampleTime(data?.sampledAt)?'':data.sampledAt;
export function labTimeOrder(a,b){const at=labSampleTime(a.data),bt=labSampleTime(b.data);return (bt?1:0)-(at?1:0)||bt.localeCompare(at)||String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''));}
export const undatedLabs=(records,encounterId)=>records.filter(r=>r.type==='lab'&&r.encounterId===encounterId&&!r.data.deletedAt&&!labSampleTime(r.data)).sort(labTimeOrder);
export function selectedTrends(records, encounterId, throughDate='9999-12-31') {
 const groups=new Map();
 for(const r of records.filter(r=>r.type==='lab'&&r.encounterId===encounterId&&!r.data.deletedAt&&labSampleTime(r.data)&&labSampleTime(r.data).slice(0,10)<=throughDate).sort(labTimeOrder)){
  const key=JSON.stringify([r.data.name,r.data.unit]);
  if(!groups.has(key))groups.set(key,{name:r.data.name,unit:r.data.unit,values:[]});
  const row=groups.get(key);if(row.values.length<3)row.values.push(r);
 }
 return [...groups.values()].map(g=>({...g,values:g.values.reverse()}));
}
