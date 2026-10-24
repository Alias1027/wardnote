// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import http from 'node:http';
import {Vault} from '../lib/vault.mjs';
import {syncService} from '../lib/sync-service.mjs';
import {authorizationService} from '../lib/authorization.mjs';
import {createApp} from '../server.mjs';
import {canonical,syncRecord,selectedRecords} from '../public/sync-core.js';
const work=resolve(import.meta.dirname,'../../work');mkdirSync(work,{recursive:true});
const fixture=async(fn)=>{const dir=mkdtempSync(join(work,'offline-unit-'));const vault=new Vault(dir);vault.setup('synthetic-test-password','Synthetic');try{await fn(vault,dir);}finally{vault.close();rmSync(dir,{recursive:true,force:true});}};
const patient=()=>({id:randomUUID(),type:'encounter',encounterId:'',version:1,createdAt:'2026-10-15T00:00:00.000Z',updatedAt:'2026-10-15T00:00:00.000Z',data:{displayName:'Synthetic only',admitted:'2026-10-15'}});
test('sync preview is inert, commit is scoped and repeatable, and edits after preview conflict',()=>fixture(v=>{
 const sync=syncService(v),a=patient(),b=patient();const plan=sync.preview({remoteId:sync.identity(),confirmed:true,records:[a],bases:{},audio:[]},'session');assert.equal(v.get(a.id),null);const result=sync.commit(plan.previewId,'session');assert.deepEqual(result.records,[a]);assert.equal(v.get(b.id),null);assert.deepEqual(sync.commit(plan.previewId,'session'),result);
 const changed=structuredClone(a);changed.version=2;changed.data.bed='A1';const next=sync.preview({remoteId:sync.identity(),confirmed:true,records:[changed],bases:{[a.id]:canonical(a)},audio:[]},'session');v.update(a.id,1,{...a.data,bed:'B2'});assert.deepEqual(sync.commit(next.previewId,'session').conflicts,[a.id]);assert.equal(v.get(a.id).data.bed,'B2');
}));
test('sync denies malformed input, cross-patient sources, wrong workspace and foreign sessions',()=>fixture(v=>{
 const sync=syncService(v),a=patient(),b=patient();v.put(b);const note={...patient(),type:'note',encounterId:a.id,data:{kind:'daily',date:'2026-10-15',fields:{},problems:[],sources:[{id:b.id,version:1}]}};
 assert.throws(()=>sync.preview({remoteId:sync.identity(),confirmed:true,records:[a,note],bases:{}},'s'),/其他患者/);
 assert.throws(()=>sync.preview({remoteId:'other',confirmed:true,records:[a]},'s'));
 assert.throws(()=>sync.preview({remoteId:sync.identity(),confirmed:true,records:null},'s'));
 const p=sync.preview({remoteId:sync.identity(),confirmed:true,records:[a]},'s');assert.throws(()=>sync.commit(p.previewId,'foreign'));
}));
test('audio is verified and committed atomically; mismatched existing audio is never replaced',()=>fixture(v=>{
 const sync=syncService(v),a=patient(),bytes=Buffer.from('synthetic audio bytes');const recording={...patient(),type:'recording',encounterId:a.id,data:{mime:'audio/wav',consent:'synthetic consent',finalized:true,bytes:bytes.length,duration:1}};
 const parts=[{sequence:0,size:bytes.length,hash:createHash('sha256').update(bytes).digest('hex')}];const p=sync.preview({remoteId:sync.identity(),confirmed:true,records:[a,recording],audio:[{id:recording.id,parts}]},'s');assert.throws(()=>sync.commit(p.previewId,'s'),/不完整/);assert.equal(v.get(a.id),null);assert.throws(()=>sync.upload(p.previewId,recording.id,0,Buffer.from('wrong'),'s'));sync.upload(p.previewId,recording.id,0,bytes,'s');sync.commit(p.previewId,'s');assert.deepEqual(v.audioBytes(recording.id),bytes);
 const newBytes=Buffer.alloc(bytes.length,1),next=sync.preview({remoteId:sync.identity(),confirmed:true,records:[a,recording],audio:[{id:recording.id,parts:[{sequence:0,size:bytes.length,hash:createHash('sha256').update(newBytes).digest('hex')}]}]},'s');sync.upload(next.previewId,recording.id,0,newBytes,'s');assert.throws(()=>sync.commit(next.previewId,'s'),/未覆盖/);assert.deepEqual(v.audioBytes(recording.id),bytes);
}));
test('selected scope excludes other patients, private teaching drafts and device audio metadata',()=>{
 const a=patient(),b=patient(),r={...patient(),type:'recording',encounterId:a.id,data:{localParts:[{hash:'private'}],lastSavedAt:'now',audioMissing:true}};
 const selected=selectedRecords([a,b,r,{...patient(),type:'voiceDraft',encounterId:a.id},{...patient(),type:'reflection',encounterId:a.id}],[a.id]);assert.deepEqual(selected.map(r=>r.id),[a.id,r.id]);assert.deepEqual(selected[1].data,{});
});
test('a new sync service discards staging that cannot survive the previous process session',()=>fixture(v=>{
 const sync=syncService(v),a=patient(),bytes=Buffer.from('abandoned synthetic chunk');
 const recording={...patient(),type:'recording',encounterId:a.id,data:{mime:'audio/wav',consent:'Synthetic',finalized:true,bytes:bytes.length,duration:1}};
 const plan=sync.preview({remoteId:sync.identity(),confirmed:true,records:[a,recording],audio:[{id:recording.id,parts:[{sequence:0,size:bytes.length,hash:createHash('sha256').update(bytes).digest('hex')}]}]},'old-session');
 sync.upload(plan.previewId,recording.id,0,bytes,'old-session');assert.equal(v.db.prepare('SELECT COUNT(*) AS n FROM sync_audio').get().n,1);
 syncService(v);assert.equal(v.db.prepare('SELECT COUNT(*) AS n FROM sync_audio').get().n,0);assert.equal(v.get(a.id),null);
}));
test('authorization outbox stays encrypted, separates modes and retries without resending accepted events',()=>fixture(async(v,dir)=>{
 let accepts=false;const received=[];const relay=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;received.push({headers:req.headers,payload:JSON.parse(raw)});res.writeHead(accepts?202:503);res.end();});await new Promise(r=>relay.listen(0,'127.0.0.1',r));
 try{const service=authorizationService(v,'personal',{authorizationDestinations:[{id:'email',kind:'email',recipient:'synthetic@example.invalid',url:`http://127.0.0.1:${relay.address().port}/notify`}]});const event={id:randomUUID(),accountId:randomUUID(),mode:'personal',method:'password',outcome:'allowed',time:new Date().toISOString(),password:'NEVER_SEND',patient:'NEVER_SEND'};
  assert.equal((await service.submit([event])).receipts[0].state,'pending');assert.equal(JSON.stringify(received).includes('NEVER_SEND'),false);accepts=true;assert.equal((await service.submit([event])).receipts[0].state,'accepted');assert.equal(received.length,2);await service.submit([event]);assert.equal(received.length,2);assert.equal(received[0].headers['idempotency-key'],received[1].headers['idempotency-key']);assert.equal(readFileSync(join(dir,'wardnote.db')).includes(Buffer.from('synthetic@example.invalid')),false);
  await assert.rejects(service.submit([{...event,mode:'institution'}]));await assert.rejects(service.submit([{...event,outcome:'denied'}]),/冲突/);
 }finally{await new Promise(r=>relay.close(r));}
}));
test('two server modes have independent credentials, records, authorization destinations and connection gates',async()=>{
 const deliveries=[];const receiver=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;deliveries.push({path:req.url,body:JSON.parse(raw)});res.writeHead(202);res.end();});await new Promise(r=>receiver.listen(0,'127.0.0.1',r));const endpoint=`http://127.0.0.1:${receiver.address().port}`;
 const dir=mkdtempSync(join(work,'account-unit-')),app=createApp({dataDir:dir,config:{accountModes:Object.fromEntries(['personal','institution'].map(mode=>[mode,{authorizationDestinations:[{id:mode,kind:'api',url:endpoint+'/'+mode}]}]))}});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;
 const request=async(mode,path,data,session)=>{const r=await fetch(`${base}/api${mode==='institution'?'/institution':''}${path}`,{method:data?'POST':'GET',headers:{Origin:base,'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:data?JSON.stringify(data):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 try{const p=await request('personal','/setup',{password:'personal-network-pass',clinician:'P'}),i=await request('institution','/setup',{password:'institution-network-pass',clinician:'I'});const ps={cookie:p.cookie,csrf:p.body.csrf},is={cookie:i.cookie,csrf:i.body.csrf};
 assert.equal((await request('personal','/sync/census',null,ps)).status,403);assert.equal((await request('institution','/login',{password:'personal-network-pass'})).status,401);assert.equal((await request('institution','/records',null,ps)).status,401);
 const grant=await request('personal','/device-connection',{allowed:true,confirmed:true},ps);assert.equal(grant.body.accountMode,'personal');app.vault.put(patient());assert.equal((await request('personal','/sync/census',null,ps)).body.patients.length,1);assert.equal((await request('institution','/records',null,is)).body.records.length,0);
 await request('institution','/device-connection',{allowed:true,confirmed:true},is);
 for(const [mode,session]of [['personal',ps],['institution',is]]){const event={id:randomUUID(),accountId:randomUUID(),mode,method:'password',outcome:'allowed',time:new Date().toISOString()};const result=await request(mode,'/device-authorizations',{events:[event]},session);assert.equal(result.body.receipts[0].state,'accepted');}
 assert.deepEqual(deliveries.map(x=>x.path),['/personal','/institution']);assert.ok(deliveries.every(x=>JSON.stringify(x.body).includes(x.path.slice(1))));
 assert.equal((await request('personal','/device-connection',{allowed:false},ps)).status,200);assert.equal((await request('personal','/sync/census',null,ps)).status,403);
 }finally{await app.close();await new Promise(r=>receiver.close(r));rmSync(dir,{recursive:true,force:true});}
});
