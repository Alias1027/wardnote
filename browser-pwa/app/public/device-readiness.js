// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Local capability checks only: no network request and no patient-vault access.
import {VERSION} from './domain.js';
const MiB=1024*1024;
export function capacityPolicy(estimate){
 const usage=Number.isFinite(estimate?.usage)&&estimate.usage>=0?estimate.usage:null;
 const quota=Number.isFinite(estimate?.quota)&&estimate.quota>0?estimate.quota:null;
 if(usage===null||quota===null)return {level:'unknown',usage,quota,available:null,ratio:null};
 const available=Math.max(0,quota-usage),ratio=usage/quota;
 return {level:available<16*MiB||ratio>=0.98?'critical':available<64*MiB||ratio>=0.9?'warning':'ok',usage,quota,available,ratio};
}
export async function storageCapacity(env=globalThis){
 let estimate,persistent=null;
 try{estimate=await env.navigator?.storage?.estimate?.();}catch{}
 try{const value=await env.navigator?.storage?.persisted?.();if(typeof value==='boolean')persistent=value;}catch{}
 return {...capacityPolicy(estimate),persistent};
}
export async function requestPersistentStorage(env=globalThis){
 try{const result=await env.navigator?.storage?.persist?.();return typeof result==='boolean'?result:null;}catch{return null;}
}
export async function probeLocalStore(env=globalThis,timeoutMs=4000){
 if(!env.indexedDB)return {supported:false,writable:false};
 const name='wardnote-readiness-probe-'+Date.now()+'-'+Math.random().toString(36).slice(2);
 return new Promise(resolve=>{
  let db,finished=false;const timer=setTimeout(()=>done(false),timeoutMs);
  const cleanup=()=>{db?.close();try{env.indexedDB.deleteDatabase(name);}catch{}};
  const done=writable=>{if(finished)return;finished=true;clearTimeout(timer);cleanup();resolve({supported:true,writable});};
  let request;try{request=env.indexedDB.open(name,1);}catch{done(false);return;}
  request.onupgradeneeded=()=>request.result.createObjectStore('probe');
  request.onerror=()=>done(false);request.onblocked=()=>done(false);
  request.onsuccess=()=>{db=request.result;if(finished){cleanup();return;}try{
   const tx=db.transaction('probe','readwrite'),store=tx.objectStore('probe');store.put('local-check','value');
   const read=store.get('value');let matched=false;read.onsuccess=()=>{matched=read.result==='local-check';store.delete('value');};
   tx.oncomplete=()=>done(matched);tx.onerror=()=>done(false);tx.onabort=()=>done(false);
  }catch{done(false);}};
 });
}
export async function inspectOfflineShell(env=globalThis,timeoutMs=2500){
 const offline={supported:!!env.navigator?.serviceWorker&&!!env.caches,controlled:!!env.navigator?.serviceWorker?.controller,ready:false};
 if(!offline.supported||!offline.controlled||typeof env.MessageChannel!=='function')return offline;
 // Ask the controlling worker to check its complete version-specific file list.
 // Old workers or incomplete caches remain unready; this does not fetch files.
 const result=await new Promise(resolve=>{
  const channel=new env.MessageChannel();let finished=false;
  const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);channel.port1.close();channel.port2.close();resolve(value);};
  const timer=setTimeout(()=>finish(null),timeoutMs);
  channel.port1.onmessage=event=>finish(event.data);
  try{env.navigator.serviceWorker.controller.postMessage({type:'WARDNOTE_CHECK_READINESS'},[channel.port2]);}catch{finish(null);}
 });
 const prefix='wardnote-shell-v'+VERSION;
 offline.ready=result?.ready===true&&typeof result.cache==='string'&&(result.cache===prefix||result.cache.startsWith(prefix+'-'))&&Number.isSafeInteger(result.files)&&result.files>0;
 return offline;
}
export async function inspectDevice({env=globalThis,probe=true}={}){
 const secure=env.isSecureContext===true,crypto=!!env.crypto?.subtle,locks=typeof env.navigator?.locks?.request==='function';
 const storage=probe?await probeLocalStore(env):{supported:!!env.indexedDB,writable:null};
 const offline=await inspectOfflineShell(env);
 const microphone=typeof env.navigator?.mediaDevices?.getUserMedia==='function'&&typeof env.MediaRecorder==='function';
 const capacity=await storageCapacity(env),essential=secure&&crypto&&locks&&storage.supported&&storage.writable!==false&&offline.supported;
 return {level:!essential?'unsupported':!offline.ready||!offline.controlled?'prepare':'ready',secure,crypto,locks,storage,offline,microphone,capacity};
}
export const recordingCapacityMessage=level=>level==='critical'?'存储空间紧张，请先备份。已保存片段保留，暂停新增录音。':level==='warning'?'存储空间较少，请尽快结束录音并备份。':level==='unknown'?'无法估计存储空间，请留意保存状态并及时备份。':'';
