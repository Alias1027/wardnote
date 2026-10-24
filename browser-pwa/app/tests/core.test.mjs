import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,readFileSync,readdirSync,rmSync,mkdirSync,writeFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import http from 'node:http';
import {createApp} from '../server.mjs';
import {classify,composeSummary,retentionDecision,sourcesChanged,blankNote,pendingReviews} from '../public/domain.js';
import {endpoint} from '../lib/integrations.mjs';
import {Vault} from '../lib/vault.mjs';
let app,base,dir,cookie,csrf,patient,note,recording,receiver,received=0,receiverBodies=[];
const root=resolve(import.meta.dirname,'../../work');
async function request(path,method='GET',data,opts={}){
 const headers={Origin:base,...(cookie?{Cookie:cookie}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...opts.headers};
 if(opts.noOrigin)delete headers.Origin;
 if(opts.noAuth){delete headers.Cookie;delete headers['X-CSRF-Token'];}
 if(data&&!opts.raw)headers['Content-Type']='application/json';
 const res=await fetch(base+'/api'+path,{method,headers,body:data?opts.raw?data:JSON.stringify(data):undefined});
 const value=res.headers.get('content-type')?.includes('json')?await res.json():Buffer.from(await res.arrayBuffer());
 return {res,value};
}
before(async()=>{
 mkdirSync(root,{recursive:true});dir=mkdtempSync(join(root,'test-'));
 receiver=http.createServer(async(req,res)=>{let size=0;const chunks=[];for await(const c of req){size+=c.length;chunks.push(c);}received+=size;receiverBodies.push(Buffer.concat(chunks).toString());res.setHeader('Content-Type','application/json');res.end(JSON.stringify(req.url==='/asr'?{text:'患者诉：夜间咳嗽。\n查体：待医生填写。'}:{accepted:true}));});
 await new Promise(r=>receiver.listen(0,'127.0.0.1',r));const address=`http://127.0.0.1:${receiver.address().port}`;
 app=createApp({dataDir:dir,config:{transcribeUrl:address+'/asr',exportUrl:address+'/receive'}});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${app.server.address().port}`;
});
after(async()=>{await app.close();await new Promise(r=>receiver.close(r));const target=resolve(dir);assert.ok(target.startsWith(root+'\\')||target.startsWith(root+'/'));rmSync(target,{recursive:true,force:true});});
test('new vault requires setup; unauthenticated records are denied',async()=>{
 assert.equal((await request('/status')).value.initialized,false);assert.equal((await request('/records')).res.status,401);
});
test('setup blocks absent and foreign origins',async()=>{
 assert.equal((await request('/setup','POST',{password:'test-password-123',clinician:'测试医生'},{noOrigin:true})).res.status,403);
 assert.equal((await request('/setup','POST',{password:'test-password-123',clinician:'测试医生'},{headers:{Origin:'https://foreign.test'}})).res.status,403);
});
test('setup rejects short password and creates secure session',async()=>{
 assert.equal((await request('/setup','POST',{password:'short',clinician:'测试'})).res.status,400);
 const {res,value}=await request('/setup','POST',{password:'test-password-123',clinician:'测试医生'});
 assert.equal(res.status,200);assert.match(res.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);cookie=res.headers.get('set-cookie').split(';')[0];csrf=value.csrf;
});
test('CSRF and invalid patient records are rejected',async()=>{
 assert.equal((await request('/records','POST',{}, {headers:{'X-CSRF-Token':'wrong'}})).res.status,403);
 assert.equal((await request('/records','POST',{type:'encounter',data:{}})).res.status,400);
});
test('patient and note persist with encrypted payloads',async()=>{
 patient=(await request('/records','POST',{type:'encounter',data:{displayName:'PRIVATE_PATIENT_CANARY_829104',admitted:'2026-10-01',caseId:'ENC-001'}})).value;
 assert.ok(patient.id);note=(await request('/records','POST',{type:'note',encounterId:patient.id,data:{...blankNote(),fields:{course:'Private clinical history'}}})).value;
 for(const f of readdirSync(dir).filter(f=>f.startsWith('wardnote.db'))){const b=readFileSync(join(dir,f));assert.equal(b.includes(Buffer.from('PRIVATE_PATIENT_CANARY_829104')),false);assert.equal(b.includes(Buffer.from('Private clinical history')),false);}
});
test('optimistic conflict never overwrites a newer note',async()=>{
 const a=await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,fields:{course:'new text'}}});assert.equal(a.res.status,200);
 const b=await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,fields:{course:'stale'}}});assert.equal(b.res.status,409);note=a.value;
 assert.equal(app.vault.get(note.id).data.fields.course,'new text');
});
test('previous clinical revisions remain encrypted and readable after login',async()=>{
 const history=(await request(`/records/${note.id}/history`)).value.revisions;assert.equal(history.length,1);assert.equal(history[0].data.fields.course,'Private clinical history');
});
test('review cannot be forged via generic update and editing cancels it',async()=>{
 note=(await request(`/records/${note.id}/verify`,'POST',{version:note.version})).value;assert.ok(note.data.review);
 note=(await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,review:{clinician:'forged'},fields:{course:'changed'}}})).value;assert.equal(note.data.review,null);
});
test('cross-encounter sources and patient review are denied',async()=>{
 const p2=(await request('/records','POST',{type:'encounter',data:{displayName:'second',admitted:'2026-10-01'}})).value;
 const foreign=(await request('/records','POST',{type:'note',encounterId:p2.id,data:blankNote()})).value;
 assert.equal((await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,sources:[{id:foreign.id,version:foreign.version}]}})).res.status,400);
 const summary=(await request('/summaries','POST',{encounterId:patient.id})).value;
 assert.equal((await request('/records','POST',{type:'review',encounterId:p2.id,data:{summaryId:summary.id,summaryVersion:summary.version,status:'confirmed',scope:'症状',participant:'患者'}})).res.status,409);
});
test('lab requires timestamp, units, and actual source',async()=>{
 assert.equal((await request('/records','POST',{type:'lab',encounterId:patient.id,data:{name:'Cr',value:'1.2'}})).res.status,400);
 assert.equal((await request('/records','POST',{type:'lab',encounterId:patient.id,data:{name:'Cr',value:'1.2',unit:'mg/dL',sampledAt:'2026-10-01T08:00',date:'2026-10-01',source:'test-report',verified:true}})).res.status,201);
});
test('classification keeps negation, uncertainty and unmatched text intact',()=>{
 const proposals=classify('患者诉：无胸痛，不能确定开始时间。\n随机内容 123\n药物：可能服用过。');assert.equal(proposals[0].section,'course');assert.match(proposals[0].text,/无胸痛/);assert.equal(proposals[1].section,'continuation');assert.match(proposals[2].text,/可能/);
});
test('summary carries source versions and detects later changes',async()=>{
 let s=(await request('/summaries','POST',{encounterId:patient.id})).value;assert.ok(s.data.sources.some(x=>x.id===note.id));
 s=(await request(`/records/${s.id}/verify`,'POST',{version:s.version})).value;assert.ok(s.data.review);
 note=(await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,fields:{course:'subsequent update'}}})).value;
 assert.ok(sourcesChanged(s,app.vault.list()));assert.equal((await request(`/records/${s.id}/verify`,'POST',{version:s.version})).res.status,409);
});

test('summary separates dated narrative from all current tasks and preserves next steps without cross-encounter data',()=>{
 const e={id:'scope-a',version:1,data:{displayName:'Synthetic',admitted:'2026-10-01'}};
 const make=(id,date,done=false,extra={})=>({id,type:'task',encounterId:e.id,version:1,createdAt:date+'T00:00:00.000Z',data:{date,title:id,done,owner:'Owner',due:'2026-10-20T08:00',next:'CONTACT_'+id,...extra}});
 const rows=[make('early','2026-10-01'),make('later','2026-10-15',false,{kind:'result'}),make('in-range-done','2026-10-10',true),make('old-done','2026-10-01',true),make('deleted','2026-10-01',false,{deletedAt:'2026-10-02'}),{...make('foreign','2026-10-10'),encounterId:'scope-b'}];
 const original=JSON.stringify(rows),s=composeSummary(e,rows,'2026-10-09','2026-10-11','en');
 const [narrative,current]=s.text.split('【Current outstanding tasks】');
 assert.ok(narrative.includes('CONTACT_in-range-done'));assert.ok(!narrative.includes('CONTACT_early'));
 for(const id of ['early','later'])assert.ok(current.includes('CONTACT_'+id));
 for(const id of ['old-done','deleted','foreign'])assert.ok(!s.text.includes('CONTACT_'+id));
 assert.ok(current.includes('Pending result'));assert.ok(current.includes('Owner'));assert.ok(current.includes('2026-10-20T08:00'));
 assert.equal(s.from,'2026-10-09');assert.equal(s.to,'2026-10-11');assert.equal(s.review,null);assert.match(s.pendingTaskSnapshot.asOf,/Z$/);
 assert.deepEqual(s.pendingTaskSnapshot.ids,['early','later']);assert.equal(new Set(s.sources.map(r=>r.id)).size,s.sources.length);assert.equal(JSON.stringify(rows),original);
});

test('new pending work invalidates a current snapshot but not a stored legacy summary',()=>{
 const e={id:'a',version:1,data:{displayName:'Fixture',admitted:'2026-10-01'}};
 const data=composeSummary(e,[],'2026-10-01','2026-10-02','en');
 const added={id:'pending',type:'task',encounterId:'a',version:1,data:{done:false}};
 assert.equal(sourcesChanged({data},[e]),false);
 assert.equal(sourcesChanged({data},[e,added]),true);
 assert.equal(sourcesChanged({data},[e,{...added,encounterId:'b'}]),false);
 assert.equal(sourcesChanged({data},[e,{...added,data:{done:true}}]),false);
 assert.equal(sourcesChanged({data:{sources:data.sources,text:'Legacy original'}},[e,added]),false);
});

test('API protects task snapshot provenance and requires regeneration after task changes',async()=>{
 const e=(await request('/records','POST',{type:'encounter',data:{displayName:'Handoff fixture',admitted:'2026-10-01'}})).value;
 let task=(await request('/records','POST',{type:'task',encounterId:e.id,data:{date:'2026-10-01',title:'Carry forward',done:false,next:'ESCALATION_CONTACT'}})).value;
 let s=(await request('/summaries','POST',{encounterId:e.id,from:'2026-10-09',to:'2026-10-11',labelLanguage:'en'})).value;
 assert.ok(s.data.text.includes('ESCALATION_CONTACT'));assert.ok(s.data.sources.some(r=>r.id===task.id));
 const savedText=s.data.text,snapshot=s.data.pendingTaskSnapshot;
 s=(await request(`/records/${s.id}`,'PUT',{version:s.version,data:{...s.data,pendingTaskSnapshot:{ids:[],encounterId:'other'},sources:[]}})).value;
 assert.deepEqual(s.data.pendingTaskSnapshot,snapshot);assert.ok(s.data.sources.some(r=>r.id===task.id));
 s=(await request(`/records/${s.id}/verify`,'POST',{version:s.version})).value;assert.ok(s.data.review);
 task=(await request(`/records/${task.id}`,'PUT',{version:task.version,data:{...task.data,done:true,next:'FOLLOWUP_COMPLETED'}})).value;
 assert.equal((await request(`/records/${s.id}/verify`,'POST',{version:s.version})).res.status,409);assert.equal(app.vault.get(s.id).data.text,savedText);
 let newer=(await request('/summaries','POST',{encounterId:e.id,from:'2026-10-09',to:'2026-10-11'})).value;
 await request('/records','POST',{type:'task',encounterId:e.id,data:{title:'New follow-up',done:false}});
 assert.equal((await request(`/records/${newer.id}/verify`,'POST',{version:newer.version})).res.status,409);
});
test('patient participation records a scoped response, not professional approval',async()=>{
 let s=(await request('/summaries','POST',{encounterId:patient.id})).value;s=(await request(`/records/${s.id}/verify`,'POST',{version:s.version})).value;
 const reviewed=await request('/records','POST',{type:'review',encounterId:patient.id,data:{summaryId:s.id,summaryVersion:s.version,status:'corrections',participant:'测试患者',scope:'症状出现时间',feedback:'希望更正日期'}});assert.equal(reviewed.res.status,201);
 assert.equal((await request(`/records/${reviewed.value.id}`,'PUT',{version:1,data:{status:'confirmed'}})).res.status,400);
 const resolved=await request('/records','POST',{type:'resolution',encounterId:patient.id,data:{reviewId:reviewed.value.id,action:'已核对原始资料，记录了修正及沟通结果'}});assert.equal(resolved.res.status,201);
});
test('recording requires documented consent and supported audio type',async()=>{
 assert.equal((await request('/recordings','POST',{encounterId:patient.id,mime:'audio/wav'})).res.status,400);
 assert.equal((await request('/recordings','POST',{encounterId:patient.id,mime:'text/html',consent:'test'})).res.status,400);
 recording=(await request('/recordings','POST',{encounterId:patient.id,mime:'audio/wav',consent:'synthetic fixture only',title:'Synthetic audio'})).value;assert.ok(recording.id);
});
test('chunk writes are idempotent and incomplete recording cannot finalize',async()=>{
 const path=`/recordings/${recording.id}/chunks/0`;assert.equal((await request(path,'PUT',Buffer.from('RIFF-FAKE-TEST'),{raw:true})).res.status,200);
 assert.equal((await request(path,'PUT',Buffer.from('RIFF-FAKE-TEST'),{raw:true})).res.status,200);
 assert.equal((await request(path,'PUT',Buffer.from('DIFFERENT'),{raw:true})).res.status,409);
 assert.equal((await request(`/recordings/${recording.id}/finalize`,'POST',{chunks:2,duration:10})).res.status,409);
 recording=(await request(`/recordings/${recording.id}/finalize`,'POST',{chunks:1,duration:10})).value;assert.ok(recording.data.finalized);
 assert.equal((await request(`/recordings/${recording.id}/audio`)).value.toString(),'RIFF-FAKE-TEST');
});
test('original audio bytes do not occur in SQLite disk files',()=>{
 for(const f of readdirSync(dir).filter(f=>f.startsWith('wardnote.db')))assert.equal(readFileSync(join(dir,f)).includes(Buffer.from('RIFF-FAKE-TEST')),false);
});
test('configured ASR adapter submits audio and preserves returned raw text',async()=>{
 recording=(await request(`/recordings/${recording.id}/transcribe`,'POST',{})).value;assert.match(recording.data.transcript,/夜间咳嗽/);assert.ok(received>0);
});
test('important, held, unreviewed and young audio never qualifies for cleanup',()=>{
 for(const patch of [{important:true},{hold:true},{audioReviewed:false},{finalized:false}]){
 const r={...recording,createdAt:'2020-01-01',data:{...recording.data,audioReviewed:true,noFurtherNeed:true,...patch}};
 assert.equal(retentionDecision(r,[],{days:14}).eligible,false);}
 assert.equal(retentionDecision(recording,[],{days:14}).eligible,false);
});
test('backend rechecks cleanup eligibility despite a client confirmation',async()=>{
 assert.equal((await request('/retention/clean','POST',{ids:[recording.id],confirm:'清理已审核录音'})).res.status,409);
 assert.equal((await request(`/recordings/${recording.id}/audio`)).res.status,200);
});
test('eligible fixture can be cleaned while summary and metadata stay available',async()=>{
 recording=(await request(`/recordings/${recording.id}/metadata`,'POST',{version:recording.version,audioReviewed:true,noFurtherNeed:true})).value;
 app.vault.db.prepare('UPDATE records SET created=? WHERE id=?').run('2020-01-01T00:00:00.000Z',recording.id);recording=app.vault.get(recording.id);
 note=(await request(`/records/${note.id}`,'PUT',{version:note.version,data:{...note.data,sources:[{id:recording.id,version:recording.version}]}})).value;
 note=(await request(`/records/${note.id}/verify`,'POST',{version:note.version})).value;
 let s=(await request('/summaries','POST',{encounterId:patient.id,from:'2019-01-01',to:'2099-01-01'})).value;s=(await request(`/records/${s.id}/verify`,'POST',{version:s.version})).value;
 assert.equal(retentionDecision(recording,app.vault.list(),{days:14}).eligible,true);
 const disputed={id:'temporary-review-fixture',type:'review',encounterId:patient.id,data:{status:'corrections'}};
 assert.match(retentionDecision(recording,[...app.vault.list(),disputed],{days:14}).reason,/核对意见/);
 assert.equal((await request('/retention/clean','POST',{ids:[recording.id],confirm:'清理已审核录音'})).value.count,1);
 assert.equal((await request(`/recordings/${recording.id}/audio`)).res.status,410);assert.equal(app.vault.get(recording.id).data.transcript,undefined);assert.ok(app.vault.get(s.id).data.text);assert.equal(sourcesChanged(app.vault.get(s.id),app.vault.list()),false);
});
test('JSON export is scoped and excludes actual audio bytes',async()=>{
 const r=(await request('/export','POST',{encounterId:patient.id})).value;assert.equal(r.includesAudio,false);assert.ok(r.records.every(x=>x.id===patient.id||x.encounterId===patient.id));assert.equal(JSON.stringify(r).includes('RIFF-FAKE-TEST'),false);
});
test('send requires explicit confirmation and uses configured receiver only',async()=>{
 assert.equal((await request('/send','POST',{encounterId:patient.id})).res.status,400);
 assert.equal((await request('/send','POST',{encounterId:patient.id,confirm:'发送本次住院记录'})).res.status,409);
 const exported=(await request('/export','POST',{encounterId:patient.id})).value;
 assert.equal((await request('/send','POST',{encounterId:patient.id,confirm:'发送本次住院记录',expectedVersions:exported.records.map(r=>({id:r.id,version:r.version}))})).res.status,200);
});
test('encrypted consistent backup opens with the same password',async()=>{
 const r=await request('/backup','POST',{});assert.equal(r.value.subarray(0,15).toString(),'SQLite format 3');assert.equal(r.value.includes(Buffer.from('PRIVATE_PATIENT_CANARY_829104')),false);
 const restoreDir=join(dir,'restore');mkdirSync(restoreDir);writeFileSync(join(restoreDir,'wardnote.db'),r.value);const restored=new Vault(restoreDir);try{restored.unlock('test-password-123');assert.equal(restored.get(patient.id).data.displayName,'PRIVATE_PATIENT_CANARY_829104');assert.ok(restored.auditList().some(e=>e.action==='recording.cleaned'));}finally{restored.close();}
 assert.ok((await request('/audit')).value.events.some(x=>x.action==='recording.cleaned'));
});
test('integration URL policy rejects remote plaintext and embedded credentials',()=>{
 assert.throws(()=>endpoint('http://192.168.1.1/asr'));assert.throws(()=>endpoint('https://user:pass@host.example/asr'));assert.equal(endpoint('https://hospital.example/asr'),'https://hospital.example/asr');
});
test('logout prevents API access; wrong password cannot unlock',async()=>{
 await request('/logout','POST',{});assert.equal((await request('/records')).res.status,401);assert.equal((await request('/login','POST',{password:'incorrect'})).res.status,401);
 const r=await request('/login','POST',{password:'test-password-123'});assert.equal(r.res.status,200);cookie=r.res.headers.get('set-cookie').split(';')[0];csrf=r.value.csrf;assert.ok((await request('/records')).value.records.length>0);
});

test('reflections require a valid encounter when linked, while legacy entries remain readable',async()=>{
 assert.equal((await request('/records','POST',{type:'reflection',encounterId:'missing-encounter',data:{title:'Invalid link'}})).res.status,404);
 const legacy=(await request('/records','POST',{type:'reflection',data:{title:'Legacy learning',reason:'LEARNING_ONLY_CANARY'}})).value;
 assert.equal(legacy.encounterId,'');
 const current=(await request('/records','POST',{type:'reflection',encounterId:patient.id,data:{title:'Linked learning',reason:'LEARNING_ONLY_CANARY'}})).value;
 assert.equal(current.encounterId,patient.id);
});
test('manual legacy reflection linking preserves history, checks versions and prevents reassignment',async()=>{
 const legacy=app.vault.list().find(r=>r.type==='reflection'&&!r.encounterId);
 assert.equal((await request(`/records/${legacy.id}/link`,'POST',{version:legacy.version+1,encounterId:patient.id})).res.status,409);
 assert.equal((await request(`/records/${legacy.id}/link`,'POST',{version:legacy.version,encounterId:'missing'})).res.status,404);
 const linked=(await request(`/records/${legacy.id}/link`,'POST',{version:legacy.version,encounterId:patient.id})).value;
 assert.equal(linked.id,legacy.id);assert.equal(linked.version,legacy.version+1);assert.equal(app.vault.get(legacy.id).encounterId,patient.id);
 const history=(await request(`/records/${legacy.id}/history`)).value.revisions;
 assert.ok(history.some(r=>r.encounterId===''&&r.version===legacy.version));
 assert.equal((await request(`/records/${legacy.id}/link`,'POST',{version:linked.version,encounterId:patient.id})).res.status,409);
 assert.equal((await request(`/records/${note.id}/link`,'POST',{version:note.version,encounterId:patient.id})).res.status,404);
});
test('clinical export, hospital send and summary exclude linked teaching notes',async()=>{
 const exported=(await request('/export','POST',{encounterId:patient.id})).value;
 assert.ok(exported.records.length>1);assert.ok(exported.records.every(r=>r.type!=='reflection'));
 assert.ok(!JSON.stringify(exported).includes('LEARNING_ONLY_CANARY'));
 assert.equal((await request('/send','POST',{encounterId:patient.id,confirm:'发送本次住院记录',expectedVersions:exported.records.map(r=>({id:r.id,version:r.version}))})).res.status,200);
 assert.ok(!receiverBodies.at(-1).includes('LEARNING_ONLY_CANARY'));
 const summary=(await request('/summaries','POST',{encounterId:patient.id})).value;
 assert.ok(!summary.data.text.includes('LEARNING_ONLY_CANARY'));
 assert.ok(summary.data.sources.every(s=>app.vault.get(s.id).type!=='reflection'));
});
test('patient review queues include stale summaries and unresolved feedback without leaking other encounters',()=>{
 const rows=[
  {id:'a',type:'encounter',version:2,data:{}},
  {id:'n-a',encounterId:'a',type:'note',data:{review:null}},
  {id:'n-b',encounterId:'b',type:'note',data:{review:null}},
  {id:'s-a',encounterId:'a',type:'summary',data:{review:{},sources:[{id:'a',version:1}]}},
  {id:'r-a',encounterId:'a',type:'review',data:{status:'corrections'}},
  {id:'x-b',encounterId:'b',type:'resolution',data:{reviewId:'r-a'}}
 ];
 assert.deepEqual(pendingReviews(rows,'a').map(r=>r.id),['n-a','s-a','r-a']);
 assert.equal(pendingReviews(rows).length,4);
 assert.deepEqual(pendingReviews([...rows,{id:'x-a',encounterId:'a',type:'resolution',data:{reviewId:'r-a'}}],'a').map(r=>r.id),['n-a','s-a']);
});

test('background initialization is retry-safe and isolated by encounter',async()=>{
 const p=(await request('/records','POST',{type:'encounter',data:{displayName:'Background fixture',admitted:'2026-10-01'}})).value;
 const pair=await Promise.all([request('/background','POST',{encounterId:p.id}),request('/background','POST',{encounterId:p.id})]);
 assert.deepEqual(pair.map(x=>x.res.status).sort(),[200,201]);assert.equal(pair[0].value.id,pair[1].value.id);
 const r=pair[0].value;const updated=(await request(`/records/${r.id}`,'PUT',{version:r.version,data:{fields:{pmh:'KEEP_BACKGROUND'}}})).value;
 const retry=(await request('/background','POST',{encounterId:p.id})).value;assert.equal(retry.version,updated.version);assert.equal(retry.data.fields.pmh,'KEEP_BACKGROUND');
 const other=(await request('/background','POST',{encounterId:patient.id})).value;assert.notEqual(other.id,r.id);assert.equal(other.encounterId,patient.id);
 assert.equal((await request('/background','POST',{encounterId:'missing'})).res.status,404);
 assert.equal((await request('/background','POST',{encounterId:p.id},{headers:{'X-CSRF-Token':'wrong'}})).res.status,403);
 assert.equal(app.vault.list().filter(x=>x.type==='background'&&x.encounterId===p.id).length,1);
});
