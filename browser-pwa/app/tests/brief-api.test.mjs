// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {createApp} from '../server.mjs';
import {blankNote} from '../public/domain.js';
let app,base,cookie,csrf,e,n,b,dir;
const root=resolve(import.meta.dirname,'../../work');
async function request(path,method='GET',data){const res=await fetch(base+'/api'+path,{method,headers:{Origin:base,...(cookie?{Cookie:cookie,'X-CSRF-Token':csrf}:{}),'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined});const value=await res.json();return {res,value};}
before(async()=>{mkdirSync(root,{recursive:true});dir=mkdtempSync(join(root,'brief-api-'));app=createApp({dataDir:dir});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+app.server.address().port;const setup=await request('/setup','POST',{clinician:'Synthetic reviewer',password:'synthetic-brief-api-password'});cookie=setup.res.headers.get('set-cookie').split(';')[0];csrf=setup.value.csrf;e=(await request('/records','POST',{type:'encounter',data:{displayName:'Synthetic',admitted:'2026-10-13'}})).value;n=(await request('/records','POST',{type:'note',encounterId:e.id,data:{...blankNote('initial'),fields:{hpi:'SOURCE_WORDING'}}})).value;});
after(async()=>{await app?.close();const rel=relative(root,dir);if(!rel||rel.startsWith('..'+sep))throw Error('Unsafe path');rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:200});});
test('server generation requires current brief version and explicit review',async()=>{
 const generated=await request('/briefs','POST',{encounterId:e.id,labelLanguage:'en'});assert.equal(generated.res.status,201);b=generated.value;assert.equal(b.data.review,null);assert.equal(b.data.fields.reason,'SOURCE_WORDING');assert.equal((await request('/records','POST',{type:'brief',encounterId:e.id,data:b.data})).res.status,400);assert.equal((await request('/briefs','POST',{encounterId:e.id})).res.status,409);b=(await request('/records/'+b.id+'/verify','POST',{version:b.version})).value;assert.equal(b.data.review.clinician,'Synthetic reviewer');
});
test('editing cannot forge review or provenance and historical snapshots persist',async()=>{
 const source=b.data.sources;const edited=await request('/records/'+b.id,'PUT',{version:b.version,data:{...b.data,fields:{...b.data.fields,reason:'MANUALLY_EDITED'},sources:[],entries:[],review:{clinician:'forged'},generatedAt:'forged'}});assert.equal(edited.res.status,200);b=edited.value;assert.equal(b.data.review,null);assert.deepEqual(b.data.sources,source);assert.equal(app.vault.get(n.id).data.fields.hpi,'SOURCE_WORDING');const history=(await request('/records/'+b.id+'/history')).value.revisions;assert.ok(history.some(r=>r.data.review&&r.data.fields.reason==='SOURCE_WORDING'));assert.equal((await request('/records/'+b.id,'PUT',{version:b.version-1,data:b.data})).res.status,409);
});
test('new sources block old-summary review and regeneration retains the prior edited version',async()=>{
 await request('/records','POST',{type:'task',encounterId:e.id,data:{title:'New pending result',done:false}});assert.equal((await request('/records/'+b.id+'/verify','POST',{version:b.version})).res.status,409);b=(await request('/briefs','POST',{encounterId:e.id,id:b.id,version:b.version,labelLanguage:'en'})).value;assert.equal(b.data.review,null);assert.ok(b.data.fields.focus.includes('New pending result'));assert.ok((await request('/records/'+b.id+'/history')).value.revisions.some(r=>r.data.fields.reason==='MANUALLY_EDITED'));assert.equal((await request('/records/'+b.id+'/verify','POST',{version:b.version})).res.status,200);const exported=(await request('/export','POST',{encounterId:e.id})).value;assert.ok(exported.records.some(r=>r.type==='brief'));
});
