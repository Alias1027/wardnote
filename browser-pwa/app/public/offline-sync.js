import {STATIC_ONLY,requireNetworkDeployment} from './deployment-policy.js';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {device} from './offline-api.js';
import {digest} from './offline-store.js';
import {canonical,compareRecord,syncRecord,selectedRecords} from './sync-core.js';
export class RemoteWorkspace {
 context(){return {device:device.context(),controller:this.controller};}
 assertContext(c){device.assertContext(c.device);if(c.controller!==this.controller||c.controller.signal.aborted)throw new Error('当前为脱机模式，未发送数据。');}
 constructor(){this.authorized=false;this.csrf='';this.remoteId=null;this.controller=new AbortController();}
 async request(path,method='GET',data,raw=false){requireNetworkDeployment();const c=this.context();if(!await device.allowed()||!device.key||(!this.authorized&&!['/login','/setup'].includes(path)))throw new Error('当前为脱机模式，未发送数据。');this.assertContext(c);const headers={};if(method!=='GET'){headers['X-CSRF-Token']=this.csrf;headers['Content-Type']=raw?'application/octet-stream':'application/json';}const r=await fetch(`/api${device.mode==='institution'?'/institution':''}${path}`,{method,headers,body:method==='GET'?undefined:raw?data:JSON.stringify(data||{}),credentials:'same-origin',signal:AbortSignal.any([this.controller.signal,AbortSignal.timeout(raw?180000:20000)]),redirect:'error'});this.assertContext(c);if(!r.ok){let d;try{d=await r.json();}catch{}const error=new Error(d?.error||'连接未完成，本机资料仍保留。');error.status=r.status;throw error;}return r;}
 async json(...args){const c=this.context(),value=await(await this.request(...args)).json();this.assertContext(c);return value;}
 async connect(password,create=false){
  requireNetworkDeployment();
  const account=device.context(),same=await device.sameUnlockPassword(password);device.assertContext(account);if(same){await device.authorization('denied');throw new Error('联网授权密码必须与本机解锁密码不同。');}
  this.authorized=false;this.csrf='';this.remoteId=null;this.deliveryPending=false;await device.network(true);device.assertContext(account);this.controller=new AbortController();const connection=this.context();
  try{const state=await device.state();const login=await this.json(create?'/setup':'/login','POST',{password,clinician:state.workspace.clinician});this.csrf=login.csrf;this.authorized=true;const result=await this.json('/device-connection','POST',{allowed:true,confirmed:true});
   if(result.accountMode!==device.mode||state.remoteId&&state.remoteId!==result.remoteId)throw new Error('服务器工作区已改变，请勿将不同工作区混合。');this.remoteId=result.remoteId;this.destinations=result.destinations;await device.authorization('allowed');try{await this.flushAuthorizations();}catch{this.deliveryPending=true;}this.assertContext(connection);return login.workspace;
  }catch(e){this.assertContext(connection);try{await device.authorization(e.status===401?'denied':'connection-failed');}finally{await this.disconnect(false);}throw e;}
 }
 async disconnect(record=true){
  // Revoke in-memory permission before any fallible storage or network operation.
  const account=device.context(),mode=device.mode,wasAuthorized=this.authorized,token=this.csrf;this.controller.abort();this.authorized=false;this.csrf='';this.remoteId=null;this.destinations=[];let saved=true;
  if(record&&device.key&&wasAuthorized)try{await device.authorization('revoked');}catch{saved=false;}
  try{device.assertContext(account);await device.network(false);}catch{saved=false;}
  if(token&&!STATIC_ONLY)try{await fetch(`/api${mode==='institution'?'/institution':''}/logout`,{method:'POST',headers:{'X-CSRF-Token':token,'Content-Type':'application/json'},body:'{}',credentials:'same-origin',redirect:'error',signal:AbortSignal.timeout(1500)});}catch{}
  return saved;
 }
 async flushAuthorizations(){const s=await device.state(),pending=(s.authorizations||[]).filter(x=>x.state!=='accepted');for(let offset=0;offset<pending.length;offset+=100){const result=await this.json('/device-authorizations','POST',{events:pending.slice(offset,offset+100).map(x=>x.event)});this.destinations=result.destinations;await device.mutate(state=>{for(const r of result.receipts){const item=state.authorizations.find(x=>x.event.id===r.id);if(item){item.state=r.state;item.lastAttempt=new Date().toISOString();}}return null;});}}
 async census(){return this.json('/sync/census');}
 async snapshot(ids){const context=this.context(),value=await this.json('/sync/snapshot','POST',{ids});this.assertContext(context);return {...value,context};}
 async importSnapshot(snapshot,choices={}){this.assertContext(snapshot.context);return device.mutate(s=>{if(s.remoteId&&s.remoteId!==snapshot.remoteId)throw new Error('服务器工作区已改变，请勿将不同工作区混合。');const conflicts=[];for(const r of snapshot.records){const old=s.records.find(x=>x.id===r.id);if(old&&compareRecord(old,r,s.bases[r.id])==='conflict'&&(!choices[r.id]||choices[r.id].expected!==canonical(syncRecord(old))))conflicts.push({local:syncRecord(old),remote:r});}if(conflicts.length)return {conflicts};s.remoteId=snapshot.remoteId;
   for(const r of snapshot.records){const old=s.records.find(x=>x.id===r.id),status=old?compareRecord(old,r,s.bases[r.id]):'pull';if(old&&(status==='push'||status==='new'))continue;if(old&&choices[r.id]?.choice==='local'){(s.revisions[old.id]??=[]).unshift(structuredClone(old));old.version=Math.max(old.version,r.version)+1;old.updatedAt=new Date().toISOString();if(['note','summary','brief'].includes(old.type))old.data.review=null;s.bases[r.id]=canonical(syncRecord(r));continue;}
    if(!old)s.records.push(structuredClone(r));else if(status!=='same'){(s.revisions[r.id]??=[]).unshift(structuredClone(old));const parts=old.data.localParts,last=old.data.lastSavedAt;Object.assign(old,structuredClone(r));if(parts&&!r.data.deletedAt){old.data.localParts=parts;old.data.lastSavedAt=last;}}
    s.bases[r.id]=canonical(syncRecord(r));
   }return {ok:true};});}
 async downloadAudio(snapshot){this.assertContext(snapshot.context);for(const r of snapshot.records.filter(r=>r.type==='recording'&&r.data.finalized&&!r.data.deletedAt&&!r.data.audioMissing)){const s=await device.state(),local=s.records.find(x=>x.id===r.id);if(local?.data.localParts?.length&&local.data.localParts.reduce((n,p)=>n+p.size,0)===r.data.bytes)continue;this.assertContext(snapshot.context);const blob=await(await this.request(`/recordings/${r.id}/audio`)).blob();this.assertContext(snapshot.context);if(!Number.isSafeInteger(r.data.bytes)||r.data.bytes<1||blob.size!==r.data.bytes)throw new Error('录音校验失败');if(blob.size>256*1024*1024)throw new Error('单段录音超过 256 MB，请另起一段');
  await device.mutate(async(state,extra)=>{const x=state.records.find(x=>x.id===r.id);if(!x||canonical(syncRecord(x))!==canonical(syncRecord(r)))throw new Error('本机记录已变化，请重新预览');const parts=[];for(let offset=0;offset<blob.size;offset+=1024*1024){const sequence=parts.length,bytes=new Uint8Array(await blob.slice(offset,offset+1024*1024).arrayBuffer());parts.push({sequence,size:bytes.length,hash:await digest(bytes)});extra.push(['audio',`${r.id}:${sequence}`,await device.seal(bytes,`audio:${device.meta.id}:${r.id}:${sequence}`)]);}x.data.localParts=parts;return null;});
 }}
 async plan(ids,includeAudio){const context=this.context(),s=await device.state();this.assertContext(context);if(s.remoteId&&s.remoteId!==this.remoteId)throw new Error('服务器工作区已改变，请勿将不同工作区混合。');const records=selectedRecords(s.records,ids);if(!records.length)throw new Error('请选择患者');const audio=includeAudio?s.records.filter(r=>records.some(x=>x.id===r.id)&&r.type==='recording'&&r.data.finalized&&!r.data.deletedAt&&!r.data.audioMissing&&r.data.localParts?.length).map(r=>({id:r.id,parts:r.data.localParts})):[];const d={remoteId:this.remoteId,confirmed:true,records,bases:Object.fromEntries(records.filter(r=>s.bases[r.id]).map(r=>[r.id,s.bases[r.id]])),audio};const preview=await this.json('/sync/preview','POST',d);this.assertContext(context);return {...preview,payload:d,ids:[...ids],context};}
 async unchanged(plan){
  this.assertContext(plan.context);const s=await device.state();this.assertContext(plan.context);
  const ordered=records=>canonical([...records].sort((a,b)=>a.id.localeCompare(b.id)));
  return ordered(selectedRecords(s.records,plan.ids))===ordered(plan.payload.records);
 }
 async commit(plan){
  if(!plan.previewId)throw new Error('请先处理版本冲突');
  if(!await this.unchanged(plan))throw new Error('预览后资料已有变化，请重新查看发送内容');
  for(const a of plan.payload.audio)for(const p of a.parts){
   this.assertContext(plan.context);const packet=await device.read('audio',`${a.id}:${p.sequence}`),bytes=await device.open(packet,`audio:${device.meta.id}:${a.id}:${p.sequence}`);
   this.assertContext(plan.context);if(bytes.length!==p.size||await digest(bytes)!==p.hash)throw new Error('录音校验失败');
   this.assertContext(plan.context);await this.request(`/sync/audio/${plan.previewId}/${a.id}/${p.sequence}`,'PUT',new Blob([bytes]),true);
  }
  if(!await this.unchanged(plan))throw new Error('预览后资料已有变化，请重新查看发送内容');
  const result=await this.json('/sync/commit','POST',{previewId:plan.previewId});this.assertContext(plan.context);if(result.conflicts?.length)return result;
  await device.mutate(s=>{s.remoteId=plan.payload.remoteId;for(const r of result.records)s.bases[r.id]=canonical(syncRecord(r));return null;});
  return {...result,localChanged:!await this.unchanged(plan)};
 }

}
export const remote=new RemoteWorkspace();
