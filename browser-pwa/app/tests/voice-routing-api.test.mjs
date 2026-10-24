import test from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';
import {createApp} from '../server.mjs';import {routeCandidates,routingSnapshot} from '../public/voice-routing.js';
test('server applies reviewed routes atomically; stale retries and missing lab details leave all destinations unchanged',async()=>{
 const root=resolve(import.meta.dirname,'../../work');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'routing-api-')),app=createApp({dataDir:dir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;let cookie='',csrf='';
 const post=async(path,data)=>{const res=await fetch(base+'/api'+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:JSON.stringify(data)});return {status:res.status,data:await res.json()};};
 try{
  const setup=await post('/setup',{password:'fictional-route-password',clinician:'Synthetic'});assert.equal(setup.status,200);
  // Setup response cookies are captured with a normal login for the public HTTP path.
  const login=await fetch(base+'/api/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({password:'fictional-route-password'})});csrf=(await login.json()).csrf;cookie=login.headers.get('set-cookie').split(';')[0];
  const e=app.vault.create('encounter','',{displayName:'Synthetic',admitted:'2026-10-18'});
  const draft=text=>app.vault.create('voiceDraft',e.id,{text,language:'original',noteId:'',proposals:routeCandidates(text).map(p=>({...p,use:true})),candidateSource:{...routingSnapshot(app.vault.list(),e.id,'','2026-10-18'),text,language:'original',sourceId:null,sourceVersion:null}});
  const d=draft('备忘：原文。病程：无胸痛。待办：联系主管');const payload={draftId:d.id,draftVersion:d.version,labelLanguage:'en'};const good=await post('/voice-route-apply',payload);assert.equal(good.status,200);assert.equal(good.data.records.length,3);assert.equal(good.data.draft.data.proposals.length,0);assert.equal(good.data.records.find(r=>r.type==='memo').data.voiceReview.clinician,'Synthetic');
  const saved=JSON.stringify(app.vault.list());const retry=await post('/voice-route-apply',payload);assert.equal(retry.status,409);assert.equal(JSON.stringify(app.vault.list()),saved);
  const missing=draft('备忘：不应保存。检验项目：肌酐。检验结果：1.2');const before=JSON.stringify(app.vault.list());const rejected=await post('/voice-route-apply',{draftId:missing.id,draftVersion:missing.version});assert.equal(rejected.status,400);assert.match(rejected.data.error,/检验需要/);assert.equal(JSON.stringify(app.vault.list()),before);
  const stale=draft('备忘：不应部分保存。病程：应拒绝');const note=app.vault.list().find(r=>r.type==='note');app.vault.update(note.id,note.version,{...note.data,fields:{course:'Another change'}});const beforeStale=JSON.stringify(app.vault.list());assert.equal((await post('/voice-route-apply',{draftId:stale.id,draftVersion:stale.version})).status,409);assert.equal(JSON.stringify(app.vault.list()),beforeStale);
 }finally{await app.close();assert.ok(dir.startsWith(root+'\\')||dir.startsWith(root+'/'));rmSync(dir,{recursive:true,force:true});}
});
