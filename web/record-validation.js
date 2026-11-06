import {validInputMode} from './voice-conversation.js';
import {BRIEF_FIELDS} from './patient-brief.js';
import {isLanguage} from './languages.js';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {SCHEMAS} from './domain.js';
import {validProblemReference,problemReferenceState} from './continuity.js';
import {validSampleTime} from './worksheet-ui.js';
import {isReportLanguage} from './languages.js';
export class RecordError extends Error {constructor(status,message){super(message);this.status=status;}}
export const editable=new Set(['encounter','note','lab','task','summary','reflection','background','review','resolution','memo','voiceDraft','brief']);
// Backups may retain a literal snapshot after its source is removed. A supplied
// source ID must nevertheless belong to the same encounter, including tombstones.
export function validateTaskReferences(records,contextRecords=records){
  for(const r of records){if(r.type!=='task'||r.data?.problemRef==null)continue;const ref=r.data.problemRef;
    if(!validProblemReference(ref)||ref.encounterId!==r.encounterId)throw new RecordError(400,'关联问题格式或患者归属不正确');
    if(contextRecords.some(source=>source.id===ref.noteId&&(source.encounterId!==r.encounterId||source.type!=='note'||!['initial','daily'].includes(source.data?.kind))))throw new RecordError(400,'关联问题格式或患者归属不正确');
  }
}
export function validate(type,d,encounterId,records,previousData) {
  if(!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>250000) throw new RecordError(400,'记录格式或大小不正确');
  if(type==='brief') {
    const keys=new Set(BRIEF_FIELDS.map(([k])=>k));
    if(d.format!=='wardnote-brief/1'||!d.fields||BRIEF_FIELDS.some(([k])=>typeof d.fields[k]!=='string'||d.fields[k].length>50000)||!isLanguage(d.labelLanguage)||!Number.isFinite(Date.parse(d.generatedAt))||!Array.isArray(d.sources)||!Array.isArray(d.entries))throw new RecordError(400,'摘要需要文字内容');
    if(d.sources.some(x=>!x||typeof x.id!=='string'||!Number.isInteger(x.version)||x.version<1)||new Set(d.sources.map(x=>x.id)).size!==d.sources.length||d.entries.some(x=>!keys.has(x.key)||typeof x.text!=='string'||typeof x.path!=='string'||!d.sources.some(s=>s.id===x.sourceId)))throw new RecordError(400,'记录格式或大小不正确');
  }
  if(type==='encounter'&&(!d.displayName?.trim()||!d.admitted)) throw new RecordError(400,'请填写患者称呼和入院 / 就诊日期');
  if(type==='note'&&(!SCHEMAS[d.kind]||d.kind==='background'||!/^\d{4}-\d{2}-\d{2}$/.test(d.date)||!d.fields||!Array.isArray(d.problems))) throw new RecordError(400,'查房记录结构不正确');
  if(type==='lab'){
    if(!d.name?.trim()||!String(d.value??'').trim()||!d.unit?.trim()||!d.source?.trim())throw new RecordError(400,'检验需要项目、结果、单位、采样时间和来源');
    if(d.sampleTimeUnknown!==undefined&&typeof d.sampleTimeUnknown!=='boolean')throw new RecordError(400,'采样时间状态无效');
    if(d.sampleTimeUnknown===true){if(d.sampledAt||d.date||d.verified)throw new RecordError(400,'时间不详的检查请保留空白时间，并在核实前保持待核对');}
    else if(!validSampleTime(d.sampledAt)||d.date&&d.date!==d.sampledAt.slice(0,10))throw new RecordError(400,'请填写真实采样时间，或明确选择时间不详');
  }
  if(type==='memo'&&(!d.title?.trim()||typeof d.text!=='string'))throw new RecordError(400,'备忘需要标题和内容');
  if(type==='voiceDraft'&&(!validInputMode(d.inputMode)||typeof d.text!=='string'||!isReportLanguage(d.language)||!Array.isArray(d.proposals)))throw new RecordError(400,'语音草稿格式无效');
  if(type==='encounter'&&d.acuity&&!['stable','watch','urgent','serious','critical'].includes(d.acuity))throw new RecordError(400,'病情状态无效');
  if(type==='reflection'&&d.reviewDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(d.reviewDate)||!Number.isFinite(Date.parse(d.reviewDate+'T00:00:00Z'))||new Date(d.reviewDate+'T00:00:00Z').toISOString().slice(0,10)!==d.reviewDate))throw new RecordError(400,'复盘日期无效');
  if(type==='task'&&!d.title?.trim()) throw new RecordError(400,'待办事项不能为空');
  if(type==='task'&&d.problemRef!=null&&(!validProblemReference(d.problemRef)||encounterId!==undefined&&d.problemRef.encounterId!==encounterId))throw new RecordError(400,'关联问题格式或患者归属不正确');
  if(type==='task'&&d.problemRef!=null&&records){
    const task={type,encounterId,data:d};validateTaskReferences([task],records);
    if(JSON.stringify(d.problemRef)!==JSON.stringify(previousData?.problemRef)&&problemReferenceState(task,records,encounterId).state!=='current')throw new RecordError(409,'关联来源已变化，请重新选择问题。');
  }
  if(type==='summary'&&typeof d.text!=='string') throw new RecordError(400,'摘要需要文字内容');
}
