import {composeHandoff,preserveHandoff} from './public/continuity.js';
import {planVoiceRoute} from './public/voice-routing.js';
import {composeBrief,currentBrief,briefStale,editBrief,briefHasContent} from './public/patient-brief.js';
import {appliedEvidence} from './public/voice-evidence.js';
import {authorizationService} from './lib/authorization.mjs';
import {syncService} from './lib/sync-service.mjs';
import {editable,validate} from './public/record-validation.js';
import {isLanguage,isReportLanguage,localeAssets} from './public/languages.js';
import {modelDraft,modelConfig,modelStatus} from './lib/model-service.mjs';
import http from 'node:http';
import https from 'node:https';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { Vault, AppError } from './lib/vault.mjs';
import { transcribe, sendExport, endpoint } from './lib/integrations.mjs';
import { VERSION, SCHEMAS, composeSummary, sourcesChanged, retentionDecision, classify, clinicalRecords } from './public/domain.js';

const HERE=dirname(fileURLToPath(import.meta.url));
const types=new Map([['.html','text/html; charset=utf-8'],['.css','text/css; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.json','application/json'],['.webmanifest','application/manifest+json'],['.svg','image/svg+xml'],['.png','image/png']]);
async function body(req,max=1024*1024,raw=false) {
  let size=0; const chunks=[];
  for await (const chunk of req) { size+=chunk.length; if(size>max) throw new AppError(413,'上传内容过大'); chunks.push(chunk); }
  const b=Buffer.concat(chunks); if(raw) return b;
  try { return b.length?JSON.parse(b.toString('utf8')):{}; } catch { throw new AppError(400,'请求格式不正确'); }
}
function createWorkspace(options={}) {
  const dataDir=options.dataDir||resolve(HERE,'../data');
  const config={...options.config}; modelConfig(config);
  if(config.transcribeUrl) endpoint(config.transcribeUrl); if(config.exportUrl) endpoint(config.exportUrl);
  const vault=new Vault(dataDir), sessions=new Map(), attempts=new Map();
  const sync=syncService(vault),authorization=authorizationService(vault,config.accountMode||'personal',config);
  function auth(req) {
    const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ward_session='))?.slice(13);
    const session=sessions.get(token);
    if(!session || Date.now()-session.last>30*60000 || Date.now()-session.created>12*3600000) { if(token)sessions.delete(token); throw new AppError(401,'请解锁工作区'); }
    session.last=Date.now(); vault.assertOpen(); return {token,...session};
  }
  function startSession(res) {
    const token=randomBytes(32).toString('hex'), csrf=randomBytes(24).toString('hex');
    sessions.set(token,{csrf,last:Date.now(),created:Date.now()});
    res.setHeader('Set-Cookie',`ward_session=${token}; HttpOnly; SameSite=Strict; Path=/${config.tls?'; Secure':''}`);
    return csrf;
  }
  function mustGet(id,type) { const r=vault.get(id); if(!r || (type&&r.type!==type))throw new AppError(404,'记录不存在'); return r; }
  function linked(encounterId) { const e=mustGet(encounterId,'encounter'); return e; }
  function checkSources(d,encounterId,strict=true) {
    for(const s of d.sources||[]) { const r=mustGet(s.id); if(r.encounterId!==encounterId && r.id!==encounterId)throw new AppError(400,'来源属于其他患者'); if(strict&&r.version!==s.version)throw new AppError(409,'来源已变更，请重新汇总或核对'); }
  }
  function policy() { return {days:vault.get('workspace').data.retentionDays||14}; }
  async function handler(req,res) {
    const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY',
      'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
      'Permissions-Policy':'microphone=(self), camera=(), geolocation=()','Cache-Control':'no-store'};
    for(const [k,v] of Object.entries(headers))res.setHeader(k,v);
    const json=(data,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'}); res.end(JSON.stringify(data));};
    try {
      const host=req.headers.host||''; const loopback=/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
      if(!loopback && (!config.publicOrigin||new URL(config.publicOrigin).host!==host)) throw new AppError(403,'访问地址未配置');
      const origin=`${config.tls?'https':'http'}://${host}`;
      const url=new URL(req.url,origin), path=url.pathname;
      if(!['GET','HEAD'].includes(req.method)) {
        if(!req.headers.origin || (req.headers.origin!==origin && (!config.publicOrigin || req.headers.origin!==config.publicOrigin))) throw new AppError(403,'请求来源不匹配');
      }
      if(path==='/api/status'&&req.method==='GET') return json({app:'wardnote-local',initialized:vault.initialized,version:VERSION,accountMode:config.accountMode||'personal'});
      if(['/api/setup','/api/login'].includes(path)&&req.method==='POST') {
        const ip=req.socket.remoteAddress, a=attempts.get(ip)||{count:0,time:Date.now()};
        if(Date.now()-a.time>10*60000){a.count=0;a.time=Date.now();}
        if(a.count>=10) throw new AppError(429,'尝试次数过多，请十分钟后重试');
        const d=await body(req,4096); try {
          if(path==='/api/setup') { if(!loopback||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress))throw new AppError(403,'请先在服务器本机建立工作区'); vault.setup(d.password,d.clinician); }
          else vault.unlock(d.password);
        } catch(e) {a.count++;attempts.set(ip,a);throw e;}
        attempts.delete(ip); const csrf=startSession(res); return json({csrf,workspace:vault.get('workspace').data});
      }
      if(path.startsWith('/api/')) {
        const session=auth(req);
        if(req.method!=='GET'&&req.headers['x-csrf-token']!==session.csrf) throw new AppError(403,'会话校验失败，请刷新后重试');
        if(path==='/api/device-connection'&&req.method==='POST'){const d=await body(req);if(d.allowed===true&&d.confirmed!==true)throw new AppError(400,'请确认联网');sessions.get(session.token).deviceNetwork=d.allowed===true;return json({allowed:d.allowed===true,remoteId:sync.identity(),accountMode:config.accountMode||'personal',destinations:authorization.describe()});}
        if(path.startsWith('/api/sync/')||path.startsWith('/api/device-')){if(!sessions.get(session.token).deviceNetwork)throw new AppError(403,'请先确认联网');}
        if(path==='/api/device-authorizations'&&req.method==='POST')return json(await authorization.submit((await body(req,100000)).events));
        if(path==='/api/device-model'&&req.method==='POST'){const d=await body(req);if(d.confirmed!==true||!['classify','summary'].includes(d.mode))throw new AppError(400,'请确认向已配置服务提交内容');return json(await modelDraft(d,config));}
        if(path==='/api/device-transcribe'&&req.method==='POST'){const mime=url.searchParams.get('mime')||'';if(!/^audio\/(webm|mp4|ogg|wav|x-wav|mpeg)(;.*)?$/.test(mime))throw new AppError(400,'不支持的音频格式');return json(await transcribe(await body(req,100*1024*1024,true),mime,{...config,language:url.searchParams.get('language')||'zh'}));}
        if(path==='/api/device-send'&&req.method==='POST'){const d=await body(req,16*1024*1024),p=d.payload;if(d.confirmed!==true||p?.format!=='wardnote/1'||p.includesAudio!==false||!Array.isArray(p.records)||!p.records.length||p.records.some(r=>['reflection','voiceDraft','settings'].includes(r.type)))throw new AppError(400,'请先确认发送范围');if(p.records.length>2000)throw new AppError(400,'请先确认发送范围');const encounters=p.records.filter(r=>r.type==='encounter');if(encounters.length!==1||p.records.some(r=>r.id!==encounters[0].id&&r.encounterId!==encounters[0].id))throw new AppError(400,'来源属于其他患者');for(const r of p.records){if(!editable.has(r.type)&&r.type!=='recording')throw new AppError(400,'记录类型不允许');validate(r.type,r.data);}return json(await sendExport(p,config));}
        if(path==='/api/sync/census'&&req.method==='GET')return json({remoteId:sync.identity(),patients:vault.list().filter(r=>r.type==='encounter').map(r=>({id:r.id,displayName:r.data.displayName,caseId:r.data.caseId,bed:r.data.bed}))});
        if(path==='/api/sync/snapshot'&&req.method==='POST'){const d=await body(req);if(!Array.isArray(d.ids)||d.ids.length>100)throw new AppError(400,'请选择患者');return json({remoteId:sync.identity(),records:vault.list().filter(r=>(d.ids.includes(r.id)||d.ids.includes(r.encounterId))&&!['settings','voiceDraft','reflection'].includes(r.type)).map(r=>r.type==='recording'?{...r,data:{...r.data,audioMissing:!vault.audioInfo(r.id).length}}:r)});}
        if(path==='/api/sync/preview'&&req.method==='POST')return json(sync.preview(await body(req,16*1024*1024),session.token));
        if(path==='/api/sync/commit'&&req.method==='POST')return json(sync.commit((await body(req)).previewId,session.token));
        const syncUpload=path.match(/^\/api\/sync\/audio\/([\w-]+)\/([\w-]+)\/(\d+)$/);
        if(syncUpload&&req.method==='PUT')return json(sync.upload(syncUpload[1],syncUpload[2],Number(syncUpload[3]),await body(req,2*1024*1024,true),session.token));
        if(path==='/api/session'&&req.method==='GET') return json({csrf:session.csrf,workspace:vault.get('workspace').data});
        if(path==='/api/logout'&&req.method==='POST') {sessions.delete(session.token); if(!sessions.size)vault.lock(); res.setHeader('Set-Cookie','ward_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json({ok:true});}
        if(path==='/api/background'&&req.method==='POST') {
          const {encounterId}=await body(req);linked(encounterId);
          // Opening the background fold is idempotent, including retries and other tabs.
          const existing=vault.list().find(r=>r.type==='background'&&r.encounterId===encounterId);
          if(existing)return json(existing);
          const r=vault.create('background',encounterId,{fields:{}});vault.audit('record.created',{id:r.id,type:'background'});return json(r,201);
        }
        if(path==='/api/records'&&req.method==='GET') return json({records:vault.list().filter(r=>r.type!=='settings')});
        if(path==='/api/records'&&req.method==='POST') {
          const {type,encounterId='',data}=await body(req); if(!editable.has(type)||['summary','brief'].includes(type)) throw new AppError(400,'记录类型不允许');
          if(type!=='encounter'&&(type!=='reflection'||encounterId))linked(encounterId);
          validate(type,data); if(type==='note') {data.review=null;checkSources(data,encounterId);}
          if(type==='review') {
            const s=mustGet(data.summaryId,'summary'); if(s.encounterId!==encounterId||data.summaryVersion!==s.version||!s.data.review||sourcesChanged(s,vault.list()))throw new AppError(409,'请先完成当前摘要的医生核对');
            if(!['confirmed','corrections','unable','declined'].includes(data.status)||!data.scope?.trim()||!data.participant?.trim())throw new AppError(400,'请记录参与者、核对范围和状态');
          }
          if(type==='resolution') {
            const review=mustGet(data.reviewId,'review');if(review.encounterId!==encounterId||review.data.status!=='corrections')throw new AppError(400,'核对意见不属于本患者或无需处理');
            if(!data.action?.trim())throw new AppError(400,'请记录修正、解释及处理结果');
            data.clinician=vault.get('workspace').data.clinician;
          }
          const r=vault.create(type,encounterId,data);vault.audit('record.created',{id:r.id,type});return json(r,201);
        }
        const reflectionLink=path.match(/^\/api\/records\/([\w-]+)\/link$/);
        if(reflectionLink&&req.method==='POST') {
          const old=mustGet(reflectionLink[1],'reflection'),d=await body(req);linked(d.encounterId);
          if(old.encounterId)throw new AppError(409,'此复盘已关联患者，不能重新分配');
          const r=vault.linkReflection(old.id,d.version,d.encounterId);
          vault.audit('reflection.linked',{id:r.id,encounterId:r.encounterId});return json(r);
        }
        let match=path.match(/^\/api\/records\/([\w-]+)$/);
        if(match&&req.method==='PUT') {
          const old=mustGet(match[1]); if(!editable.has(old.type)||['review','resolution'].includes(old.type))throw new AppError(400,'此记录不能直接修改');
          const {version,data:inputData}=await body(req); const data=old.type==='brief'?editBrief(old.data,inputData?.fields||{}):preserveHandoff(old.data,inputData); validate(old.type,data);
          if(['note','summary'].includes(old.type)) {data.review=null; if(old.type==='summary'){data.sources=old.data.sources;data.pendingTaskSnapshot=old.data.pendingTaskSnapshot;} checkSources(data,old.encounterId,old.type==='summary');}
          const r=vault.update(old.id,version,data);vault.audit('record.updated',{id:r.id,version:r.version});return json(r);
        }
        match=path.match(/^\/api\/records\/([\w-]+)\/verify$/);
        if(match&&req.method==='POST') {
          const old=mustGet(match[1]);if(!['note','summary','brief'].includes(old.type))throw new AppError(400,'该类型不能签认');
          const d=await body(req);if(d.version!==old.version)throw new AppError(409,'记录版本已变更');
          if(old.type==='brief'&&briefStale(old,vault.list())||old.type==='summary' && sourcesChanged(old,vault.list()))throw new AppError(409,'来源已变更，请重新生成摘要后核对');
          if(old.type==='brief'&&!briefHasContent(old.data)||old.type==='summary'&&!old.data.text.trim())throw new AppError(400,'摘要不能为空');
          const r=vault.update(old.id,old.version,{...old.data,review:{clinician:vault.get('workspace').data.clinician,time:new Date().toISOString()}});
          vault.audit('record.verified',{id:r.id,version:r.version});return json(r);
        }
        match=path.match(/^\/api\/records\/([\w-]+)\/history$/);
        if(match&&req.method==='GET') {mustGet(match[1]);return json({revisions:vault.history(match[1])});}
        if(path==='/api/voice-route-apply'&&req.method==='POST'){
          const d=await body(req),draft=mustGet(d.draftId,'voiceDraft'),plan=planVoiceRoute(vault.list(),draft,d.draftVersion,vault.get('workspace').data.clinician,isLanguage(d.labelLanguage)?d.labelLanguage:'zh');
          vault.db.exec('BEGIN IMMEDIATE');try{const records=plan.changes.map(c=>c.id?vault.update(c.id,c.version,c.data):vault.create(c.type,c.encounterId,c.data));const consumed=vault.update(draft.id,d.draftVersion,plan.draftData);vault.audit('voice.routed',{draftId:draft.id,ids:records.map(r=>r.id)});vault.db.exec('COMMIT');return json({records,draft:consumed});}catch(error){vault.db.exec('ROLLBACK');throw error;}
        }
        if(path==='/api/voice-apply'&&req.method==='POST'){
          const d=await body(req),draft=mustGet(d.draftId,'voiceDraft'),note=mustGet(d.noteId,'note'),s=draft.data.candidateSource;
          if(d.draftVersion!==draft.version||d.noteVersion!==note.version)throw new AppError(409,'记录已变化，请重新载入后核对');
          if(draft.encounterId!==note.encounterId||draft.data.noteId!==note.id||!s||(draft.data.inputMode||'dictation')!==(s.inputMode||'dictation')||s.noteId!==note.id||s.text!==draft.data.text||s.language!==draft.data.language)throw new AppError(400,'候选与目标记录不匹配');
          const chosen=draft.data.proposals.filter(p=>p.use===true),keys=new Set(SCHEMAS[note.data.kind].map(([k])=>k));
          if(!chosen.length||chosen.some(p=>p.reviewOnly===true||!keys.has(p.section)||typeof p.text!=='string'||!p.text.trim()))throw new AppError(400,'请先勾选已核对的候选内容');
          const data=structuredClone(note.data);for(const p of chosen)data.fields[p.section]=[data.fields[p.section],p.text].filter(Boolean).join('\n');
          if(draft.data.sourceId){const source=mustGet(draft.data.sourceId,'recording');if(source.encounterId!==note.encounterId||source.version!==draft.data.sourceVersion||source.data.deletedAt)throw new AppError(409,'录音来源已变化，请重新核对');data.sources=(data.sources||[]).filter(s=>s.id!==source.id);data.sources.push({id:source.id,version:source.version});}
          let evidence;try{evidence=appliedEvidence(chosen,draft.data.text,draft.data.sourceId?vault.get(draft.data.sourceId):null);}catch{throw new AppError(400,'候选缺少有效原文依据，请重新生成');}
          data.review=null;data.assistance=[...(data.assistance||[]),{...draft.data.provenance,sourceId:draft.data.sourceId||null,sourceVersion:draft.data.sourceVersion||null,evidence,reviewedAt:new Date().toISOString(),clinician:vault.get('workspace').data.clinician}];validate('note',data);
          vault.db.exec('BEGIN IMMEDIATE');let saved,consumed;
          try{saved=vault.update(note.id,note.version,data);consumed=vault.update(draft.id,draft.version,{...draft.data,proposals:[],candidateSource:null});vault.audit('voice.applied',{id:note.id,draftId:draft.id});vault.db.exec('COMMIT');}catch(error){vault.db.exec('ROLLBACK');throw error;}
          return json({note:saved,draft:consumed});
        }
        if(path==='/api/model-draft'&&req.method==='POST'){const d=await body(req);linked(d.encounterId);if(d.confirmed!==true)throw new AppError(400,'请确认向已配置服务提交内容');const result=await modelDraft({...d,mode:'classify'},config);vault.audit('model.candidates',{encounterId:d.encounterId,provider:result.provenance.provider});return json(result);}
        if(path==='/api/classify'&&req.method==='POST') {const d=await body(req);if(!['daily','initial'].includes(d.kind)||typeof d.text!=='string'||d.text.length>200000)throw new AppError(400,'转写文本不正确');return json({proposals:classify(d.text,d.kind)});}
        if(path==='/api/briefs'&&req.method==='POST') {
          const d=await body(req);linked(d.encounterId);const old=currentBrief(vault.list(),d.encounterId);
          if((old?.id||null)!==(d.id||null)||(old&&old.version!==d.version))throw new AppError(409,'记录版本已变更');
          const data=composeBrief(vault.list(),d.encounterId,isLanguage(d.labelLanguage)?d.labelLanguage:'zh');validate('brief',data);
          const r=old?vault.update(old.id,old.version,data):vault.create('brief',d.encounterId,data);vault.audit('brief.generated',{id:r.id,version:r.version});return json(r,old?200:201);
        }
        if(path==='/api/summaries'&&req.method==='POST') {
          const d=await body(req), e=linked(d.encounterId);if(d.from&&d.to&&d.from>d.to)throw new AppError(400,'日期范围不正确');
          if(d.format==='sbar'&&d.language&&d.language!=='original')throw new AppError(400,'交接预览仅在本地汇集原文。');
          const data=d.format==='sbar'?composeHandoff(e,vault.list(),isLanguage(d.labelLanguage)?d.labelLanguage:'zh'):composeSummary(e,vault.list().filter(r=>r.encounterId===e.id),d.from,d.to,isLanguage(d.labelLanguage)?d.labelLanguage:'zh');
          const outputLanguage=d.language||'original';if(!isReportLanguage(outputLanguage))throw new AppError(400,'模型请求参数无效');
          data.language=outputLanguage;data.generatedAt=new Date().toISOString();
          if(outputLanguage!=='original'){if(d.confirmed!==true)throw new AppError(400,'请确认向已配置服务提交内容');const result=await modelDraft({text:data.text,language:outputLanguage,mode:'summary'},config);if(sourcesChanged({data},vault.list()))throw new AppError(409,'来源记录已变化，请重新生成');data.originalText=data.text;data.text=result.text;data.provenance=result.provenance;}
          const r=vault.create('summary',e.id,data);vault.audit('summary.created',{id:r.id});return json(r,201);
        }
        if(path==='/api/recordings'&&req.method==='POST') {
          const d=await body(req,8192);linked(d.encounterId);
          if(!d.consent?.trim())throw new AppError(400,'请记录本次录音的告知与授权情况');
          if(!/^audio\/(webm|mp4|ogg|wav|x-wav|mpeg)(;.*)?$/.test(d.mime))throw new AppError(400,'不支持的音频格式');
          if(d.parentId){const p=mustGet(d.parentId,'recording');if(p.encounterId!==d.encounterId||p.data.deletedAt)throw new AppError(400,'原录音不属于当前患者或已删除');if(!Number.isFinite(d.start)||!Number.isFinite(d.end)||d.start<0||d.end<=d.start||d.end>p.data.duration+0.5)throw new AppError(400,'片段范围不正确');}
          const r=vault.create('recording',d.encounterId,{title:d.title||'查房录音',mime:d.mime,consent:d.consent,finalized:false,important:!!d.parentId,parentId:d.parentId||null,start:d.start,end:d.end,audioReviewed:false,noFurtherNeed:false,hold:false,memo:'',date:d.date||new Date().toISOString().slice(0,10)});
          vault.audit('recording.started',{id:r.id,encounterId:r.encounterId});return json(r,201);
        }
        match=path.match(/^\/api\/recordings\/([\w-]+)\/chunks\/(\d+)$/);
        if(match&&req.method==='PUT') {const index=Number(match[2]);if(index>100000)throw new AppError(400,'片段序号超出范围');const b=await body(req,2*1024*1024,true);if(!b.length)throw new AppError(400,'空片段');vault.addChunk(match[1],index,b);return json({ok:true});}
        match=path.match(/^\/api\/recordings\/([\w-]+)\/(finalize|metadata|transcribe|audio)$/);
        if(match) {
          const r=mustGet(match[1],'recording'), action=match[2];if(r.data.deletedAt)throw new AppError(410,'原录音已按记录清理，无法回听');
          if(action==='audio'&&req.method==='GET') {const b=vault.audioBytes(r.id);if(!b.length)throw new AppError(404,'录音片段尚未上传');vault.audit('recording.played',{id:r.id});res.writeHead(200,{'Content-Type':r.data.mime,'Content-Length':b.length});return res.end(b);}
          const d=await body(req);
          if(action==='finalize'&&req.method==='POST') {
            const parts=vault.audioInfo(r.id);if(!parts.length||parts.length!==d.chunks||parts.some((p,i)=>p.sequence!==i)||!Number.isFinite(d.duration)||d.duration<0)throw new AppError(409,'录音片段不完整，请重试上传');
            const saved=vault.update(r.id,r.version,{...r.data,finalized:true,duration:d.duration,bytes:parts.reduce((a,p)=>a+p.size,0)});vault.audit('recording.saved',{id:r.id});return json(saved);
          }
          if(action==='metadata'&&req.method==='POST') {
            const data={...r.data};for(const k of ['title','memo'])if(typeof d[k]==='string')data[k]=d[k].slice(0,10000);
            for(const k of ['important','hold','audioReviewed','noFurtherNeed'])if(typeof d[k]==='boolean')data[k]=d[k];
            const saved=vault.update(r.id,d.version,data);vault.audit('recording.reviewed',{id:r.id});return json(saved);
          }
          if(action==='transcribe'&&req.method==='POST') {
            if(!r.data.finalized)throw new AppError(409,'请先完成录音保存');
            const result=await transcribe(vault.audioBytes(r.id),r.data.mime,{...config,language:d.language||config.language});
            const current=mustGet(r.id,'recording');if(current.version!==r.version)throw new AppError(409,'识别期间录音信息发生变化，请重试');
            const saved=vault.update(r.id,r.version,{...r.data,transcript:result.text,transcriptSegments:result.segments||[],audioReviewed:false,noFurtherNeed:false});vault.audit('recording.transcribed',{id:r.id});return json(saved);
          }
        }
        if(path==='/api/retention'&&req.method==='GET') {const all=vault.list();return json({policy:policy(),items:all.filter(r=>r.type==='recording').map(r=>({id:r.id,...retentionDecision(r,all,policy())}))});}
        if(path==='/api/retention/clean'&&req.method==='POST') {
          const d=await body(req);if(d.confirm!=='清理已审核录音'||!Array.isArray(d.ids)||d.ids.length>100)throw new AppError(400,'请确认清理范围');
          const all=vault.list();const selected=d.ids.map(id=>mustGet(id,'recording'));
          if(!selected.length||selected.some(r=>!retentionDecision(r,all,policy()).eligible))throw new AppError(409,'所选资料中存在未满足清理条件的录音');
          vault.db.exec('BEGIN IMMEDIATE');try {
            for(const r of selected){vault.db.prepare('DELETE FROM audio WHERE recording=?').run(r.id);vault.put({...r,data:{...r.data,deletedAt:new Date().toISOString(),transcript:undefined,transcriptSegments:undefined}});vault.audit('recording.cleaned',{id:r.id,policy:policy()});}
            vault.db.exec('COMMIT');
          }catch(e){vault.db.exec('ROLLBACK');throw e;}
          vault.db.exec('PRAGMA wal_checkpoint(TRUNCATE)');return json({count:selected.length});
        }
        if(path==='/api/settings'&&req.method==='POST') {
          const d=await body(req,4096);if(!Number.isInteger(d.retentionDays)||d.retentionDays<7||d.retentionDays>365)throw new AppError(400,'候选期限须为 7–365 天');
          const r=vault.get('workspace');vault.update(r.id,r.version,{...r.data,retentionDays:d.retentionDays});vault.audit('retention.policy_changed',{days:d.retentionDays});return json(vault.get('workspace').data);
        }
        if(path==='/api/audit'&&req.method==='GET')return json({events:vault.auditList()});
        if(path==='/api/integrations'&&req.method==='GET')return json({model:modelStatus(config),transcribe:!!config.transcribeUrl,export:!!config.exportUrl,transcribeHost:config.transcribeUrl?new URL(config.transcribeUrl).origin:null,exportHost:config.exportUrl?new URL(config.exportUrl).origin:null});
        if(path==='/api/backup'&&req.method==='POST') {await body(req);vault.audit('backup.exported');const b=await vault.backupBytes();res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="wardnote-encrypted.db"'});return res.end(b);}
        if(path==='/api/export'&&req.method==='POST') {
          const d=await body(req);linked(d.encounterId);const records=clinicalRecords(vault.list(),d.encounterId);
          const payload={format:'wardnote/1',exportedAt:new Date().toISOString(),includesAudio:false,records};vault.audit('encounter.exported',{encounterId:d.encounterId});return json(payload);
        }
        if(path==='/api/send'&&req.method==='POST') {
          const d=await body(req);linked(d.encounterId);if(d.confirm!=='发送本次住院记录')throw new AppError(400,'请先确认发送范围');
          const records=clinicalRecords(vault.list(),d.encounterId);
          const actual=records.map(r=>`${r.id}:${r.version}`).sort();
          const expected=(d.expectedVersions||[]).map(r=>`${r.id}:${r.version}`).sort();
          if(JSON.stringify(actual)!==JSON.stringify(expected))throw new AppError(409,'预览后资料已有变化，请重新查看发送内容');
          const result=await sendExport({format:'wardnote/1',exportedAt:new Date().toISOString(),includesAudio:false,records},config);vault.audit('encounter.sent',{encounterId:d.encounterId,status:result.status});return json(result);
        }
        throw new AppError(404,'接口不存在');
      }
      if(req.method!=='GET'&&req.method!=='HEAD')throw new AppError(405,'不支持此方法');
      const allowed=['/voice-conversation.js','/project-introduction.js','/easy-start.js','/easy-start.css','/deployment-profile.js','/deployment-policy.js','/capture-storage.js','/device-readiness.js','/device-readiness-ui.js','/region-settings.js','/region-ui.js','/update-controller.css','/update-controller.js','/backup-segments.js','/continuity.js','/continuity-ui.js','/voice-routing.js','/project-info.js','/accounts.js','/patient-brief.js','/patient-brief-ui.js',...localeAssets,'/languages.js','/locale-core.js','/','/index.html','/app.js','/domain.js','/i18n.js','/translations.js','/worksheet-ui.js','/voice-evidence.js','/panel-layout.js','/offline-store.js','/offline-api.js','/offline-ui.js','/offline-sync.js','/sync-core.js','/record-validation.js','/style.css','/sw.js','/manifest.webmanifest','/icons/icon.svg','/icons/icon-192.png','/icons/icon-512.png'];
      if(!allowed.includes(path))throw new AppError(404,'页面不存在');
      const file=join(HERE,'public',path==='/'?'index.html':path.slice(1));
      res.setHeader('Content-Type',types.get(extname(file))||'application/octet-stream');if(path==='/sw.js')res.setHeader('Service-Worker-Allowed','/');
      return res.end(req.method==='HEAD'?undefined:readFileSync(file));
    } catch(e) { if(res.headersSent){res.end();return;} json({error:e.status?e.message:'操作未完成，资料未标记为成功。请检查服务日志或稍后重试。'},e.status||500);if(!e.status)console.error(`[${new Date().toISOString()}] ${e.name}: internal operation failed`); }
  }
  const server=config.tls?https.createServer({key:readFileSync(config.tls.key),cert:readFileSync(config.tls.cert)},handler):http.createServer(handler);
  server.requestTimeout=240000; server.headersTimeout=30000;
  const sweep=setInterval(()=>{for(const [t,s]of sessions)if(Date.now()-s.last>30*60000||Date.now()-s.created>12*3600000)sessions.delete(t);if(!sessions.size&&vault.key)vault.lock();},60000);sweep.unref();
  return {server,vault,handler,dispose:()=>{clearInterval(sweep);vault.close();},close:()=>new Promise(resolve=>{clearInterval(sweep);server.close(()=>{vault.close();resolve();});server.closeIdleConnections();})};
}
export function createApp(options={}) {
 const root=options.dataDir||resolve(HERE,'../data'),c=options.config||{};
 const personal=createWorkspace({...options,dataDir:root,config:{...c,...c.accountModes?.personal,accountMode:'personal'}});
 const institution=createWorkspace({...options,dataDir:join(root,'institution'),config:{...c,transcribeUrl:'',exportUrl:'',llm:{enabled:false},...c.accountModes?.institution,accountMode:'institution',authorizationDestinations:c.accountModes?.institution?.authorizationDestinations||[]}});
 const handler=(req,res)=>{if(req.url.startsWith('/api/institution/')){req.url=req.url.replace('/api/institution/','/api/');return institution.handler(req,res);}return personal.handler(req,res);};
 const server=c.tls?https.createServer({key:readFileSync(c.tls.key),cert:readFileSync(c.tls.cert)},handler):http.createServer(handler);
 server.requestTimeout=240000;server.headersTimeout=30000;
 return {server,vault:personal.vault,institutionVault:institution.vault,close:()=>new Promise(resolve=>{server.close(()=>{personal.dispose();institution.dispose();resolve();});server.closeIdleConnections();})};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const configPath=resolve(HERE,'../config.local.json');const local=existsSync(configPath)?JSON.parse(readFileSync(configPath,'utf8')):{};
  const config={...local,llm:{...local.llm,token:process.env.NOTE_LLM_TOKEN||''},transcribeUrl:process.env.NOTE_TRANSCRIBE_URL||local.transcribeUrl,transcribeToken:process.env.NOTE_TRANSCRIBE_TOKEN,transcribeModel:process.env.NOTE_TRANSCRIBE_MODEL||local.transcribeModel,exportUrl:process.env.NOTE_EXPORT_URL||local.exportUrl,exportToken:process.env.NOTE_EXPORT_TOKEN};
  const host=process.env.NOTE_HOST||local.host||'127.0.0.1',port=Number(process.env.NOTE_PORT||local.port||8787);
  if(!['127.0.0.1','localhost','::1'].includes(host)&&(!config.tls||!config.publicOrigin))throw new Error('LAN deployment requires TLS and publicOrigin in config.local.json');
  const app=createApp({dataDir:process.env.NOTE_DATA_DIR||resolve(HERE,'../data'),config});
  app.server.listen(port,host,()=>console.log(`WardNote ${VERSION}: ${config.publicOrigin||`http://${host}:${port}`}\nData: ${app.vault.dir}\nStop: Ctrl+C`));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
}

