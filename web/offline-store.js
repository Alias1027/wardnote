// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// A device vault. Ciphertext persists in IndexedDB; keys live only in memory.
import {exportSegmented,verifySegmented} from './backup-segments.js';
import {storageCapacity} from './device-readiness.js';
const DB='wardnote-device-v1', LOCK='wardnote-device-write-v1';
const enc=new TextEncoder(),dec=new TextDecoder();
export const b64=b=>{let s='';for(let i=0;i<b.length;i+=32768)s+=String.fromCharCode(...b.subarray(i,i+32768));return btoa(s);};
export const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export async function digest(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
export const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export const fingerprint=r=>digest(enc.encode(canonical(r)));
const request=r=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export class DeviceVault {
 constructor(){this.generation=0;this.mode='personal';this.slot='';this.username='';this.key=null;this.meta=null;this.db=null;this.bus=typeof BroadcastChannel==='function'?new BroadcastChannel('wardnote-device-events'):null;this.bus?.addEventListener('message',e=>{if(e.data?.mode!==this.mode||(e.data?.slot||'')!==this.slot)return;if(e.data?.kind==='lock'){this.invalidate();this.onLock?.();}else this.onChange?.();});}
 context(){return {generation:this.generation,mode:this.mode,slot:this.slot};}
 assertContext(c){if(c.generation!==this.generation||c.mode!==this.mode||c.slot!==this.slot)throw new Error('工作区已锁定，请重新登录');}
 invalidate(){this.generation++;this.key=null;this.releaseSession?.();this.releaseSession=null;}
 selectMode(mode){if(this.key||this.authenticating)throw new Error('请先注销当前账号后再切换模式。');if(!['personal','institution'].includes(mode))throw new Error('账号模式无效');this.generation++;this.db?.close();this.db=null;this.meta=null;this.mode=mode;this.slot="";this.username="";}
 selectAccount(username,slot){if(this.key||this.authenticating)throw new Error('请先注销当前账号后再切换模式。');this.generation++;this.db?.close();this.db=null;this.meta=null;this.username=username;this.slot=slot;}
 async bindUsername(username){const context=this.context();await this.mutate((state,extra)=>{if(this.meta.username&&this.meta.username!==username)throw new Error('账号或密码不正确。');state.workspace.username=username;extra.push(['meta','vault',{...this.meta,username}]);return null;},context);this.assertContext(context);this.meta={...this.meta,username};}
 async sameUnlockPassword(password){try{const raw=await this.open(this.meta.wrapped,`key:${this.meta.id}`,await this.derive(password,unb64(this.meta.salt)));raw.fill(0);return true;}catch{return false;}}
 async authorization(outcome){return this.mutate(s=>{const event={id:crypto.randomUUID(),accountId:this.meta.id,mode:this.mode,method:'password',outcome,time:new Date().toISOString()};(s.authorizations??=[]).push({event,state:'pending'});return event;});}
 async connect(c=this.context()){
  this.assertContext(c);if(this.db)return this.db;
  if(!globalThis.indexedDB||!crypto?.subtle||!navigator.locks)throw new Error('本机脱机存储不可用，请使用支持加密存储的普通浏览器窗口。');
  const r=indexedDB.open((c.mode==='personal'?DB:DB+'-institution')+(c.slot?'-account-'+c.slot:''),1);r.onupgradeneeded=()=>{for(const n of ['meta','state','audio'])r.result.createObjectStore(n);};
  const db=await request(r);try{this.assertContext(c);}catch(e){db.close();throw e;}
  if(this.db){db.close();return this.db;}this.db=db;
  db.onversionchange=()=>{db.close();if(this.db===db){this.db=null;this.invalidate();this.onLock?.();}};return db;
 }
 async read(store,id,c=this.context()){const db=await this.connect(c);this.assertContext(c);const value=await request(db.transaction(store).objectStore(store).get(id));this.assertContext(c);return value;}
 async write(items,c=this.context()){
  const db=await this.connect(c);this.assertContext(c);
  await new Promise((resolve,reject)=>{const tx=db.transaction([...new Set(items.map(x=>x[0]))],'readwrite',{durability:'strict'});for(const [store,id,value]of items){const os=tx.objectStore(store);value===undefined?os.delete(id):os.put(value,id);}tx.oncomplete=resolve;tx.onerror=()=>{};tx.onabort=()=>reject(new Error(tx.error?.name==='QuotaExceededError'?'本机空间不足，未完成保存。请先备份，再清理已核对的资料。':'本机保存未完成。'));});this.assertContext(c);
 }
 async status(){return !!await this.read('meta','vault');}
 async derive(password,salt){const key=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},key,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
 async seal(bytes,aad,key=this.key){if(!key)throw new Error('工作区已锁定，请重新登录');const iv=crypto.getRandomValues(new Uint8Array(12));return {iv:b64(iv),data:b64(new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(aad)},key,bytes)))};}
 async open(packet,aad,key=this.key){if(!key)throw new Error('工作区已锁定，请重新登录');return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(packet.iv),additionalData:enc.encode(aad)},key,unb64(packet.data)));}
 async sessionGuard(fn){if(this.authenticating)throw new Error('正在处理资料，请等待当前操作完成。');this.authenticating=true;this.generation++;const c=this.context();try{if(!this.releaseSession)await navigator.locks.request('wardnote-account-gate',async()=>{this.assertContext(c);const locks=await navigator.locks.query();this.assertContext(c);const sessionName='wardnote-active-'+this.mode+(this.slot?'-'+this.slot:'');if(locks.held.some(x=>x.name.startsWith('wardnote-active-')&&x.name!==sessionName))throw new Error('请先注销当前账号后再切换模式。');await new Promise((ready,reject)=>{navigator.locks.request(sessionName,{mode:'shared'},async()=>{this.assertContext(c);const hold=new Promise(done=>{this.releaseSession=done;});ready();await hold;}).catch(reject);});});this.assertContext(c);const value=await fn(c);this.assertContext(c);return value;}catch(e){if(c.generation===this.generation)this.invalidate();throw e;}finally{this.authenticating=false;}}
 async setup(password,clinician){return this.sessionGuard(c=>this.setupInternal(password,clinician,c));}
 async unlock(password){return this.sessionGuard(c=>this.unlockInternal(password,c));}
 async setupInternal(password,clinician,c){if(typeof password!=='string'||password.length<12||password.length>200)throw new Error('密码需要 12–200 个字符');if(!clinician?.trim())throw new Error('请填写记录者姓名');await this.connect(c);return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{this.assertContext(c);if(await this.read('meta','vault',c))throw new Error('工作区已建立');await this.cleanEmpty(c);const id=crypto.randomUUID(),salt=crypto.getRandomValues(new Uint8Array(16)),raw=crypto.getRandomValues(new Uint8Array(32));const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);const meta={format:1,mode:this.mode,id,salt:b64(salt),wrapped:await this.seal(raw,`key:${id}`,await this.derive(password,salt)),network:false};raw.fill(0);this.assertContext(c);this.key=key;this.meta=meta;const state={workspace:{clinician:clinician.trim(),retentionDays:14,accountMode:this.mode},records:[],revisions:{},events:[],bases:{},remoteId:null};await this.write([['meta','vault',this.meta],['state','current',await this.seal(enc.encode(JSON.stringify(state)),`state:${id}`,key)]],c);return state.workspace;});}
 async unlockInternal(password,c){const meta=await this.read('meta','vault',c);if(!meta)throw new Error('请先建立工作区');try{const raw=await this.open(meta.wrapped,`key:${meta.id}`,await this.derive(password,unb64(meta.salt)));const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);raw.fill(0);this.assertContext(c);this.key=key;this.meta=meta;return (await this.state(c)).workspace;}catch{this.assertContext(c);this.key=null;throw new Error('密码不正确');}}
 async state(c=this.context()){const meta=await this.read('meta','vault',c);if(!this.key||meta?.id!==this.meta?.id)throw new Error('工作区已锁定，请重新登录');const key=this.key,packet=await this.read('state','current',c),value=JSON.parse(dec.decode(await this.open(packet,`state:${meta.id}`,key)));this.assertContext(c);return value;}
 async mutate(fn,c=this.context()){
  await this.connect(c);return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{
   this.assertContext(c);const state=await this.state(c),extra=[],key=this.key,id=this.meta.id;
   const result=await fn(state,extra);this.assertContext(c);
   const packet=await this.seal(enc.encode(JSON.stringify(state)),`state:${id}`,key);this.assertContext(c);
   await this.write([['state','current',packet],...extra],c);this.bus?.postMessage({mode:c.mode,slot:c.slot,kind:'change'});return structuredClone(result);
  });
 }
 async network(allowed){const c=this.context();await this.connect(c);await navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{this.assertContext(c);const meta=await this.read('meta','vault',c);if(!meta)throw new Error('请先建立工作区');meta.network=allowed===true;await this.write([['meta','vault',meta]],c);this.meta=meta;});this.assertContext(c);this.bus?.postMessage({mode:c.mode,slot:c.slot,kind:'change'});}
 async allowed(){return (await this.read('meta','vault'))?.network===true;}
 lock(){this.invalidate();this.bus?.postMessage({mode:this.mode,slot:this.slot,kind:'lock'});}
 async chunk(id,index,bytes){const c=this.context();if(!Number.isInteger(index)||index<0||index>100000||!bytes.length||bytes.length>2*1024*1024)throw new Error('录音片段格式无效');const hash=await digest(bytes);this.assertContext(c);return this.mutate(async(s,extra)=>{const r=s.records.find(x=>x.id===id&&x.type==='recording');if(!r||r.data.deletedAt)throw new Error('录音不存在');const parts=r.data.localParts||[],old=parts.find(x=>x.sequence===index);if(old){if(old.hash!==hash)throw new Error('同序号录音片段内容不同');return {ok:true};}if(r.data.finalized)throw new Error('已完成的录音不能追加');if(parts.reduce((n,x)=>n+x.size,0)+bytes.length>256*1024*1024)throw new Error('单段录音超过 256 MB，请另起一段');extra.push(['audio',`${id}:${index}`,await this.seal(bytes,`audio:${this.meta.id}:${id}:${index}`)]);parts.push({sequence:index,size:bytes.length,hash});r.data.localParts=parts.sort((a,b)=>a.sequence-b.sequence);r.data.lastSavedAt=new Date().toISOString();return {ok:true};});}
 async audio(id){const c=this.context(),key=this.key,idPrefix=this.meta?.id;const s=await this.state(c),r=s.records.find(x=>x.id===id&&x.type==='recording');if(!r||r.data.deletedAt)throw new Error('原录音已按记录清理，无法回听');const parts=r.data.localParts||[];if(!parts.length)throw new Error('本机没有此录音，请联网后手动下载。');const blobs=[];for(const p of parts){const bytes=await this.open(await this.read('audio',`${id}:${p.sequence}`,c),`audio:${idPrefix}:${id}:${p.sequence}`,key);if(await digest(bytes)!==p.hash)throw new Error('录音校验失败');blobs.push(bytes);}this.assertContext(c);return new Blob(blobs,{type:r.data.mime});}
 async backup(){const c=this.context();return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{await this.state(c);const state=await this.read('state','current'),audio={};const s=await this.state();const predicted=s.records.filter(r=>r.type==='recording').reduce((n,r)=>n+(r.data.localParts||[]).reduce((sum,p)=>sum+Math.ceil((p.size+16)/3)*4+200,0),JSON.stringify(state).length+10000);if(predicted>600*1024*1024)throw new Error('备份文件过大，请使用分卷加密备份。');for(const r of s.records.filter(r=>r.type==='recording'))for(const p of r.data.localParts||[])audio[`${r.id}:${p.sequence}`]=await this.read('audio',`${r.id}:${p.sequence}`);const estimated=Object.values(audio).reduce((n,x)=>n+(x?.data?.length||0)+200,JSON.stringify(state).length+10000);if(estimated>600*1024*1024)throw new Error('备份文件过大');this.assertContext(c);const packet={format:'wardnote-device-backup/1',meta:{...this.meta,network:false},state,audio};return new Blob([JSON.stringify(packet)],{type:'application/json'});});}
 async backupSegmented(saveFile,options){return exportSegmented(this,saveFile,options);}
 async verifyBackup(files,password){const result=await verifySegmented(this,Array.from(files),password);return result.counts;}
 async backupStatus(c=this.context()){
  this.assertContext(c);if(!this.key||!this.meta)throw new Error('工作区已锁定，请重新登录');
  const packet=await this.read('meta','backup-status',c);if(!packet)return {};
  const status=JSON.parse(dec.decode(await this.open(packet,`backup-status:${this.meta.id}`,this.key))),currentHash=await fingerprint(await this.state(c));this.assertContext(c);
  return Object.fromEntries(Object.entries(status).map(([kind,value])=>[kind,{...value,matchesCurrent:value.snapshotHash===currentHash}]));
 }
 async rememberBackup(kind,result,c=this.context()){
  this.assertContext(c);if(!['offered','written','verified'].includes(kind)||!this.key||!this.meta)throw new Error('工作区已锁定，请重新登录');
  if(result?.sourceId!==this.meta.id||result.sourceMode!==this.mode||result.sourceUsername!==(this.meta.username||''))return false;
  if(typeof result.id!=='string'||!Number.isFinite(Date.parse(result.createdAt))||!/^[a-f0-9]{64}$/.test(result.snapshotHash))throw new Error('备份格式无效');
  return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{
   this.assertContext(c);const id=this.meta.id,key=this.key,previous=await this.read('meta','backup-status',c);
   const status=previous?JSON.parse(dec.decode(await this.open(previous,`backup-status:${id}`,key))):{};
   status[kind]={id:result.id,at:new Date().toISOString(),createdAt:result.createdAt,snapshotHash:result.snapshotHash};
   const packet=await this.seal(enc.encode(JSON.stringify(status)),`backup-status:${id}`,key);this.assertContext(c);await this.write([['meta','backup-status',packet]],c);return true;
  });
 }
 async cleanEmpty(c=this.context(),stageId=null){
  const db=await this.connect(c);this.assertContext(c);
  await new Promise((resolve,reject)=>{const tx=db.transaction(['meta','state','audio'],'readwrite',{durability:'strict'}),meta=tx.objectStore('meta'),vault=meta.get('vault'),stage=meta.get('restore-stage');stage.onsuccess=()=>{if(!vault.result&&(!stageId||stage.result?.id===stageId)){for(const name of ['meta','state','audio'])tx.objectStore(name).clear();}};tx.oncomplete=resolve;tx.onerror=()=>{};tx.onabort=()=>reject(new Error('本机保存未完成。'));});this.assertContext(c);
 }
 async restore(file,password){const files=Array.isArray(file)?file:[file];return this.sessionGuard(c=>files.length===1&&!files[0]?.name?.endsWith('.wnmanifest')?this.restoreInternal(files[0],password,c):this.restoreSegmentedInternal(files,password,c));}
 async restoreSegmentedInternal(files,password,c){
  await this.connect(c);return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{
   this.assertContext(c);if(await this.read('meta','vault',c))throw new Error('请在没有本机工作区的浏览器中恢复，现有资料不会被覆盖。');await this.cleanEmpty(c);const stageId=crypto.randomUUID();await this.write([['meta','restore-stage',{id:stageId,createdAt:new Date().toISOString()}]],c);
   try{const result=await verifySegmented(this,files,password,{context:c,onAudio:async(id,packet)=>{await this.write([['audio',id,packet]],c);}}),meta={...result.meta,username:this.username||result.meta.username,network:false};if(this.username)result.state.workspace.username=this.username;result.state.workspace.accountMode=this.mode;
    const packet=await this.seal(enc.encode(JSON.stringify(result.state)),`state:${meta.id}`,result.key);this.assertContext(c);await this.write([['meta','vault',meta],['state','current',packet],['meta','restore-stage',undefined]],c);this.key=result.key;this.meta=meta;return result.state.workspace;
   }catch(error){this.key=null;if(c.generation===this.generation&&c.mode===this.mode&&c.slot===this.slot)await this.cleanEmpty(c,stageId).catch(()=>{});throw error;}
  });
 }
 async restoreInternal(file,password,c){if(file.size>600*1024*1024)throw new Error('备份文件过大');const p=JSON.parse(await file.text());this.assertContext(c);if((p.meta?.mode||'personal')!==this.mode)throw new Error('备份账号模式不匹配，请先在登录页选择对应模式。');if(p.format!=='wardnote-device-backup/1'||p.meta?.format!==1||!p.audio||typeof p.audio!=='object')throw new Error('备份格式无效');await this.connect(c);return navigator.locks.request(LOCK+'-'+c.mode+(c.slot?'-'+c.slot:''),async()=>{this.assertContext(c);if(await this.read('meta','vault',c))throw new Error('请在没有本机工作区的浏览器中恢复，现有资料不会被覆盖。');await this.cleanEmpty(c);try{const raw=await this.open(p.meta.wrapped,`key:${p.meta.id}`,await this.derive(password,unb64(p.meta.salt)));const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);raw.fill(0);const s=JSON.parse(dec.decode(await this.open(p.state,`state:${p.meta.id}`,key)));if(!s.workspace||!Array.isArray(s.records)||!s.revisions||!s.bases||!Array.isArray(s.events))throw new Error();const items=[];for(const r of s.records.filter(r=>r.type==='recording'))for(const part of r.data.localParts||[]){const id=`${r.id}:${part.sequence}`,b=await this.open(p.audio[id],`audio:${p.meta.id}:${id}`,key);if(b.length!==part.size||await digest(b)!==part.hash)throw new Error();items.push(['audio',id,p.audio[id]]);}this.assertContext(c);this.key=key;this.meta={...p.meta,username:this.username||p.meta.username,network:false};await this.write([['meta','vault',this.meta],['state','current',p.state],...items],c);return s.workspace;}catch(e){this.assertContext(c);this.key=null;throw new Error('备份或密码校验失败，未覆盖现有资料。');}});}
 async usage(){return storageCapacity();}
}
