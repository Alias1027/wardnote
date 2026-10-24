// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {createApp} from '../server.mjs';
import {blankNote} from '../public/domain.js';
let app,base,cookie,csrf,e,n,h,dir;
const root=resolve(import.meta.dirname,'../../work');
async function request(path,method='GET',data){const res=await fetch(base+'/api'+path,{method,headers:{Origin:base,...(cookie?{Cookie:cookie,'X-CSRF-Token':csrf}:{}),'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});return {status:res.status,value:await res.json()};}
before(async()=>{mkdirSync(root,{recursive:true});dir=mkdtempSync(join(root,'continuity-api-'));app=createApp({dataDir:dir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;const setup=await fetch(base+'/api/setup',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({clinician:'Synthetic reviewer',password:'synthetic-continuity-password'})});cookie=setup.headers.get('set-cookie').split(';')[0];csrf=(await setup.json()).csrf;e=(await request('/records','POST',{type:'encounter',data:{displayName:'Synthetic',admitted:'2026-10-18'}})).value;n=(await request('/records','POST',{type:'note',encounterId:e.id,data:{...blankNote(),fields:{course:'No pain; not confirmed.'}}})).value;});
after(async()=>{await app?.close();const rel=relative(root,dir);if(!rel||rel.startsWith('..'+sep))throw Error('Unsafe cleanup');rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:200});});
test('server generates local SBAR and rejects model language requests',async()=>{
 const res=await request('/summaries','POST',{encounterId:e.id,format:'sbar',labelLanguage:'en',language:'original'});assert.equal(res.status,201);h=res.value;assert.equal(h.data.format,'wardnote-sbar/1');assert.equal(h.data.review,null);assert.ok(h.data.text.includes('No pain; not confirmed.'));assert.equal((await request('/summaries','POST',{encounterId:e.id,format:'sbar',language:'fr',confirmed:true})).status,400);assert.equal((await request('/summaries','POST',{encounterId:'missing',format:'sbar'})).status,404);
});
test('review, edits, provenance protection and revision history share existing summary handling',async()=>{
 h=(await request('/records/'+h.id+'/verify','POST',{version:h.version})).value;assert.ok(h.data.review.time);
 const sources=h.data.sources,snapshot=h.data.handoffSnapshot;const res=await request('/records/'+h.id,'PUT',{version:h.version,data:{text:'Manually revised, still uncertain',format:'other',sources:[],handoffSnapshot:{},review:{clinician:'forged'}}});assert.equal(res.status,200);h=res.value;assert.equal(h.data.review,null);assert.equal(h.data.format,'wardnote-sbar/1');assert.deepEqual(h.data.sources,sources);assert.deepEqual(h.data.handoffSnapshot,snapshot);assert.equal(app.vault.get(n.id).data.fields.course,'No pain; not confirmed.');assert.ok((await request('/records/'+h.id+'/history')).value.revisions.some(x=>x.data.review));
});
test('new source blocks stale review even when browser has not refreshed; fresh SBAR can be reviewed',async()=>{
 await request('/records','POST',{type:'task',encounterId:e.id,data:{title:'New pending task',done:false}});assert.equal((await request('/records/'+h.id+'/verify','POST',{version:h.version})).status,409);const fresh=(await request('/summaries','POST',{encounterId:e.id,format:'sbar',labelLanguage:'en'})).value;assert.ok(fresh.data.text.includes('New pending task'));assert.equal((await request('/records/'+fresh.id+'/verify','POST',{version:fresh.version})).status,200);
});
