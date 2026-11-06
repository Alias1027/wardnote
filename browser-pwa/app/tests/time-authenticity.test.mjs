// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {validate} from '../public/record-validation.js';
import {validSampleTime,labSampleTime,selectedTrends,undatedLabs} from '../public/worksheet-ui.js';
import {composeSummary,sourcesChanged} from '../public/domain.js';
import {sourceContent} from '../public/continuity-ui.js';
import {setLanguage} from '../public/i18n.js';
import {createApp} from '../server.mjs';

const data=(patch={})=>({name:'Synthetic Cr',value:'1.2',unit:'mg/dL',source:'Synthetic original report',...patch});
const lab=(id,patch={},encounterId='patient-a')=>({id,type:'lab',encounterId,version:1,createdAt:'2026-11-06T10:00:00.000Z',updatedAt:'2026-11-06T10:00:00.000Z',data:data(patch)});

test('sample times validate calendar and clock values while preserving legacy precision',()=>{
 for(const value of ['2026-11-06','2024-02-29T08:30','2026-11-06 08:30','2026-11-06T08:30:00Z','2026-11-06T08:30:05.120+08:00']){
  assert.equal(validSampleTime(value),true,value);assert.equal(labSampleTime({sampledAt:value}),value);assert.doesNotThrow(()=>validate('lab',data({sampledAt:value})));
 }
 for(const value of ['',undefined,'yesterday','2026-02-29','2026-02-30T08:30','2026-11-31','2026-11-06T24:00','2026-11-06T08:60','2026-11-06T08:30:60','2026-11-06T08:30+24:00','0000-01-01']){
  assert.equal(validSampleTime(value),false,String(value));assert.equal(labSampleTime({sampledAt:value}),'');assert.throws(()=>validate('lab',data({sampledAt:value})),/真实采样时间/);
 }
 assert.throws(()=>validate('lab',data({sampledAt:'2026-11-06T08:30',date:'2026-11-05'})),/真实采样时间/);
});

test('unknown sample time is explicit, blank and unverified rather than inferred from entry time',()=>{
 const unknown=data({sampleTimeUnknown:true,sampledAt:'',date:'',verified:false});
 assert.doesNotThrow(()=>validate('lab',unknown));assert.equal(labSampleTime(unknown),'');
 for(const patch of [{sampledAt:'2026-11-06T08:30'},{date:'2026-11-06'},{verified:true}])assert.throws(()=>validate('lab',{...unknown,...patch}),/保留空白时间/);
 for(const sampleTimeUnknown of ['true',1,null])assert.throws(()=>validate('lab',{...unknown,sampleTimeUnknown}),/时间状态无效/);
 assert.throws(()=>validate('lab',data({sampledAt:'',sampleTimeUnknown:false})),/真实采样时间/);
 assert.throws(()=>validate('lab',{...unknown,source:''}),/检验需要/);
});

test('unknown or invalid legacy times remain separately visible and cannot enter dated trends',()=>{
 const rows=[lab('known',{sampledAt:'2026-10-01T12:00'}),lab('later',{sampledAt:'2026-11-01T12:00'}),lab('unknown',{sampleTimeUnknown:true,sampledAt:'',date:''}),lab('invalid-legacy',{sampledAt:'2026-02-30T08:00',verified:true}),lab('missing-legacy'),lab('deleted',{sampleTimeUnknown:true,deletedAt:'2026-10-02'}),lab('foreign',{sampleTimeUnknown:true},'patient-b')];
 const snapshot=JSON.stringify(rows);
 assert.deepEqual(selectedTrends(rows,'patient-a','2026-10-05')[0].values.map(r=>r.id),['known']);
 assert.deepEqual(undatedLabs(rows,'patient-a').map(r=>r.id),['unknown','invalid-legacy','missing-legacy']);
 setLanguage('zh');const source=sourceContent(rows[3]);assert.match(source,/采样时间待核实/);assert.doesNotMatch(source,/原报告已核对/);
 assert.equal(JSON.stringify(rows),snapshot,'reading legacy records never rewrites their dates');
});

