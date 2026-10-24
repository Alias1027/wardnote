// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Audio ciphertext is processed one bounded part at a time. Clinical state is
// still loaded as one object, exactly as it is during normal vault operation.
const enc=new TextEncoder(),dec=new TextDecoder();
export const BACKUP_PART_BYTES=16*1024*1024;
const FRAGMENT_CHARS=512*1024,MAX_MANIFEST_BYTES=4*1024*1024,MAX_PARTS=10000;
const fail=()=>new Error('备份或密码校验失败，未覆盖现有资料。');
const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const lockName=c=>'wardnote-device-write-v1-'+c.mode+(c.slot?'-'+c.slot:'');
const plainObject=v=>v&&typeof v==='object'&&!Array.isArray(v);
const validPacket=p=>plainObject(p)&&typeof p.iv==='string'&&/^[A-Za-z0-9+/]{16}$/.test(p.iv)&&typeof p.data==='string'&&p.data.length>=24&&/^[A-Za-z0-9+/]*={0,2}$/.test(p.data);
function snapshot(state,mode){
 if(!plainObject(state)||!plainObject(state.workspace)||!Array.isArray(state.records)||!plainObject(state.revisions)||!plainObject(state.bases)||!Array.isArray(state.events)||state.workspace.accountMode&&state.workspace.accountMode!==mode)throw fail();
 const audio=[],seen=new Set();let audioBytes=0;
 for(const r of state.records){if(r.type!=='recording')continue;for(const p of r.data?.localParts||[]){const id=`${r.id}:${p.sequence}`;if(typeof r.id!=='string'||!Number.isInteger(p.sequence)||p.sequence<0||!Number.isSafeInteger(p.size)||p.size<=0||p.size>2*1024*1024||!/^[a-f0-9]{64}$/.test(p.hash)||seen.has(id))throw fail();seen.add(id);audio.push({id,size:p.size,hash:p.hash});audioBytes+=p.size;}}
 return {audio,counts:{records:state.records.length,recordings:state.records.filter(r=>r.type==='recording'&&(r.data?.localParts||[]).length).length,audioChunks:audio.length,audioBytes,revisions:Object.values(state.revisions).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0)}};
}
export async function exportSegmented(vault,saveFile,{partBytes=BACKUP_PART_BYTES}={}){
 if(!Number.isSafeInteger(partBytes)||partBytes<1024*1024||partBytes>BACKUP_PART_BYTES||typeof saveFile!=='function')throw new Error('备份格式无效');
 const c=vault.context();await vault.connect(c);
 return navigator.locks.request(lockName(c),async()=>{
  vault.assertContext(c);const state=await vault.state(c),info=snapshot(state,c.mode),meta={...vault.meta,network:false},key=vault.key,id=crypto.randomUUID(),parts=[];let lines=[],size=0,index=1;
  const start=()=>{const line=JSON.stringify({format:'wardnote-device-part/2',backupId:id,index})+'\n';lines=[line];size=enc.encode(line).length;};start();
  const flush=async()=>{if(lines.length===1)return;if(index>MAX_PARTS)throw new Error('备份分卷数量超过支持范围。');vault.assertContext(c);const blob=new Blob(lines,{type:'application/x-ndjson'}),name=`wardnote-${id}-part-${String(index).padStart(6,'0')}.wnpart`,sha256=await hash(await blob.arrayBuffer());await saveFile(blob,name,{kind:'part',index,bytes:blob.size});vault.assertContext(c);parts.push({name,index,bytes:blob.size,sha256});index++;start();};
  const add=async(key,packet)=>{if(!validPacket(packet))throw fail();const total=Math.ceil(packet.data.length/FRAGMENT_CHARS);for(let n=0;n<total;n++){const line=JSON.stringify({key,index:n,total,iv:n===0?packet.iv:undefined,data:packet.data.slice(n*FRAGMENT_CHARS,(n+1)*FRAGMENT_CHARS)})+'\n',bytes=enc.encode(line).length;if(size+bytes>partBytes)await flush();lines.push(line);size+=bytes;}};
  await add('state',await vault.read('state','current',c));
  for(const item of info.audio){const packet=await vault.read('audio',item.id,c);if(!validPacket(packet)||packet.data.length!==Math.ceil((item.size+16)/3)*4)throw fail();let raw;try{raw=await vault.open(packet,`audio:${meta.id}:${item.id}`,key);}catch{throw fail();}if(raw.length!==item.size||await hash(raw)!==item.hash)throw fail();await add('audio:'+item.id,packet);vault.assertContext(c);}
  await flush();const manifest={format:'wardnote-device-manifest/2',id,createdAt:new Date().toISOString(),meta,partBytes,parts,counts:info.counts};
  manifest.proof=await vault.seal(enc.encode(await hash(enc.encode(canonical(manifest)))),`backup-manifest:${id}`,key);vault.assertContext(c);
  const blob=new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'});if(blob.size>MAX_MANIFEST_BYTES)throw new Error('备份分卷数量超过支持范围。');
  await saveFile(blob,`wardnote-${id}.wnmanifest`,{kind:'manifest',index:parts.length+1,bytes:blob.size});vault.assertContext(c);
  return {...info.counts,parts:parts.length,files:parts.length+1,bytes:parts.reduce((n,p)=>n+p.bytes,0)+blob.size,id,sourceId:meta.id,sourceMode:c.mode,sourceUsername:meta.username||'',createdAt:manifest.createdAt,snapshotHash:await hash(enc.encode(canonical(state)))};
 });
}
async function openSet(vault,files,password,mode){
 if(!Array.isArray(files)||files.length<2||files.length>MAX_PARTS+1)throw new Error('请选择清单及同一备份的全部分卷。');
 const manifests=files.filter(f=>f.name?.endsWith('.wnmanifest'));if(manifests.length!==1||manifests[0].size>MAX_MANIFEST_BYTES)throw fail();
 const m=JSON.parse(await manifests[0].text());
 if(m.format!=='wardnote-device-manifest/2'||typeof m.id!=='string'||!/^[a-f0-9-]{36}$/.test(m.id)||m.meta?.format!==1||!Array.isArray(m.parts)||!m.parts.length||m.parts.length>MAX_PARTS||!Number.isSafeInteger(m.partBytes)||m.partBytes<1024*1024||m.partBytes>BACKUP_PART_BYTES||!plainObject(m.counts)||!validPacket(m.proof))throw fail();
 if((m.meta.mode||'personal')!==mode)throw new Error('备份账号模式不匹配，请先在登录页选择对应模式。');
 const byName=new Map();for(const f of files){if(byName.has(f.name))throw fail();byName.set(f.name,f);}if(files.length!==m.parts.length+1)throw new Error('请选择清单及同一备份的全部分卷。');
 for(let n=0;n<m.parts.length;n++){const p=m.parts[n],f=byName.get(p.name);if(p.name!==`wardnote-${m.id}-part-${String(n+1).padStart(6,'0')}.wnpart`||p.index!==n+1||!Number.isSafeInteger(p.bytes)||p.bytes<=0||p.bytes>m.partBytes||!/^[a-f0-9]{64}$/.test(p.sha256)||!f||f.size!==p.bytes)throw fail();}
 const raw=await vault.open(m.meta.wrapped,`key:${m.meta.id}`,await vault.derive(password,Uint8Array.from(atob(m.meta.salt),x=>x.charCodeAt(0)))),key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);raw.fill(0);
 const {proof,...unsigned}=m,claimed=dec.decode(await vault.open(proof,`backup-manifest:${m.id}`,key));if(claimed!==await hash(enc.encode(canonical(unsigned))))throw fail();
 return {manifest:m,byName,key};
}
// Callback receives only a verified encrypted audio packet. Nothing is published
// as an account until the caller commits the state and vault metadata together.
export async function verifySegmented(vault,files,password,{onAudio=async()=>{},context=vault.context()}={}){
 try{
  const {manifest:m,byName,key}=await openSet(vault,files,password,context.mode);vault.assertContext(context);
  let state,info,current=null,payloads=0,audioIndex=0;
  const finish=async()=>{const packet={iv:current.iv,data:current.fragments.join('')};if(!validPacket(packet))throw fail();if(!payloads){if(current.key!=='state')throw fail();state=JSON.parse(dec.decode(await vault.open(packet,`state:${m.meta.id}`,key)));info=snapshot(state,context.mode);if(canonical(info.counts)!==canonical(m.counts))throw fail();}else{const expected=info.audio[audioIndex++];if(!expected||current.key!=='audio:'+expected.id||packet.data.length!==Math.ceil((expected.size+16)/3)*4)throw fail();const raw=await vault.open(packet,`audio:${m.meta.id}:${expected.id}`,key);if(raw.length!==expected.size||await hash(raw)!==expected.hash)throw fail();await onAudio(expected.id,packet);}payloads++;current=null;vault.assertContext(context);};
  for(const part of m.parts){const bytes=await byName.get(part.name).arrayBuffer();if(await hash(bytes)!==part.sha256)throw fail();const lines=dec.decode(bytes).split('\n');if(lines.pop()!=='')throw fail();const header=JSON.parse(lines.shift());if(header.format!=='wardnote-device-part/2'||header.backupId!==m.id||header.index!==part.index)throw fail();
   for(const line of lines){const f=JSON.parse(line);if(!plainObject(f)||typeof f.key!=='string'||!Number.isSafeInteger(f.index)||!Number.isSafeInteger(f.total)||f.total<1||f.index<0||f.index>=f.total||typeof f.data!=='string'||!f.data.length||f.data.length>FRAGMENT_CHARS||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.data))throw fail();
    if(!current){if(f.index!==0||typeof f.iv!=='string'||f.key!==(payloads?'audio:'+info.audio[audioIndex]?.id:'state'))throw fail();if(payloads&&f.total!==Math.ceil(Math.ceil((info.audio[audioIndex].size+16)/3)*4/FRAGMENT_CHARS))throw fail();current={key:f.key,total:f.total,iv:f.iv,fragments:[]};}
    if(f.key!==current.key||f.total!==current.total||f.index!==current.fragments.length||f.index>0&&f.iv!==undefined||f.index<f.total-1&&f.data.length!==FRAGMENT_CHARS)throw fail();current.fragments.push(f.data);if(current.fragments.length===current.total)await finish();
   }vault.assertContext(context);
  }
  if(current||!state||audioIndex!==info.audio.length||payloads!==info.audio.length+1)throw fail();
  return {state,key,meta:m.meta,counts:{...info.counts,parts:m.parts.length,files:m.parts.length+1,bytes:files.reduce((n,f)=>n+f.size,0),id:m.id,sourceId:m.meta.id,sourceMode:context.mode,sourceUsername:m.meta.username||'',createdAt:m.createdAt,snapshotHash:await hash(enc.encode(canonical(state)))}};
 }catch(error){vault.assertContext(context);if(error.message==='备份账号模式不匹配，请先在登录页选择对应模式。'||error.message==='请选择清单及同一备份的全部分卷。')throw error;throw fail();}
}
