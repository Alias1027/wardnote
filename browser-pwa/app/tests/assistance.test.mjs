// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createApp} from '../server.mjs';
import {modelDraft,modelStatus} from '../lib/model-service.mjs';
import {blankNote,clinicalRecords} from '../public/domain.js';
import {LANGUAGES} from '../public/languages.js';

test('disabled text adapters do not call a service; status excludes credentials',async()=>{
 await assert.rejects(modelDraft({text:'fictional'},{}),/尚未启用/);
 const status=modelStatus({llm:{provider:'openai',model:'configured-model',token:'PRIVATE_TEST_TOKEN'}});
 assert.equal(status.enabled,false);assert.ok(!JSON.stringify(status).includes('PRIVATE_TEST_TOKEN'));
});
test('compatible adapters constrain responses, preserve the source, and reject invalid or truncated output',async()=>{
 let requestBody,mode='valid';
 const service=http.createServer(async(req,res)=>{let body='';for await(const c of req)body+=c;requestBody=JSON.parse(body);res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:mode==='truncated'?'length':'stop',message:{content:JSON.stringify(mode==='invalid'?{proposals:[{section:'diagnosis-injection',text:'bad'}]}:{proposals:[{section:'course',text:'No chest pain; onset uncertain.',quotes:[requestBody.messages[1].content]}]})}}]}));});
 await new Promise(r=>service.listen(0,'127.0.0.1',r));
 try{for(const provider of ['openai','deepseek','doubao','qwen','custom']){
 const config={llm:{enabled:true,provider,baseUrl:`http://127.0.0.1:${service.address().port}/v1`,model:'test-model'}};
 const result=await modelDraft({text:'患者否认胸痛；起病时间待核实。',language:'en'},config);
 assert.equal(requestBody.messages[1].content,'患者否认胸痛；起病时间待核实。');assert.equal(result.proposals[0].use,false);assert.equal(result.provenance.language,'en');assert.equal(result.provenance.provider,provider);
 for(const [language,metadata] of Object.entries(LANGUAGES)){
  const candidate=await modelDraft({text:'No pain; 1.2 mg/dL. 起病待核实。',language},config);
  assert.ok(requestBody.messages[0].content.includes(metadata.model));assert.equal(requestBody.messages[1].content,'No pain; 1.2 mg/dL. 起病待核实。');assert.equal(candidate.provenance.language,language);assert.equal(candidate.proposals[0].use,false);
 }
 mode='invalid';await assert.rejects(modelDraft({text:'fictional'},config),/格式无效/);mode='truncated';await assert.rejects(modelDraft({text:'fictional'},config),/格式无效/);mode='valid';
 }}finally{await new Promise(r=>service.close(r));}
});
test('voice insertion is patient-scoped, versioned, atomic and cannot be repeated; private drafts stay out of clinical exports',async()=>{
 const root=resolve(import.meta.dirname,'../../work');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'assistance-test-')),app=createApp({dataDir:dir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;let cookie='',csrf='';
 const req=async(path,data)=>{const res=await fetch(base+'/api'+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:JSON.stringify(data)});return {res,data:await res.json()};};
 try{const setup=await req('/setup',{password:'fictional-test-password',clinician:'Fixture'});csrf=setup.data.csrf;cookie=setup.res.headers.get('set-cookie').split(';')[0];
 const e=app.vault.create('encounter','',{displayName:'Fixture',admitted:'2026-10-01',acuity:'serious'}),other=app.vault.create('encounter','',{displayName:'Other',admitted:'2026-10-01'});
 const n=app.vault.create('note',e.id,{...blankNote(),fields:{course:'Existing text'},review:{clinician:'old'}}),otherNote=app.vault.create('note',other.id,blankNote());
 let d=app.vault.create('voiceDraft',e.id,{text:'No chest pain',language:'en',noteId:n.id,proposals:[{section:'course',text:'No chest pain',use:true}],candidateSource:{text:'No chest pain',language:'en',noteId:n.id},provenance:{language:'en',provider:'custom'}});
 let result=await req('/voice-apply',{draftId:d.id,draftVersion:d.version,noteId:otherNote.id,noteVersion:otherNote.version});assert.equal(result.res.status,400);assert.equal(app.vault.get(n.id).version,1);
 const payload={draftId:d.id,draftVersion:d.version,noteId:n.id,noteVersion:n.version};result=await req('/voice-apply',payload);assert.equal(result.res.status,200);assert.equal(result.data.note.data.fields.course,'Existing text\nNo chest pain');assert.equal(result.data.note.data.review,null);assert.deepEqual(result.data.draft.data.proposals,[]);
 assert.equal((await req('/voice-apply',payload)).res.status,409);assert.equal(app.vault.get(n.id).data.fields.course,'Existing text\nNo chest pain');assert.ok(!clinicalRecords(app.vault.list(),e.id).some(r=>r.type==='voiceDraft'));
 assert.equal((await req('/model-draft',{encounterId:e.id,text:'fixture'})).res.status,400);assert.equal((await req('/model-draft',{encounterId:e.id,text:'fixture',confirmed:true})).res.status,503);
 const summary=await req('/summaries',{encounterId:e.id,language:'original'});assert.equal(summary.res.status,201);assert.equal(summary.data.data.language,'original');assert.equal(summary.data.data.review,null);
 }finally{await app.close();const absolute=resolve(dir);assert.ok(absolute.startsWith(root+'\\')||absolute.startsWith(root+'/'));rmSync(absolute,{recursive:true,force:true});}
});
