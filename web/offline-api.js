import {composeHandoff,preserveHandoff} from './continuity.js';
import {planVoiceRoute} from './voice-routing.js';
import {authenticateAccount,accountStatus} from './accounts.js';
import {composeBrief,currentBrief,briefStale,editBrief,briefHasContent} from './patient-brief.js';
import {appliedEvidence} from './voice-evidence.js';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {isLanguage,isReportLanguage} from './languages.js';
import {syncRecord} from './sync-core.js';
import {DeviceVault} from './offline-store.js';
import {editable,validate} from './record-validation.js';
import {SCHEMAS,composeSummary,sourcesChanged,retentionDecision,classify,clinicalRecords} from './domain.js';
export const device=new DeviceVault();
let external=null;
export function setExternalRequest(fn){external=fn;}
async function online(path,method,data,raw=false){if(!external||!await device.allowed())throw new Error('当前为脱机模式，未发送数据。');return external(path,method,data,raw);}
const response=(d,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json'}});
const now=()=>new Date().toISOString();
export async function localApi(path,method='GET',d={}){
 const context=device.context(),result=await localRequest(path,method,d,context);if(!['/status','/setup','/login','/logout'].includes(path))device.assertContext(context);return result;
}
async function localRequest(path,method,d,context){
 if(path==='/status')return response({initialized:await accountStatus(device.mode)});
 if(path==='/setup')return response({csrf:'device',workspace:d.username!==undefined?await authenticateAccount(device,{...d,create:true}):await device.setup(d.password,d.clinician)});
 if(path==='/login')return response({csrf:'device',workspace:d.username!==undefined?await authenticateAccount(device,d):await device.unlock(d.password)});
 if(path==='/logout'){try{await device.network(false);}finally{device.lock();}return response({ok:true});}
 if(path==='/backup')return new Response(await device.backup());
 if(path==='/integrations'){if(await device.allowed())try{return await online('/integrations','GET');}catch{}return response({model:{enabled:false},transcribe:false,export:false});}
 if(path==='/model-draft')return online('/device-model','POST',{...d,mode:'classify'});
 if(path==='/summaries'&&((d.from&&d.to&&d.from>d.to)||!isReportLanguage(d.language||'original')||(d.labelLanguage&&!isLanguage(d.labelLanguage))))throw new Error('模型请求参数无效');
 if(path==='/summaries'&&d.format==='sbar'&&d.language&&d.language!=='original')throw new Error('交接预览仅在本地汇集原文。');
 if(path==='/summaries'&&d.language&&d.language!=='original'){
  const before=await device.state(),e=before.records.find(x=>x.id===d.encounterId&&x.type==='encounter');if(!e)throw new Error('记录不存在');if(d.confirmed!==true)throw new Error('请确认向已配置服务提交内容');
  const source=composeSummary(e,before.records.filter(r=>r.encounterId===e.id),d.from,d.to,d.labelLanguage||'zh');const result=await(await online('/device-model','POST',{mode:'summary',text:source.text,language:d.language,confirmed:true})).json();
  return response(await device.mutate(s=>{if(sourcesChanged({data:source},s.records))throw new Error('来源记录已变化，请重新生成');const r={id:crypto.randomUUID(),type:'summary',encounterId:e.id,version:1,createdAt:now(),updatedAt:now(),data:{...source,originalText:source.text,text:result.text,language:d.language,generatedAt:now(),provenance:result.provenance}};s.records.push(r);return r;},context));
 }
 const trans=path.match(/^\/recordings\/([\w-]+)\/transcribe$/);
 if(trans){const r=(await device.state()).records.find(x=>x.id===trans[1]&&x.type==='recording');if(!r?.data.finalized||r.data.deletedAt)throw new Error('请先完成录音保存');const blob=await device.audio(r.id);const result=await(await online(`/device-transcribe?mime=${encodeURIComponent(r.data.mime)}&language=${encodeURIComponent(d.language||'zh')}`,'POST',blob,true)).json();return response(await device.mutate(s=>{const current=s.records.find(x=>x.id===r.id);if(current.version!==r.version)throw new Error('识别期间录音信息发生变化，请重试');(s.revisions[r.id]??=[]).unshift(structuredClone(current));current.version++;current.updatedAt=now();current.data={...current.data,transcript:result.text,transcriptSegments:result.segments||[],audioReviewed:false,noFurtherNeed:false};return current;},context));}
 if(path==='/send'){const s=await device.state(),records=clinicalRecords(s.records,d.encounterId).map(syncRecord);const actual=records.map(r=>`${r.id}:${r.version}`).sort(),expected=(d.expectedVersions||[]).map(r=>`${r.id}:${r.version}`).sort();if(d.confirm!=='发送本次住院记录'||JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('预览后资料已有变化，请重新查看发送内容');device.assertContext(context);return online('/device-send','POST',{confirmed:true,payload:{format:'wardnote/1',exportedAt:now(),includesAudio:false,records}});}
 let match=path.match(/^\/recordings\/([\w-]+)\/audio$/);
 if(match)return new Response(await device.audio(match[1]));
 match=path.match(/^\/recordings\/([\w-]+)\/chunks\/(\d+)$/);
 if(match&&method==='PUT'){const bytes=new Uint8Array(await d.arrayBuffer());device.assertContext(context);return response(await device.chunk(match[1],Number(match[2]),bytes));}
 if(method==='GET'){const s=await device.state();if(path==='/session')return response({csrf:'device',workspace:s.workspace});if(path==='/records')return response({records:s.records});if(path==='/audit')return response({events:s.events.slice(0,100)});const history=path.match(/^\/records\/([\w-]+)\/history$/);if(history)return response({revisions:s.revisions[history[1]]||[]});if(path==='/retention')return response({policy:{days:s.workspace.retentionDays||14},items:s.records.filter(r=>r.type==='recording').map(r=>({id:r.id,...retentionDecision(r,s.records,{days:s.workspace.retentionDays||14})}))});}
 return response(await device.mutate(async(s,extra)=>{
  const get=(id,type)=>{const r=s.records.find(x=>x.id===id);if(!r||(type&&r.type!==type))throw new Error('记录不存在');return r;};
  const linked=id=>get(id,'encounter');
  const audit=(action,detail={})=>s.events.unshift({time:now(),action,...detail});
  const update=(r,version,data)=>{if(version!==r.version)throw new Error('其他页面已更新此记录。你的修改仍留在当前页面，请先导出草稿或重新载入后合并。');(s.revisions[r.id]??=[]).unshift(structuredClone(r));r.data=structuredClone(data);r.version++;r.updatedAt=now();audit('record.updated',{id:r.id});return r;};
  const create=(type,encounterId,data)=>{const r={id:crypto.randomUUID(),type,encounterId,version:1,createdAt:now(),updatedAt:now(),data};s.records.push(r);audit('record.created',{id:r.id,type});return r;};
  const checkSources=(data,e,strict=true)=>{for(const x of data.sources||[]){const r=get(x.id);if(r.encounterId!==e&&r.id!==e)throw new Error('来源属于其他患者');if(strict&&r.version!==x.version)throw new Error('来源已变更，请重新汇总或核对');}};
  if(path==='/session')return {csrf:'device',workspace:s.workspace};
  if(path==='/records'&&method==='GET')return {records:s.records};
  if(path==='/integrations')return {model:{enabled:false},transcribe:false,export:false};
  if(path==='/settings'){if(!Number.isInteger(d.retentionDays)||d.retentionDays<7||d.retentionDays>365)throw new Error('候选期限须为 7–365 天');s.workspace.retentionDays=d.retentionDays;return s.workspace;}
  if(path==='/audit')return {events:s.events.slice(0,100)};
  if(path==='/records'&&method==='POST'){
   const {type,encounterId='',data}=d;if(!editable.has(type)||['summary','brief'].includes(type))throw new Error('记录类型不允许');if(type!=='encounter'&&(type!=='reflection'||encounterId))linked(encounterId);validate(type,data);
   if(type==='note'){data.review=null;checkSources(data,encounterId);}
   if(type==='review'){const summary=get(data.summaryId,'summary');if(summary.encounterId!==encounterId||data.summaryVersion!==summary.version||!summary.data.review||sourcesChanged(summary,s.records))throw new Error('请先完成当前摘要的医生核对');if(!['confirmed','corrections','unable','declined'].includes(data.status)||!data.scope?.trim()||!data.participant?.trim())throw new Error('请记录参与者、核对范围和状态');}
   if(type==='resolution'){const r=get(data.reviewId,'review');if(r.encounterId!==encounterId||r.data.status!=='corrections'||!data.action?.trim())throw new Error('请记录修正、解释及处理结果');data.clinician=s.workspace.clinician;}
   return create(type,encounterId,data);
  }
  if(path==='/briefs'&&method==='POST'){
   linked(d.encounterId);const old=currentBrief(s.records,d.encounterId);
   if((old?.id||null)!==(d.id||null)||(old&&old.version!==d.version))throw new Error('记录版本已变更');
   const data=composeBrief(s.records,d.encounterId,isLanguage(d.labelLanguage)?d.labelLanguage:'zh');validate('brief',data);
   return old?update(old,d.version,data):create('brief',d.encounterId,data);
  }
  if(path==='/background'){linked(d.encounterId);return s.records.find(r=>r.type==='background'&&r.encounterId===d.encounterId)||create('background',d.encounterId,{fields:{}});}
  let m=path.match(/^\/records\/([\w-]+)(?:\/(verify|history|link))?$/);
  if(m){const r=get(m[1]);if(m[2]==='history')return {revisions:s.revisions[r.id]||[]};
   if(m[2]==='link'){linked(d.encounterId);if(r.type!=='reflection'||r.encounterId)throw new Error('此复盘已关联患者，不能重新分配');update(r,d.version,r.data);r.encounterId=d.encounterId;return r;}
   if(m[2]==='verify'){if(!['note','summary','brief'].includes(r.type))throw new Error('该类型不能签认');if(r.type==='brief'&&briefStale(r,s.records)||r.type==='summary'&&sourcesChanged(r,s.records))throw new Error('来源已变更，请重新生成摘要后核对');if(r.type==='brief'&&!briefHasContent(r.data)||r.type==='summary'&&!r.data.text.trim())throw new Error('摘要不能为空');return update(r,d.version,{...r.data,review:{clinician:s.workspace.clinician,time:now()}});}
   if(method==='PUT'){if(!editable.has(r.type)||['review','resolution'].includes(r.type))throw new Error('此记录不能直接修改');if(r.type==='brief')d.data=editBrief(r.data,d.data?.fields||{});else d.data=preserveHandoff(r.data,d.data);validate(r.type,d.data);if(['note','summary'].includes(r.type)){d.data.review=null;if(r.type==='summary'){d.data.sources=r.data.sources;d.data.pendingTaskSnapshot=r.data.pendingTaskSnapshot;}checkSources(d.data,r.encounterId,r.type==='summary');}return update(r,d.version,d.data);}
  }
  if(path==='/classify'){if(!['initial','daily'].includes(d.kind)||typeof d.text!=='string'||d.text.length>200000)throw new Error('转写文本不正确');return {proposals:classify(d.text,d.kind)};}
  if(path==='/voice-route-apply'){
   const draft=get(d.draftId,'voiceDraft'),plan=planVoiceRoute(s.records,draft,d.draftVersion,s.workspace.clinician,isLanguage(d.labelLanguage)?d.labelLanguage:'zh');
   const records=plan.changes.map(c=>structuredClone(c.id?update(get(c.id),c.version,c.data):create(c.type,c.encounterId,c.data)));
   return {records,draft:structuredClone(update(draft,d.draftVersion,plan.draftData))};
  }
  if(path==='/voice-apply'){
   const draft=get(d.draftId,'voiceDraft'),note=get(d.noteId,'note'),source=draft.data.candidateSource;
   if(d.draftVersion!==draft.version||d.noteVersion!==note.version)throw new Error('记录已变化，请重新载入后核对');
   if(draft.encounterId!==note.encounterId||draft.data.noteId!==note.id||!source||(draft.data.inputMode||'dictation')!==(source.inputMode||'dictation')||source.noteId!==note.id||source.text!==draft.data.text||source.language!==draft.data.language)throw new Error('候选与目标记录不匹配');
   const chosen=draft.data.proposals.filter(p=>p.use===true),keys=new Set(SCHEMAS[note.data.kind].map(([k])=>k));if(!chosen.length||chosen.some(p=>p.reviewOnly===true||!keys.has(p.section)||typeof p.text!=='string'||!p.text.trim()))throw new Error('请先勾选已核对的候选内容');
   const data=structuredClone(note.data);for(const p of chosen)data.fields[p.section]=[data.fields[p.section],p.text].filter(Boolean).join('\n');
   if(draft.data.sourceId){const r=get(draft.data.sourceId,'recording');if(r.encounterId!==note.encounterId||r.version!==draft.data.sourceVersion||r.data.deletedAt)throw new Error('录音来源已变化，请重新核对');data.sources=(data.sources||[]).filter(x=>x.id!==r.id);data.sources.push({id:r.id,version:r.version});}
   let evidence;try{evidence=appliedEvidence(chosen,draft.data.text,draft.data.sourceId?get(draft.data.sourceId,'recording'):null);}catch{throw new Error('候选缺少有效原文依据，请重新生成');}
          data.review=null;data.assistance=[...(data.assistance||[]),{...draft.data.provenance,sourceId:draft.data.sourceId||null,sourceVersion:draft.data.sourceVersion||null,evidence,reviewedAt:now(),clinician:s.workspace.clinician}];validate('note',data);const saved=structuredClone(update(note,d.noteVersion,data));const consumed=update(draft,d.draftVersion,{...draft.data,proposals:[],candidateSource:null});return {note:saved,draft:consumed};
  }
  if(path==='/summaries'){const e=linked(d.encounterId);if(d.language&&d.language!=='original')throw new Error('指定语言输出需要联网并另行确认提交。');if(d.from&&d.to&&d.from>d.to)throw new Error('日期范围不正确');const data=d.format==='sbar'?composeHandoff(e,s.records,d.labelLanguage||'zh'):composeSummary(e,s.records.filter(r=>r.encounterId===e.id),d.from,d.to,d.labelLanguage||'zh');data.language='original';data.generatedAt=now();return create('summary',e.id,data);}
  if(path==='/export'){linked(d.encounterId);return {format:'wardnote/1',exportedAt:now(),includesAudio:false,records:clinicalRecords(s.records,d.encounterId).map(syncRecord)};}
  if(path==='/recordings'&&method==='POST'){
   linked(d.encounterId);if(!d.consent?.trim())throw new Error('请记录本次录音的告知与授权情况');if(!/^audio\/(webm|mp4|ogg|wav|x-wav|mpeg|amr|3gpp|aac|flac)(;.*)?$/.test(d.mime))throw new Error('不支持的音频格式');
   if(d.parentId){const p=get(d.parentId,'recording');if(p.encounterId!==d.encounterId||p.data.deletedAt||!Number.isFinite(d.start)||!Number.isFinite(d.end)||d.start<0||d.end<=d.start||d.end>p.data.duration+.5)throw new Error('片段范围不正确');}
   return create('recording',d.encounterId,{title:d.title||'查房录音',mime:d.mime,consent:d.consent,finalized:false,important:!!d.parentId,parentId:d.parentId||null,start:d.start,end:d.end,audioReviewed:false,noFurtherNeed:false,hold:false,memo:'',date:d.date||now().slice(0,10),localParts:[]});
  }
  m=path.match(/^\/recordings\/([\w-]+)\/(finalize|metadata|recover)$/);
  if(m){const r=get(m[1],'recording');if(r.data.deletedAt)throw new Error('原录音已按记录清理，无法回听');
   if(m[2]==='metadata'){const data={...r.data};for(const k of ['title','memo'])if(typeof d[k]==='string')data[k]=d[k].slice(0,10000);for(const k of ['important','hold','audioReviewed','noFurtherNeed'])if(typeof d[k]==='boolean')data[k]=d[k];return update(r,d.version,data);}
   const parts=r.data.localParts||[];if(!parts.length||parts.some((p,i)=>p.sequence!==i))throw new Error('录音片段不完整，请检查已保存部分。');
   if(m[2]==='finalize'&&(parts.length!==d.chunks||!Number.isFinite(d.duration)||d.duration<0))throw new Error('录音片段不完整，请重试上传');
   return update(r,r.version,{...r.data,finalized:true,duration:m[2]==='recover'?Math.max(0,(Date.parse(r.data.lastSavedAt)-Date.parse(r.createdAt))/1000):d.duration,bytes:parts.reduce((a,p)=>a+p.size,0),recovered:m[2]==='recover',hold:m[2]==='recover'||r.data.hold});
  }
  if(path==='/retention')return {policy:{days:s.workspace.retentionDays||14},items:s.records.filter(r=>r.type==='recording').map(r=>({id:r.id,...retentionDecision(r,s.records,{days:s.workspace.retentionDays||14})}))};
  if(path==='/retention/clean'){if(d.confirm!=='清理已审核录音'||!Array.isArray(d.ids)||!d.ids.length)throw new Error('请确认清理范围');const chosen=d.ids.map(id=>get(id,'recording'));if(chosen.some(r=>!retentionDecision(r,s.records,{days:s.workspace.retentionDays||14}).eligible))throw new Error('所选资料中存在未满足清理条件的录音');for(const r of chosen){for(const p of r.data.localParts||[])extra.push(['audio',`${r.id}:${p.sequence}`,undefined]);update(r,r.version,{...r.data,localParts:[],deletedAt:now(),transcript:undefined,transcriptSegments:undefined});}return {count:chosen.length};}
  throw new Error('此操作需要联网，当前资料仍保存在本机。');
 },context));
}
