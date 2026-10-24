// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {REGION_KEY,REGION_DEFAULTS,TIME_ZONES,validTimeZone,validateRegionPreferences,regionPreferences,saveRegionPreferences,formatDate,formatDateTime,formatQuantity,applyPaperSize} from '../public/region-settings.js';
import {dictionaries} from '../public/locale-core.js';
import {readFileSync} from 'node:fs';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),values};};
test('regional preferences survive reopening and remain separate from clinical data and interface language',()=>{
 const storage=memory();storage.setItem('wardnote-language','ar');storage.setItem('clinical-sentinel','1.2 mg/dL');assert.deepEqual(regionPreferences(storage),REGION_DEFAULTS);
 const saved=saveRegionPreferences({dateOrder:'dmy',timeZone:'Asia/Karachi',numbering:'locale',paper:'Letter'},storage);
 assert.deepEqual(regionPreferences(storage),saved);assert.equal(storage.getItem('wardnote-language'),'ar');assert.equal(storage.getItem('clinical-sentinel'),'1.2 mg/dL');assert.equal(storage.values.size,3);
});
test('malformed preferences recover defaults while invalid updates and failed persistence never claim success',()=>{
 const storage=memory();storage.setItem(REGION_KEY,'{corrupt');assert.deepEqual(regionPreferences(storage),REGION_DEFAULTS);
 for(const change of [{dateOrder:'auto'},{timeZone:'Not/APlace'},{paper:'<style>'},{numbering:'invalid'}])assert.throws(()=>saveRegionPreferences(change,storage),/设置无效/);
 assert.throws(()=>saveRegionPreferences({paper:'Letter'},null),/未保存/);
 assert.throws(()=>saveRegionPreferences({paper:'Letter'},{getItem:()=>null,setItem:()=>{throw Error('blocked');}}),/未保存/);
 for(const zone of TIME_ZONES)assert.ok(validTimeZone(zone),zone);assert.ok(!validTimeZone('x'.repeat(129)));
});
test('calendar dates remain the same day across timezone choices with unambiguous date ordering',()=>{
 for(const zone of ['UTC','Pacific/Kiritimati','America/Los_Angeles']){
  assert.equal(formatDate('2026-01-02','en',{...REGION_DEFAULTS,timeZone:zone}),'2026-01-02');
  assert.equal(formatDate('2026-01-02','en',{...REGION_DEFAULTS,timeZone:zone,dateOrder:'dmy'}),'02/01/2026 (DMY)');
  assert.equal(formatDate('2026-01-02','en',{...REGION_DEFAULTS,timeZone:zone,dateOrder:'mdy'}),'01/02/2026 (MDY)');
 }
 assert.equal(formatDate('2024-02-29'),'2024-02-29');assert.equal(formatDate('2026-02-30'),'2026-02-30');assert.equal(formatDate('100 mg/dL'),'100 mg/dL');
});
test('only timestamps with an explicit timezone are converted; local wall-clock records retain their values',()=>{
 const p={...REGION_DEFAULTS,timeZone:'America/New_York'};
 assert.equal(formatDateTime('2026-01-02T00:15','en',p),'2026-01-02 00:15');
 assert.equal(formatDateTime('2026-01-02T00:15:31.250','en',p),'2026-01-02 00:15:31.250');
 assert.equal(formatDateTime('2026-01-02T00:15:00Z','en',p),'2026-01-01 19:15 GMT-5');
 assert.equal(formatDateTime('2026-07-02T00:15:00Z','en',p),'2026-07-01 20:15 GMT-4');
 assert.equal(formatDateTime('not a timestamp','en',p),'not a timestamp');assert.equal(formatDateTime('2026-01-02T28:15','en',p),'2026-01-02T28:15');
 for(const invalid of ['2026-02-30T12:30:00Z','2026-01-02T24:15:00Z','2026-01-02T00:15:00+24:00'])assert.equal(formatDateTime(invalid,'en',p),invalid);
});
test('numbering changes presentation counts only and preserves clinical strings verbatim',()=>{
 const p={...REGION_DEFAULTS,numbering:'locale'};assert.match(formatDate('2026-01-02','ar-EG-u-nu-arab',p),/[٠-٩]/);assert.equal(formatDate('2026-01-02','ar',REGION_DEFAULTS),'2026-01-02');
 for(const clinical of ['1.2 mg/dL','1,2 mmol/L','١٫٢ mg/dL','120/70','2026-02-30'])assert.equal(formatQuantity(clinical,'ar',p),clinical);
 assert.equal(formatQuantity(1234.5,'en'), '1,234.5');
});
test('paper selection changes document display metadata only and validates supported sizes',()=>{
 const doc={documentElement:{dataset:{}}};assert.equal(applyPaperSize(doc,{...REGION_DEFAULTS,paper:'Letter'}),'Letter');assert.equal(doc.documentElement.dataset.wardnotePaper,'Letter');
 assert.equal(applyPaperSize(doc,REGION_DEFAULTS),'A4');assert.equal(doc.documentElement.dataset.wardnotePaper,'A4');
 assert.throws(()=>validateRegionPreferences({...REGION_DEFAULTS,paper:'A3'}));
});

test('regional UI labels have complete localized entries and no Chinese fallback outside Chinese',()=>{
 const source=readFileSync(new URL('../public/region-ui.js',import.meta.url),'utf8')+readFileSync(new URL('../public/region-settings.js',import.meta.url),'utf8');
 const labels=[...new Set([...source.matchAll(/(?:t|Error)\('([^']*[\u4e00-\u9fff][^']*)'\)/g),...source.matchAll(/select\('[^']+','([^']*[\u4e00-\u9fff][^']*)'/g)].map(m=>m[1]))];
 assert.ok(labels.length>=16);
 for(const [code,dictionary] of Object.entries(dictionaries))for(const key of labels){assert.ok(Object.hasOwn(dictionary,key),code+': missing '+key);assert.ok(!/[\u4e00-\u9fff]/.test(dictionary[key]),code+': Chinese fallback '+key);}
});
