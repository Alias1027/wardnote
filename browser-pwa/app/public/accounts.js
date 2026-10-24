// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Local account names route to independent encrypted vaults; passwords never enter the directory.
import {digest} from './offline-store.js';
const registryName='wardnote-account-directory-v1';
const req=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export function normalizeAccount(value){const name=String(value||'').normalize('NFKC').trim().toLowerCase();if(!/^[\p{L}\p{M}\p{N}._-]{3,64}$/u.test(name))throw new Error('账号须为3–64位字母、数字、点、下划线或连字符。');return name;}
async function directory(){const r=indexedDB.open(registryName,1);r.onupgradeneeded=()=>r.result.createObjectStore('accounts');return req(r);}
async function entries(){const db=await directory();try{return await req(db.transaction('accounts').objectStore('accounts').getAll());}finally{db.close();}}
async function register(mode,username,slot){const db=await directory();try{await new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readwrite',{durability:'strict'});tx.objectStore('accounts').put({mode,username,slot},mode+':'+username);tx.oncomplete=resolve;tx.onerror=()=>{};tx.onabort=()=>reject(new Error('本机保存未完成。'));});}finally{db.close();}}
async function vaultMeta(mode,slot=''){const r=indexedDB.open((mode==='personal'?'wardnote-device-v1':'wardnote-device-v1-institution')+(slot?'-account-'+slot:''));let absent=false;r.onupgradeneeded=()=>{absent=true;r.transaction.abort();};let db;try{db=await req(r);}catch(e){if(absent)return null;throw e;}try{return db.objectStoreNames.contains('meta')?await req(db.transaction('meta').objectStore('meta').get('vault')):null;}finally{db.close();}}
export async function accountStatus(mode){return (await entries()).some(x=>x.mode===mode)||!!await vaultMeta(mode);}
export async function authenticateAccount(device,{username,password,clinician,create=false,file=null}){
 const name=normalizeAccount(username),mode=device.mode,initial=device.context();
 if(device.key||device.authenticating)throw new Error('请先注销当前账号后再切换模式。');
 return navigator.locks.request('wardnote-directory-write-'+mode,async()=>{
  device.assertContext(initial);
  const found=(await entries()).find(x=>x.mode===mode&&x.username===name),namedSlot=await digest(new TextEncoder().encode(name)),named=found?null:await vaultMeta(mode,namedSlot),legacy=await vaultMeta(mode);
  // A restore may commit its vault before a crash or failed directory write.
  // Recover that explicit account first; never consume an unrelated legacy vault.
  const slot=found?.slot??(named?namedSlot:legacy&&(legacy.username===name||!legacy.username&&!create&&!file)?'':namedSlot);
  if(create&&found)throw new Error('账号已存在，请登录。');
  device.assertContext(initial);device.selectAccount(name,slot);
  try{
   if(create&&await device.status())throw new Error('账号已存在，请登录。');
   if(file)await device.restore(file,password);
   else if(create)await device.setup(password,clinician||name);
   else{if(!await device.status())throw new Error('账号或密码不正确。');await device.unlock(password);}
   const context=device.context();await device.bindUsername(name);device.assertContext(context);
   await device.network(false);device.assertContext(context);await register(mode,name,slot);device.assertContext(context);
   return (await device.state()).workspace;
  }catch(error){device.invalidate();if(error.message==='密码不正确'||error.message==='请先建立工作区')throw new Error('账号或密码不正确。');throw error;}
 });
}
