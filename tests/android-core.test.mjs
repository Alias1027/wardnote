import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {androidStrings,codes,androidText} from '../web/android-strings.js';
import {dictionaries} from '../web/locale-core.js';
import {EN} from '../web/translations.js';
import {audioType,importNativeAudio,writeNativeFile,nativeCall,nativeBusy,nativeReady} from '../web/android-platform.js';
const result=(id,value)=>globalThis.__wardnoteNativeResult({id,ok:true,result:value});
test('eight Android catalogs and original catalogs have complete localized keys',()=>{
 assert.equal(codes.length,8);
 for(const [key,values] of Object.entries(androidStrings)){assert.equal(values.length,8,key);for(let i=0;i<8;i++){assert.ok(values[i].trim(),key);if(i)assert.doesNotMatch(values[i],/[\u3400-\u9fff\ufffd]/,key);}}
 for(const dict of Object.values(dictionaries))assert.deepEqual(Object.keys(dict).sort(),Object.keys(EN).sort());
 assert.notEqual(androidText('recorder','ar'),androidText('recorder','ur'));
});
test('native recorder audio metadata accepts common phone formats and rejects invalid/oversize',()=>{
 for(const type of ['audio/mp4','audio/mpeg','audio/amr','audio/3gpp','audio/aac','audio/flac'])assert.equal(audioType({type,size:100}),type);
 assert.equal(audioType({type:'audio/x-m4a',size:100}),'audio/mp4');
 for(const file of [{size:0,type:'audio/mp4'},{size:101*1024*1024,type:'audio/mp4'},{size:100,type:'text/html'}])assert.throws(()=>audioType(file));
});
test('native import is chunk bounded, context checked before write, no premature finalization',async()=>{
 const source=Buffer.alloc(700000,17),writes=[];let checks=0,finalized=false;
 globalThis.WardNoteNative={postMessage(raw){const {id,method,args}=JSON.parse(raw);assert.equal(method,'readChunk');const data=source.subarray(args.offset,args.offset+args.length);result(id,{base64:data.toString('base64'),eof:args.offset+data.length===source.length});}};
 const value=await importNativeAudio({type:'audio/mp4',size:source.length,token:'audio'}, {check(){checks++;},create:async()=>({id:'p1audio'}),append:async(id,index,blob)=>{assert.equal(id,'p1audio');assert.equal(index,writes.length);assert.ok(blob.size<=256*1024);writes.push(Buffer.from(await blob.arrayBuffer()));},finalize:async(id,n)=>{assert.equal(n,3);finalized=true;return id;}});
 assert.equal(value,'p1audio');assert.ok(finalized);assert.ok(checks>=8);assert.deepEqual(Buffer.concat(writes),source);
 let changed=false;finalized=false;writes.length=0;
 await assert.rejects(importNativeAudio({type:'audio/mp4',size:source.length,token:'audio'},{check(){if(changed)throw Error('changed context');},create:async()=>({id:'oldpatient'}),append:async()=>{changed=true;},finalize:async()=>{finalized=true;}}),/changed context/);assert.equal(finalized,false);
});
test('malformed/short native read cannot finalize a recording',async()=>{
 let finalized=false;globalThis.WardNoteNative={postMessage(raw){const {id}=JSON.parse(raw);result(id,{base64:'AA==',eof:true});}};
 await assert.rejects(importNativeAudio({type:'audio/mp4',size:100,token:'audio'},{check(){},create:async()=>({id:'audio'}),append:async()=>{},finalize:async()=>{finalized=true;}}));assert.equal(finalized,false);
});
test('backup/export requires native read-back size and digest; failed writes abort',async()=>{
 const bytes=Buffer.alloc(700000,4);let received=[],aborted=false;
 const native=(bad=false)=>({postMessage(raw){const {id,method,args}=JSON.parse(raw);if(method==='beginFile')return result(id,{token:'newfile'});if(method==='writeChunk'){received.push(Buffer.from(args.base64,'base64'));return result(id,{});}if(method==='finishFile')return result(id,{size:bad?3:bytes.length,sha256:args.sha256});if(method==='abortFile'){aborted=true;return result(id,{removed:true});}throw Error(method);}});
 globalThis.WardNoteNative=native();await writeNativeFile(new Blob([bytes]),'backup.wnpart',{folder:'dir'});assert.deepEqual(Buffer.concat(received),bytes);assert.ok(received.every(x=>x.length<=256*1024));
 globalThis.WardNoteNative=native(true);await assert.rejects(writeNativeFile(new Blob([bytes]),'backup.wnpart',{folder:'dir'}));assert.equal(aborted,true);
});
test('bridge cancellation clears pending calls, ignores unsolicited results',async()=>{
 globalThis.WardNoteNative={postMessage(raw){const {id}=JSON.parse(raw);globalThis.__wardnoteNativeResult({id,ok:false,error:{code:'CANCELLED'}});}};
 await assert.rejects(nativeCall('record'));assert.equal(nativeBusy(),false);globalThis.__wardnoteNativeResult({id:'unknown',ok:true,result:{}});
});
test('first-use readiness fails closed when required secure WebView storage is absent',async()=>{
 const original={secure:globalThis.isSecureContext,idb:globalThis.indexedDB,locks:navigator.locks};
 globalThis.WardNoteNative={postMessage(raw){result(JSON.parse(raw).id,{platform:'android',assets:true});}};
 try{
  globalThis.isSecureContext=true;globalThis.indexedDB={};Object.defineProperty(navigator,'locks',{value:{request(){}},configurable:true});
  assert.equal((await nativeReady()).platform,'android');
  for(const missing of ['secure','idb','locks']){
   globalThis.isSecureContext=missing!=='secure';globalThis.indexedDB=missing==='idb'?null:{};Object.defineProperty(navigator,'locks',{value:missing==='locks'?null:{request(){}},configurable:true});
   await assert.rejects(nativeReady());assert.equal(nativeBusy(),false);
  }
 }finally{globalThis.isSecureContext=original.secure;globalThis.indexedDB=original.idb;Object.defineProperty(navigator,'locks',{value:original.locks,configurable:true});}
});
test('export write failure and corrupt readback abort instead of reporting success',async()=>{
 for(const failAt of ['writeChunk','finishFile']){
  const methods=[];globalThis.WardNoteNative={postMessage(raw){const {id,method}=JSON.parse(raw);methods.push(method);if(method===failAt&&method==='writeChunk')return globalThis.__wardnoteNativeResult({id,ok:false,error:{code:'FILE_ACCESS'}});result(id,method==='beginFile'?{token:'temp'}:method==='finishFile'?{size:4,sha256:'bad-digest'}:method==='abortFile'?{removed:true}:{});}};
  await assert.rejects(writeNativeFile(new Blob(['test']),'backup.wnpart',{folder:'folder'}));assert.equal(methods.at(-1),'abortFile');assert.equal(nativeBusy(),false);
 }
});
test('export invalidated during chunk preparation or hashing must abort before another native write',async()=>{
 for(const phase of ['chunk','hash']){
  let valid=true;const methods=[];
  globalThis.WardNoteNative={postMessage(raw){const {id,method,args}=JSON.parse(raw);methods.push(method);result(id,method==='beginFile'?{token:'temp'}:method==='finishFile'?{size:4,sha256:args.sha256}:method==='abortFile'?{removed:true}:{});}};
  const blob={size:4,type:'application/octet-stream',slice(){return {async arrayBuffer(){if(phase==='chunk')valid=false;return new Uint8Array([1,2,3,4]).buffer;}};},async arrayBuffer(){if(phase==='hash')valid=false;return new Uint8Array([1,2,3,4]).buffer;}};
  await assert.rejects(writeNativeFile(blob,'backup.wnpart',{folder:'folder',check(){if(!valid)throw Error('account invalidated');}}),/account invalidated/);
  assert.equal(methods.includes('finishFile'),false,phase+' cannot finalize after invalidation');
  if(phase==='chunk')assert.equal(methods.includes('writeChunk'),false,'cannot write prepared stale bytes');
  assert.equal(methods.at(-1),'abortFile');assert.equal(nativeBusy(),false);
 }
});
test('export remains busy between bridge calls while hashing bytes',async()=>{
 let resolveHash,enteredHash;const entered=new Promise(resolve=>enteredHash=resolve);
 globalThis.WardNoteNative={postMessage(raw){const {id,method,args}=JSON.parse(raw);result(id,method==='beginFile'?{token:'temp'}:method==='finishFile'?{size:4,sha256:args.sha256}:method==='abortFile'?{removed:true}:{});}};
 const blob={size:4,type:'application/octet-stream',slice(){return new Blob(['test']);},async arrayBuffer(){enteredHash();return new Promise(resolve=>resolveHash=()=>resolve(new TextEncoder().encode('test').buffer));}};
 const promise=writeNativeFile(blob,'backup.wnpart',{folder:'folder'});await entered;
 const busy=nativeBusy();resolveHash();await promise;assert.equal(busy,true);assert.equal(nativeBusy(),false);
});
test('incomplete export cleanup is visible instead of claiming deletion',async()=>{
 globalThis.WardNoteNative={postMessage(raw){const {id,method}=JSON.parse(raw);if(method==='writeChunk')return globalThis.__wardnoteNativeResult({id,ok:false,error:{code:'FILE_ACCESS'}});result(id,method==='beginFile'?{token:'temp'}:{removed:false});}};
 await assert.rejects(writeNativeFile(new Blob(['test']),'backup.wnpart',{folder:'folder'}),error=>error.message===androidText('cleanup'));
 assert.equal(nativeBusy(),false);
});
test('native verified removal after readback failure does not trigger a second false cleanup warning',async()=>{
 const methods=[];globalThis.WardNoteNative={postMessage(raw){const {id,method}=JSON.parse(raw);methods.push(method);if(method==='finishFile')return globalThis.__wardnoteNativeResult({id,ok:false,error:{code:'VERIFY_FAILED'}});result(id,method==='beginFile'?{token:'temp'}:{removed:false});}};
 await assert.rejects(writeNativeFile(new Blob(['test']),'backup.wnpart',{folder:'folder'}),error=>error.code==='VERIFY_FAILED');
 assert.equal(methods.includes('abortFile'),false);assert.equal(nativeBusy(),false);
});
test('update retains origin and private storage; no runtime cache/database deletion or alternate storage suffix',()=>{
 const java=readFileSync(new URL('../android/app/src/main/java/org/wardnote/offline/preview/MainActivity.java',import.meta.url),'utf8');
 assert.match(java,/https:\/\/appassets.androidplatform.net/);assert.doesNotMatch(java,/setDataDirectorySuffix|deleteDatabase\(|deleteAllData\(|clearCache\(/);
 const manifest=readFileSync(new URL('../android/app/src/main/AndroidManifest.xml',import.meta.url),'utf8');assert.match(manifest,/package="org.wardnote.offline.preview"/);assert.doesNotMatch(manifest,/<uses-permission/);
});
test('native fork disables external services and SW activation, preserves crypto format',()=>{
 const read=p=>readFileSync(new URL('../web/'+p,import.meta.url),'utf8');
 assert.match(read('deployment-profile.js'),/STATIC_ONLY=true/);
 assert.doesNotMatch(read('app.js'),/from '\.\/update-controller.js'/);
 assert.match(read('android-platform.js'),/Native packages update atomically/);
 const original=process.env.WARDNOTE_BASE_WEB;assert.ok(original,'Set WARDNOTE_BASE_WEB to the preserved base public directory');
 for(const name of ['offline-store.js','accounts.js','backup-segments.js'])assert.equal(read(name),readFileSync(original+'/'+name,'utf8'),name+' format unchanged');
});
