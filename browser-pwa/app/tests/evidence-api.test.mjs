// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtempSync,mkdirSync,rmSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {createApp} from '../server.mjs';
import {blankNote} from '../public/domain.js';

test('ASR API persists optional segments; invalid responses preserve prior transcript and encrypted original',async()=>{
 let invalid=false;const mock=http.createServer(async(req,res)=>{for await(const ignored of req){}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({text:'No pain.',segments:[{text:invalid?'Invented words':'No pain.',start:1,end:3,speaker:'A'}]}));});await new Promise(r=>mock.listen(0,'127.0.0.1',r));
 const root=resolve(import.meta.dirname,'../../work');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'evidence-api-'));const app=createApp({dataDir:dir,config:{transcribeUrl:`http://127.0.0.1:${mock.address().port}/transcribe`}});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;let csrf='',cookie='';
 const post=async(path,data)=>{const res=await fetch(base+'/api'+path,{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-CSRF-Token':csrf,Cookie:cookie},body:JSON.stringify(data)});return {res,data:await res.json()};};
 try{
  const setup=await post('/setup',{password:'fictional-evidence-password',clinician:'Fixture'});csrf=setup.data.csrf;cookie=setup.res.headers.get('set-cookie').split(';')[0];const e=app.vault.create('encounter','',{displayName:'Fixture',admitted:'2026-10-16'});
  let r=app.vault.create('recording',e.id,{mime:'audio/wav',finalized:false,consent:'Fixture'});const audio=Buffer.from('SYNTHETIC_AUDIO_NOT_PATIENT_DATA');app.vault.addChunk(r.id,0,audio);r=app.vault.update(r.id,r.version,{...r.data,finalized:true,duration:5,bytes:audio.length});
  const good=await post('/recordings/'+r.id+'/transcribe',{language:'en'});assert.equal(good.res.status,200);assert.equal(good.data.data.transcript,'No pain.');assert.equal(good.data.data.transcriptSegments[0].start,1);assert.equal(good.data.data.transcriptSegments[0].charStart,0);
  invalid=true;const bad=await post('/recordings/'+r.id+'/transcribe',{language:'en'});assert.equal(bad.res.status,502);assert.equal(app.vault.get(r.id).version,good.data.version);assert.equal(app.vault.get(r.id).data.transcript,'No pain.');assert.deepEqual(app.vault.audioBytes(r.id),audio);
  const n=app.vault.create('note',e.id,blankNote()),draft=app.vault.create('voiceDraft',e.id,{text:'No pain.',language:'original',noteId:n.id,sourceId:r.id,sourceVersion:good.data.version,proposals:[{section:'course',text:'Pain present',quotes:['Pain present'],use:true}],candidateSource:{text:'No pain.',language:'original',noteId:n.id}});
  const rejected=await post('/voice-apply',{draftId:draft.id,draftVersion:draft.version,noteId:n.id,noteVersion:n.version});assert.equal(rejected.res.status,400);assert.match(rejected.data.error,/原文依据/);assert.equal(app.vault.get(n.id).version,n.version);assert.equal(app.vault.get(draft.id).version,draft.version);
 }finally{await app.close();await new Promise(r=>mock.close(r));const rel=relative(root,dir);assert.ok(rel&&!rel.startsWith('..'+sep)&&rel!=='..');rmSync(dir,{recursive:true,force:true});}
});
