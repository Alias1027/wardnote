// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {language} from './i18n.js';
import {androidText} from './android-strings.js';
export const nt=key=>androidText(key,language());
export const isAndroid=()=>typeof globalThis.WardNoteNative?.postMessage==='function';
const calls=new Map();let serial=0,transfers=0;
export function nativeBusy(){return calls.size>0||transfers>0;}
function failure(code){return Object.assign(new Error(nt(code==='CLEANUP_INCOMPLETE'?'cleanup':code==='CANCELLED'?'cancelled':code==='NO_RECORDER'?'noRecorder':code==='INVALID_FILE'||code==='TOO_LARGE'?'fileCheck':'failed')),{code});}
// Only this packaged top-level page receives the native bridge.
globalThis.__wardnoteNativeResult=message=>{
 if(typeof message==='string'){try{message=JSON.parse(message);}catch{return;}}
 const pending=calls.get(message?.id);if(!pending)return;
 calls.delete(message.id);clearTimeout(pending.timer);
 message.ok?pending.resolve(message.result):pending.reject(failure(message.error?.code||message.error));
};
export function nativeCall(method,args={},timeout=30000){
 if(!isAndroid())return Promise.reject(new Error(nt('unsupported')));
 return new Promise((resolve,reject)=>{
  const id='wn-'+(++serial)+'-'+crypto.randomUUID();
  const timer=timeout?setTimeout(()=>{calls.delete(id);reject(failure('TIMEOUT'));},timeout):null;
  calls.set(id,{resolve,reject,timer});
  try{globalThis.WardNoteNative.postMessage(JSON.stringify({id,method,args:{...args,locale:language()}}));}catch{calls.delete(id);clearTimeout(timer);reject(failure('BRIDGE'));}
 });
}
export async function nativeReady(){
 const info=await nativeCall('info');
 if(info.platform!=='android'||info.assets!==true||!isSecureContext||!crypto?.subtle||!indexedDB||typeof navigator.locks?.request!=='function')throw new Error(nt('unsupported'));
 return info;
}
export async function nativeRecorder(){await nativeReady();return nativeCall('record',{},0);}
export function audioType(file){
 const type=(file.type||'').toLowerCase().split(';')[0];
 const aliases={'audio/x-m4a':'audio/mp4','audio/x-wav':'audio/wav','audio/3gpp2':'audio/3gpp'};
 const named={m4a:'audio/mp4',mp4:'audio/mp4',mp3:'audio/mpeg',wav:'audio/wav',webm:'audio/webm',ogg:'audio/ogg',opus:'audio/ogg',amr:'audio/amr','3gp':'audio/3gpp',aac:'audio/aac',flac:'audio/flac'};
 const mime=aliases[type]||(!type||type==='application/octet-stream'?named[file.name?.split('.').pop().toLowerCase()]:type);
 if(!/^audio\/(webm|mp4|ogg|wav|mpeg|amr|3gpp|aac|flac)$/.test(mime||'')||!Number.isSafeInteger(file.size)||file.size<=0||file.size>100*1024*1024)throw new Error(nt('fileCheck'));
 return mime;
}
export async function importNativeAudio(file,{check,create,append,finalize}){
 transfers++;try{
 const mime=audioType(file);check();
 const record=await create(mime);let sequence=0;
 for(let offset=0;offset<file.size;){
  check();const result=await nativeCall('readChunk',{token:file.token,offset,length:Math.min(256*1024,file.size-offset)});
  const bytes=Uint8Array.from(atob(result.base64),c=>c.charCodeAt(0));
  if(!bytes.length||bytes.length>256*1024||offset+bytes.length>file.size||result.eof!==(offset+bytes.length===file.size))throw new Error(nt('fileCheck'));
  check();await append(record.id,sequence++,new Blob([bytes],{type:mime}));offset+=bytes.length;
 }
 check();return await finalize(record.id,sequence);
 }finally{transfers--;}
}
export async function releaseNativeFile(token){if(token)await nativeCall('releaseFile',{token}).catch(()=>{});}
const b64=bytes=>{let text='';for(let p=0;p<bytes.length;p+=8192)text+=String.fromCharCode(...bytes.subarray(p,p+8192));return btoa(text);};
const sha=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');
export async function writeNativeFile(blob,name,{folder,check=()=>{}}={}){
 let token;transfers++;
 try{
  check();const opened=await nativeCall(folder?'beginFile':'chooseSaveFile',{...(folder?{folder}:{}),name,type:blob.type||'application/octet-stream'},0);
  token=opened.token;if(!token)throw new Error(nt('failed'));check();
  for(let offset=0;offset<blob.size;offset+=256*1024){check();const bytes=new Uint8Array(await blob.slice(offset,offset+256*1024).arrayBuffer());check();await nativeCall('writeChunk',{token,base64:b64(bytes)});check();}
  check();const expected=await sha(blob);check();const result=await nativeCall('finishFile',{token,sha256:expected,size:blob.size});
  if(result.size!==blob.size||result.sha256!==expected)throw new Error(nt('failed'));
  check();return result;
 }catch(error){if(token&&error.code!=='VERIFY_FAILED'){try{const cleanup=await nativeCall('abortFile',{token});if(cleanup.removed!==true)throw new Error(nt('cleanup'));}catch{throw new Error(nt('cleanup'));}}throw error;}
 finally{transfers--;}
}
export function nativeGuide(id='android-guide'){
 return `<details class="panel fold" id="${id}"><summary>${nt('title')}</summary><p>${nt('guide')}</p><p>${nt('boundary')}</p><p>${nt('data')}</p><p>${nt('backup')}</p><p>${nt('update')}</p><p class="muted">${nt('validation')}</p></details>`;
}
export function easyStartHTML(){return `<div class="notice">${nt('title')} · 0.1.2-preview<br>${nt('guide')}</div>`;}
export const bindEasyStart=()=>({dispose(){}});
export const updateEntryHTML=()=>`<p class="muted">Android 0.1.2-preview · Web 0.6.15 r1</p>`;
export function setupUpdates(){/* Native packages update atomically; never fetch a web shell or activate a service worker. */}
