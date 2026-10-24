// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {captureCapacity,checkCaptureStorage,watchCaptureStorage} from '../public/capture-storage.js';
test('capture preflight reserves metadata space and accounts for an imported file',()=>{
 assert.equal(captureCapacity({available:70*1024*1024,level:'ok'},40*1024*1024).level,'critical');
 assert.equal(captureCapacity({available:null,level:'unknown'},100).level,'unknown');
 assert.equal(captureCapacity({available:80*1024*1024,level:'ok'},40*1024*1024).level,'ok');
});
test('unsupported and failed storage estimates remain unknown',async()=>{
 assert.equal((await checkCaptureStorage(0,{})).level,'unknown');
 assert.equal((await checkCaptureStorage(0,{navigator:{storage:{estimate:async()=>{throw Error('unavailable');}}}})).available,null);
});
test('capacity monitor stops once at a critical limit and never acts after closing',async()=>{
 let tick,critical=0,notice=0,active=true;
 let state={level:'warning',message:'warn'};
 const stop=watchCaptureStorage({active:()=>active,onCritical:()=>critical++,onNotice:()=>notice++,check:async()=>state,schedule:f=>{tick=f;return 1;},cancel:()=>{}});
 await tick();await tick();assert.equal(notice,1);state={level:'critical'};await tick();await tick();assert.equal(critical,1);stop();await tick();assert.equal(critical,1);
});
test('late estimate cannot affect a different session or cancelled recording',async()=>{
 let tick,resolve,acted=0,active=true;
 const stop=watchCaptureStorage({active:()=>active,onCritical:()=>acted++,onNotice:()=>acted++,check:()=>new Promise(r=>resolve=r),schedule:f=>{tick=f;return 1;},cancel:()=>{}});
 const pending=tick();active=false;resolve({level:'critical'});await pending;assert.equal(acted,0);stop();
});
