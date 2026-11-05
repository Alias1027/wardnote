import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHEMAS,REFLECTION_FIELDS,clinicalRecords,TEMPLATE_REVISION} from '../public/domain.js';
import {validate} from '../public/record-validation.js';
import {dictionaries,translate} from '../public/locale-core.js';

test('V007 prompts cover source checking, follow-up ownership and reflective learning in every language',()=>{
 assert.equal(TEMPLATE_REVISION,'V007');
 const hint=(type,key)=>SCHEMAS[type].find(row=>row[0]===key)[2];
 for(const phrase of ['采样日期','单位','原报告','通知','处理','复评','负责人'])assert.ok(hint('initial','results').includes(phrase));
 for(const phrase of ['用药','随访','患者理解','负责人','联系','时限'])assert.ok(hint('daily','discharge').includes(phrase));
 assert.ok(hint('daily','handoff').includes('接收人／时间'));
 assert.ok(hint('background','updates').includes('患者或照护者核对事实'));
 assert.deepEqual(REFLECTION_FIELDS.map(row=>row[0]),['reason','concern','next','feedback']);
 for(const [code,dictionary] of Object.entries(dictionaries)){
  for(const fields of [...Object.values(SCHEMAS),REFLECTION_FIELDS])for(const [,label,prompt] of fields){
   assert.doesNotMatch(translate(label,code),/[\u3400-\u9fff]/,code+':'+label);
   assert.doesNotMatch(translate(prompt,code),/[\u3400-\u9fff]/,code+':'+prompt);
  }
  assert.ok(dictionary['复盘日期（可选）']);assert.ok(dictionary['包括教学提示']);assert.ok(dictionary['包括住院背景']);
 }
});

test('optional review dates preserve old records, reject invalid dates and stay outside clinical exports',()=>{
 const legacy={title:'Synthetic reflection',date:'2026-11-01',reason:'Original judgment',concern:'Uncertainty',next:'Review',feedback:''};
 const before=JSON.stringify(legacy);validate('reflection',legacy);assert.equal(JSON.stringify(legacy),before);assert.equal(legacy.reviewDate,undefined);
 for(const reviewDate of ['', '2026-11-05','2028-02-29'])validate('reflection',{...legacy,reviewDate});
 for(const reviewDate of ['2026-02-29','2026-11-31','invalid','2026-1-01'])assert.throws(()=>validate('reflection',{...legacy,reviewDate}),/复盘日期无效/);
 assert.equal(clinicalRecords([{type:'reflection',data:{...legacy,reviewDate:'2026-11-05'}}]).length,0);
});
