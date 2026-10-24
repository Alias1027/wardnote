// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {randomUUID,createHash} from 'node:crypto';
import {AppError} from './vault.mjs';
import {validate,editable} from '../public/record-validation.js';
import {canonical,syncRecord,compareRecord} from '../public/sync-core.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
export function syncService(vault){
 // Preview tokens exist only in this process. No previous staging can be resumed.
 vault.resetStaging();
 const plans=new Map();
 const remoteId=()=>hash(vault.db.prepare('SELECT value FROM meta WHERE key=?').get('vault').value);
 function check(records,bases){
  if(!Array.isArray(records)||records.length>2000||!records.length||new Set(records.map(r=>r.id)).size!==records.length)throw new AppError(400,'同步范围无效');
  const all=new Map(vault.list().map(r=>[r.id,r]));for(const r of records){if(!/^[\da-f-]{36}$/i.test(r.id)||!Number.isSafeInteger(r.version)||r.version<1||r.type==='settings'||r.type==='voiceDraft'||r.type==='reflection'||(!editable.has(r.type)&&r.type!=='recording'))throw new AppError(400,'同步记录格式无效');validate(r.type,r.data);const old=all.get(r.id);if(!Number.isFinite(Date.parse(r.createdAt))||!Number.isFinite(Date.parse(r.updatedAt)))throw new AppError(400,'同步记录格式无效');if(old&&(old.type!==r.type||old.encounterId!==r.encounterId||old.createdAt!==r.createdAt))throw new AppError(409,'同步记录归属不匹配');all.set(r.id,r);}
  const conflicts=[];for(const r of records){const old=vault.get(r.id),status=compareRecord(r,old,bases[r.id]);if(['conflict','pull'].includes(status))conflicts.push(r.id);if(status==='push'&&r.version<=old.version)conflicts.push(r.id);if(r.type!=='encounter'&&all.get(r.encounterId)?.type!=='encounter')throw new AppError(400,'同步缺少对应患者');
   if(r.data.pendingTaskSnapshot&&(!Array.isArray(r.data.pendingTaskSnapshot.ids)||r.data.pendingTaskSnapshot.encounterId!==r.encounterId))throw new AppError(400,'同步记录格式无效');const references=[...(r.data.sources||[]).map(x=>x.id),...(r.data.pendingTaskSnapshot?.ids||[])];
   if(r.data.parentId)references.push(r.data.parentId);if(r.type==='review')references.push(r.data.summaryId);if(r.type==='resolution')references.push(r.data.reviewId);
   for(const id of references){const x=all.get(id);if(!x||(x.id!==r.encounterId&&x.encounterId!==r.encounterId))throw new AppError(400,'来源属于其他患者');}
   if(r.type==='recording'&&(!/^audio\/(webm|mp4|ogg|wav|x-wav|mpeg)(;.*)?$/.test(r.data.mime)||!r.data.consent?.trim()))throw new AppError(400,'录音格式或授权记录无效');
  }return [...new Set(conflicts)];
 }
 return {
  identity:remoteId,
  preview(d,session){if(d.remoteId!==remoteId()||d.confirmed!==true)throw new AppError(400,'请核对目标工作区');if(!Array.isArray(d.records)||!Array.isArray(d.audio||[]))throw new AppError(400,'同步范围无效');const records=d.records.map(syncRecord),bases=d.bases||{},conflicts=check(records,bases);if(conflicts.length)return {conflicts};
   const audio=d.audio||[];if(audio.length>100)throw new AppError(400,'录音数量过多');let bytes=0;for(const a of audio){const r=records.find(r=>r.id===a.id&&r.type==='recording');if(!r||!r.data.finalized||r.data.deletedAt||!Array.isArray(a.parts)||!a.parts.length||a.parts.some((p,i)=>p.sequence!==i||!Number.isSafeInteger(p.size)||p.size<1||p.size>2*1024*1024||!(/^[a-f0-9]{64}$/).test(p.hash)))throw new AppError(400,'录音片段清单无效');bytes+=a.parts.reduce((n,p)=>n+p.size,0);if(a.parts.reduce((n,p)=>n+p.size,0)!==r.data.bytes)throw new AppError(400,'录音大小与清单不符');}if(bytes>256*1024*1024)throw new AppError(413,'单次同步录音超过 256 MB，请减少范围');
   for(const [id,p]of plans)if(Date.now()-p.created>3600000){plans.delete(id);vault.clearStaging(id);}
   const id=randomUUID();plans.set(id,{records,bases,audio,session,created:Date.now()});return {previewId:id,records:records.length,audio:audio.length,bytes};
  },
  upload(id,recording,sequence,bytes,session){const p=plans.get(id),part=p?.audio.find(x=>x.id===recording)?.parts[sequence];if(!p||p.session!==session||Date.now()-p.created>3600000||!part||part.sequence!==sequence||part.size!==bytes.length||part.hash!==hash(bytes))throw new AppError(409,'同步预览或录音校验已失效，请重新预览');vault.stageChunk(id,recording,sequence,bytes);return {ok:true};},
  commit(id,session){const p=plans.get(id);if(!p||p.session!==session||Date.now()-p.created>3600000)throw new AppError(409,'同步预览已失效，请重新预览');if(p.result)return p.result;const conflicts=check(p.records,p.bases);if(conflicts.length)return {conflicts};for(const a of p.audio)for(const x of a.parts){const b=vault.stagedChunk(id,a.id,x.sequence);if(!b||b.length!==x.size||hash(b)!==x.hash)throw new AppError(409,'录音片段不完整，请重试上传');}
   vault.db.exec('BEGIN IMMEDIATE');try{for(const r of p.records){const old=vault.get(r.id);if(!old||canonical(syncRecord(old))!==canonical(r))vault.put(r);}for(const a of p.audio){const old=vault.audioInfo(a.id);if(old.length){const expected=Buffer.concat(a.parts.map(x=>vault.stagedChunk(id,a.id,x.sequence)));if(hash(vault.audioBytes(a.id))!==hash(expected))throw new AppError(409,'服务器原声与本机不同，未覆盖');}else for(const x of a.parts)vault.putSyncedChunk(a.id,x.sequence,vault.stagedChunk(id,a.id,x.sequence));}vault.audit('device.sync',{records:p.records.length,audio:p.audio.length});vault.clearStaging(id);vault.db.exec('COMMIT');}catch(e){vault.db.exec('ROLLBACK');throw e;}p.result={ok:true,records:p.records};return p.result;
  }
 };
}
