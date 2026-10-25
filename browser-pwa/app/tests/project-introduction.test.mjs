import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createApp} from '../server.mjs';

test('approved introduction module is served without patient data or authentication and survives explicit resource registration',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'wardnote-introduction-'));
 const app=createApp({dataDir:directory});
 try{
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  const response=await fetch(`http://127.0.0.1:${app.server.address().port}/project-introduction.js`);
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);
  assert.equal(await response.text(),readFileSync(new URL('../public/project-introduction.js',import.meta.url),'utf8'));
  assert.ok(readFileSync(new URL('../public/sw.js',import.meta.url),'utf8').includes("'/project-introduction.js'"));
 }finally{await app.close();rmSync(directory,{recursive:true,force:true});}
});
