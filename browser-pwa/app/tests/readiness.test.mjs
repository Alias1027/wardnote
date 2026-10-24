// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION} from '../public/domain.js';
import {capacityPolicy,storageCapacity,requestPersistentStorage,probeLocalStore,inspectOfflineShell,inspectDevice} from '../public/device-readiness.js';
const MiB=1048576;
test('missing, rejected or invalid capacity stays unknown instead of zero',async()=>{
 for(const estimate of [undefined,{}, {usage:NaN,quota:100}, {usage:-1,quota:100}, {usage:0,quota:0}]){
  const r=capacityPolicy(estimate);assert.equal(r.level,'unknown');assert.equal(r.available,null);assert.equal(r.ratio,null);
 }
 assert.deepEqual(await storageCapacity({}),{level:'unknown',usage:null,quota:null,available:null,ratio:null,persistent:null});
 const env={navigator:{storage:{estimate:async()=>{throw new Error('Denied');},persisted:async()=>{throw new Error('Denied');}}}};
 assert.equal((await storageCapacity(env)).usage,null);assert.equal((await storageCapacity(env)).persistent,null);
});
test('capacity thresholds warn without treating zero usage as unknown',()=>{
 assert.equal(capacityPolicy({usage:0,quota:1024*MiB}).level,'ok');
 assert.equal(capacityPolicy({usage:950*MiB,quota:1024*MiB}).level,'warning');
 assert.equal(capacityPolicy({usage:70*MiB,quota:100*MiB}).level,'warning');
 assert.equal(capacityPolicy({usage:90*MiB,quota:100*MiB}).level,'critical');
 assert.equal(capacityPolicy({usage:2100*MiB,quota:2048*MiB}).available,0);
});
test('inspection never requests persistence; request is a separate explicit API',async()=>{
 let requests=0;const env={navigator:{storage:{estimate:async()=>({usage:1,quota:1024*MiB}),persisted:async()=>false,persist:async()=>{requests++;return false;}}}};
 await storageCapacity(env);assert.equal(requests,0);assert.equal(await requestPersistentStorage(env),false);assert.equal(requests,1);
 assert.equal(await requestPersistentStorage({}),null);assert.equal(await requestPersistentStorage({navigator:{storage:{persist:async()=>{throw new Error('Denied');}}}}),null);
});
test('missing or denied IndexedDB is unavailable, never a successful probe',async()=>{
 assert.deepEqual(await probeLocalStore({}),{supported:false,writable:false});
 assert.deepEqual(await probeLocalStore({indexedDB:{open(){throw new Error('Denied');},deleteDatabase(){}}}),{supported:true,writable:false});
});
test('offline readiness requires the controlling current-version worker and complete cache',async()=>{
 const check=async value=>inspectOfflineShell({MessageChannel,navigator:{serviceWorker:{controller:{postMessage(_data,ports){ports[0].postMessage(value);}}}},caches:{}},50);
 assert.equal((await check({cache:`wardnote-shell-v${VERSION}-r1`,ready:true,files:50})).ready,true);
 assert.equal((await check({cache:'wardnote-shell-v0.0.0-r1',ready:true,files:50})).ready,false);
 assert.equal((await check({cache:`wardnote-shell-v${VERSION}-r1`,ready:false,files:50})).ready,false);
 assert.equal((await inspectOfflineShell({navigator:{serviceWorker:{}},caches:{}})).controlled,false);
 assert.equal((await inspectOfflineShell({MessageChannel,navigator:{serviceWorker:{controller:{postMessage(){}}}},caches:{}},5)).ready,false);
});
test('unsupported environment cannot report readiness; optional microphone is not required',async()=>{
 const r=await inspectDevice({env:{}});assert.equal(r.level,'unsupported');assert.equal(r.microphone,false);assert.equal(r.capacity.level,'unknown');
 const env={isSecureContext:true,crypto:{subtle:{}},indexedDB:{},MessageChannel,navigator:{locks:{request(){}},serviceWorker:{controller:{postMessage(_data,ports){ports[0].postMessage({cache:`wardnote-shell-v${VERSION}-r1`,ready:true,files:50});}}}},caches:{}};
 const local=await inspectDevice({env,probe:false});assert.equal(local.level,'ready');assert.equal(local.microphone,false);
});
