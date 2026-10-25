import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PROJECT_INTRODUCTIONS as copy,projectIntroductionHTML} from '../web/project-introduction.js';

test('eight introduction catalogs preserve complete content, author, email and acknowledgment order',()=>{
 assert.deepEqual(Object.keys(copy).sort(),['ar','en','es','fr','hi','ru','ur','zh']);
 for(const [code,c] of Object.entries(copy)){
  assert.deepEqual(Object.keys(c).sort(),Object.keys(copy.zh).sort());
  for(const [key,value] of Object.entries(c))assert.ok(Array.isArray(value)?value.length===3:typeof value==='string'&&value.trim(),`${code}:${key}`);
  assert.equal(c.email,'junhuiliu1025@gmail.com');assert.ok(c.copyright.includes('Junhui Liu M.D.'));
  const names=c.acknowledgments[1];assert.ok(names.indexOf('June Chunqiu Hou')<names.indexOf('Andrew Fagelman'));assert.ok(names.indexOf('Andrew Fagelman')<names.indexOf('Laszlo Mechtler'));
  assert.ok(c.acknowledgments[2].includes('Charles Jiang'));
  if(code!=='zh')assert.doesNotMatch(JSON.stringify(c),/[\u3400-\u9fff\ufffd]/);
 }
});

test('help renders full text in approved order and acknowledgments have no links or hidden disclosure',()=>{
 for(const [code,c] of Object.entries(copy)){
  const html=projectIntroductionHTML(code);
  const p=html.indexOf('data-introduction="purpose"'),i=html.indexOf('data-introduction="infrastructure"'),f=html.indexOf('data-introduction="framework"'),a=html.indexOf('class="project-acknowledgments"'),s=html.indexOf('class="project-scope"');
  assert.ok(p<i&&i<f&&f<a&&a<s);
  assert.doesNotMatch(html,/<a\b|<details\b|<button\b|<script\b|<iframe\b|<img\b/i);
  assert.equal((html.slice(a,s).match(/<p /g)||[]).length,3);
  assert.ok(html.includes(c.email));
 }
});

test('rendered optional policy text is escaped and unknown locale uses English',()=>{
 const html=projectIntroductionHTML('en',{license:'<script>alert("x")</script>',boundary:'<img src=x onerror=alert(1)>'});
 assert.doesNotMatch(html,/<script|<img/);assert.ok(html.includes('&lt;script&gt;'));
 assert.equal(projectIntroductionHTML('unknown'),projectIntroductionHTML('en'));
});

test('browser and Android introductions have identical text across checkout line endings and the new resource is cached',()=>{
 const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8').replace(/\r\n/g,'\n');
 assert.equal(read('web/project-introduction.js'),read('browser-pwa/app/public/project-introduction.js'));
 assert.match(read('browser-pwa/app/public/sw.js'),/^const CACHE='wardnote-shell-v0\.6\.15-r3';/);
 assert.ok(read('browser-pwa/app/public/sw.js').includes("'/project-introduction.js'"));
 const androidVersion=JSON.parse(read('package.json')).version;
 assert.ok(read('web/android-platform.js').includes('Android '+androidVersion+' · Web 0.6.15 r3'));
 for(const prefix of ['web','browser-pwa/app/public'])assert.ok(read(prefix+'/app.js').includes('return projectIntroductionHTML(language(),'));
});

test('approved Chinese and English copy is complete in both READMEs and the delivery document',()=>{
 const root=new URL('../',import.meta.url),read=p=>readFileSync(new URL(p,root),'utf8').replace(/\r\n/g,'\n');
 for(const [code,c] of Object.entries(copy).filter(([code])=>['zh','en'].includes(code))){
  const fields=['purpose','infrastructure','framework','scope','copyright','license','email'];
  for(const file of ['README.md','docs/PROJECT-INTRODUCTION.md',...(code==='en'?['README.en.md']:[])]){
   const text=read(file);for(const key of fields)assert.ok(text.includes(c[key]),`${file}:${code}:${key}`);
   for(const ack of c.acknowledgments)assert.ok(text.includes(ack),`${file}:${code}:ack`);
  }
 }
 const homepage=read('README.md').split('\n## English\n\n')[1].trim();
 const standalone=read('README.en.md').split('\n').slice(4).join('\n').trim().replace(/^## /gm,'### ');
 assert.equal(homepage,standalone);
});
