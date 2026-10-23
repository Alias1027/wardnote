import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {join,resolve,sep} from 'node:path';
import {spawnSync} from 'node:child_process';
test('production native document guard rejects unsafe provider targets and reports cleanup failures',()=>{
 const root=resolve(import.meta.dirname,'..'),tmp=join(root,'.test-tmp');mkdirSync(tmp,{recursive:true});
 const output=mkdtempSync(join(tmp,'guard-'));
 const javaHome=process.env.WARDNOTE_JAVA_HOME||resolve(root,'../wardnote-android-buildtools/jdk/jdk-17.0.20.1+1');
 const tool=name=>join(javaHome,'bin',name+(process.platform==='win32'?'.exe':''));
 try{
  const compile=spawnSync(tool('javac'),['--release','8','-encoding','UTF-8','-d',output,join(root,'android/app/src/main/java/org/wardnote/offline/preview/DocumentGuard.java'),join(root,'tests/java/DocumentGuardTest.java')],{encoding:'utf8'});
  assert.equal(compile.status,0,compile.stderr||compile.error?.message);
  const result=spawnSync(tool('java'),['-cp',output,'org.wardnote.offline.preview.DocumentGuardTest'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.error?.message);assert.match(result.stdout,/SCENARIOS=10/);
  writeFileSync(join(root,'logs/android-native-guard-results.json'),JSON.stringify({environment:'Host JVM executing production DocumentGuard with fake providers; NOT Android ContentResolver or device validation',scenarios:10,output:result.stdout,errors:[]},null,2));
 }finally{if(!output.startsWith(tmp+sep))throw Error('Unexpected temporary path');rmSync(output,{recursive:true,force:true});}
});
