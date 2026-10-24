// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {EASY_START_TEXT,deviceEntry,easyStartHTML,isLoopbackHost,readinessSummary,trustedLaunchURL} from '../public/easy-start.js';
import {languageCodes} from '../public/languages.js';
const env=(href,secure=true)=>({location:{href},isSecureContext:secure,navigator:{}});
const good={level:'ready',secure:true,crypto:true,locks:true,storage:{supported:true,writable:true},offline:{supported:true,ready:true,controlled:true}};

test('shareable launch links require trusted HTTPS and strip credentials, path, query and fragment',()=>{
 assert.equal(trustedLaunchURL(env('https://clinician:password@ward.example:8443/patient/identifiable?account=private#token')),'https://ward.example:8443/');
 for(const href of ['http://ward.example','file:///private/patient.html','javascript:alert(1)','not a url','https://localhost:1234/','https://localhost./','https://device.localhost/','https://127.0.0.2/','https://2130706433/','https://[::1]/','https://[::]/','https://[::ffff:127.0.0.1]/','https://0.0.0.0/'])assert.equal(trustedLaunchURL(env(href)),null,href);
 assert.equal(trustedLaunchURL(env('https://ward.example',false)),null);
 assert.equal(trustedLaunchURL(env('https://192.168.1.5:8443/')),'https://192.168.1.5:8443/');
});
test('render never advertises a loopback or insecure phone link and never includes URL patient fields',()=>{
 const local=easyStartHTML({language:'en',env:env('http://localhost:8787/patient/secret?patient=PHI#token')});
 assert.ok(local.includes('only on this device'));assert.ok(!local.includes('data-easy-action="copy"'));assert.ok(!local.includes('PHI'));assert.ok(!local.includes('/patient/'));assert.ok(!local.includes('#token'));
 const html=easyStartHTML({language:'en',env:env('https://user:secret@ward.example/path?patient=PHI#token')});
 assert.ok(html.includes('https://ward.example/'));assert.ok(!html.includes('PHI'));assert.ok(!html.includes('secret'));assert.ok(!html.includes('/path'));assert.ok(html.includes('data-easy-action="copy"'));assert.ok(!html.includes('data-easy-action="share"'));
 assert.ok(!easyStartHTML({env:env('http://192.168.1.5:8787')}).includes('data-easy-link'));
});
test('browser guidance detects iPhone, desktop-mode iPad, Android and standalone',()=>{
 assert.deepEqual(deviceEntry({navigator:{userAgent:'Mozilla iPhone Safari/605.1'}}),{platform:'ios',safari:true,standalone:false});
 assert.equal(deviceEntry({navigator:{userAgent:'Macintosh Safari/605.1',platform:'MacIntel',maxTouchPoints:5}}).platform,'ios');
 assert.equal(deviceEntry({navigator:{userAgent:'iPhone CriOS/131 Safari/605'}}).safari,false);
 assert.equal(deviceEntry({navigator:{userAgent:'Android Chrome/131'}}).platform,'android');
 assert.equal(deviceEntry({navigator:{standalone:true}}).standalone,true);
 assert.equal(deviceEntry({matchMedia:()=>({matches:true})}).standalone,true);
 const ios=easyStartHTML({language:'en',env:{...env('https://ward.example'),navigator:{userAgent:'iPhone Safari/605'}}});
 assert.ok(ios.includes('Add to Home Screen'));assert.ok(!ios.includes('data-easy-action="install"'));
 const standalone=easyStartHTML({language:'en',installAvailable:true,env:{...env('https://ward.example'),navigator:{standalone:true}}});
 assert.ok(standalone.includes('standalone window'));assert.ok(!standalone.includes('data-easy-action="install"'));
});
test('read-only capability checks cannot imply a successful writable check',()=>{
 assert.equal(readinessSummary(null),'unchecked');assert.equal(readinessSummary(good),'ready');
 assert.equal(readinessSummary({...good,storage:{supported:true,writable:null}}),'prepare');
 assert.equal(readinessSummary({...good,storage:{supported:true,writable:false}}),'unsupported');
 assert.equal(readinessSummary({...good,offline:{supported:true,ready:false,controlled:true}}),'prepare');
 assert.equal(readinessSummary({...good,secure:false}),'unsupported');
 assert.equal(readinessSummary({...good,crypto:false}),'unsupported');
});
test('all eight interface dictionaries cover every string without Chinese leakage in other languages',()=>{
 assert.deepEqual(Object.keys(EASY_START_TEXT).sort(),[...languageCodes].sort());
 const keys=Object.keys(EASY_START_TEXT.en).sort();
 for(const code of languageCodes){
  const dictionary=EASY_START_TEXT[code];assert.deepEqual(Object.keys(dictionary).sort(),keys,code);
  for(const [key,value]of Object.entries(dictionary)){assert.equal(typeof value,'string');assert.ok(value.trim(),`${code}.${key}`);if(code!=='zh')assert.ok(!/[\u3400-\u9fff\ufffd]/u.test(value),`${code}.${key}`);}
  const html=easyStartHTML({language:()=>code,env:env('https://ward.example'),installAvailable:()=>true});assert.ok(html.includes(dictionary.title));assert.ok(html.includes('data-easy-action="install"'));
 }
 assert.equal(isLoopbackHost('LOCALHOST.'),true);
});