test('date-range summaries separate undated results, preserve provenance and never use their entry date as sample time',()=>{
 const e={id:'patient-a',version:1,data:{displayName:'Synthetic',admitted:'2026-10-01'}};
 const rows=[lab('known',{sampledAt:'2026-10-03T12:00'}),lab('outside',{sampledAt:'2026-11-01T12:00'}),lab('undated',{sampleTimeUnknown:true,sampledAt:'',date:'',value:'UNIQUE_UNDATED'}),lab('foreign',{sampleTimeUnknown:true,value:'FOREIGN'},'patient-b')];
 const before=JSON.stringify(rows),summary=composeSummary(e,rows,'2026-10-02','2026-10-05','zh');
 const [dated,rest]=summary.text.split('【时间待核实的检查】');
 assert.ok(dated.includes('2026-10-03T12:00'));assert.ok(!dated.includes('UNIQUE_UNDATED'));assert.ok(rest.includes('采样时间待核实'));assert.ok(rest.includes('UNIQUE_UNDATED'));assert.ok(!summary.text.includes('2026-11-01T12:00'));assert.ok(!summary.text.includes('2026-11-06T10:00:00.000Z'));assert.ok(!summary.text.includes('FOREIGN'));
 assert.deepEqual(summary.sources.map(s=>s.id),['patient-a','known','undated']);assert.equal(JSON.stringify(rows),before);
 assert.equal(sourcesChanged({data:summary},[e,...rows]),false);assert.equal(sourcesChanged({data:summary},[e,...rows.map(r=>r.id==='undated'?{...r,version:2}:r)]),true);
});

test('server accepts explicit unknown time and preserves its original revision when verified time is added',async()=>{
 const root=resolve(import.meta.dirname,'../../work/qa');mkdirSync(root,{recursive:true});const dir=mkdtempSync(join(root,'time-api-'));const app=createApp({dataDir:dir});
 let cookie='',csrf='';await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;
 const request=async(path,method='GET',body)=>{const res=await fetch(base+'/api'+path,{method,headers:{Origin:base,'Content-Type':'application/json',...(cookie?{Cookie:cookie,'X-CSRF-Token':csrf}:{})},body:body?JSON.stringify(body):undefined});return {status:res.status,value:await res.json(),headers:res.headers};};
 try{
  const auth=await request('/setup','POST',{password:'synthetic-time-password',clinician:'Synthetic reviewer'});assert.equal(auth.status,200);cookie=auth.headers.get('set-cookie').split(';')[0];csrf=auth.value.csrf;
  const e=(await request('/records','POST',{type:'encounter',data:{displayName:'Synthetic time fixture',admitted:'2026-10-01'}})).value;
  assert.equal((await request('/records','POST',{type:'lab',encounterId:e.id,data:data({sampledAt:'2026-02-30T08:00'})})).status,400);
  assert.equal((await request('/records','POST',{type:'lab',encounterId:e.id,data:data({sampleTimeUnknown:true,verified:true})})).status,400);
  const created=await request('/records','POST',{type:'lab',encounterId:e.id,data:data({sampleTimeUnknown:true,sampledAt:'',date:'',verified:false})});assert.equal(created.status,201);const saved=created.value;
  assert.equal(saved.data.sampledAt,'');assert.equal(saved.data.date,'');assert.ok(saved.createdAt,'entry timestamp is separate from the unknown clinical time');
  const corrected=await request('/records/'+saved.id,'PUT',{version:saved.version,data:{...saved.data,sampleTimeUnknown:false,sampledAt:'2026-10-03T09:25',date:'2026-10-03',verified:true}});assert.equal(corrected.status,200);assert.equal(corrected.value.data.sampledAt,'2026-10-03T09:25');
  const history=(await request('/records/'+saved.id+'/history')).value.revisions;assert.equal(history[0].data.sampleTimeUnknown,true);assert.equal(history[0].data.sampledAt,'');assert.equal(history[0].data.verified,false);
 }finally{await app.close();const rel=relative(root,dir);assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+sep));rmSync(dir,{recursive:true,force:true});}
});
