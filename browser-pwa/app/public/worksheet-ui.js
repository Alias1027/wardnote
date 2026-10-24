// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Data preparation is shared by the patient table and worksheet previews.
export const PRE_ROUND=[['handoff','交班信息'],['nursing','护理记录'],['results','检查与化验'],['consults','会诊意见'],['medications','用药执行情况']];
export function selectedTrends(records, encounterId, throughDate='9999-12-31') {
 const groups=new Map();
 for(const r of records.filter(r=>r.type==='lab'&&r.encounterId===encounterId&&r.data.sampledAt.slice(0,10)<=throughDate).sort((a,b)=>b.data.sampledAt.localeCompare(a.data.sampledAt)||b.createdAt.localeCompare(a.createdAt))){
  const key=JSON.stringify([r.data.name,r.data.unit]);
  if(!groups.has(key))groups.set(key,{name:r.data.name,unit:r.data.unit,values:[]});
  const row=groups.get(key);if(row.values.length<3)row.values.push(r);
 }
 return [...groups.values()].map(g=>({...g,values:g.values.reverse()}));
}
