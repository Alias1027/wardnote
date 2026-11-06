// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {roundChanges,roundFeedback,problemReferenceState} from './continuity.js';
import {SCHEMAS,PROBLEM_FIELDS} from './domain.js';
import {t,locale} from './i18n.js';
import {formatDate} from './region-settings.js';
import {briefTime} from './patient-brief-ui.js';
import {labSampleTime} from './worksheet-ui.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>'<bdi>'+esc(briefTime(s))+'</bdi>';
const label=r=>t(r.type==='note'?(r.data.kind==='daily'?'查房':'初诊'):({task:'待办',lab:'检查与化验',background:'初诊与背景',memo:'备忘',recording:'语音备忘',encounter:'患者信息'})[r.type]||'记录');
const sourceButton=r=>'<button type="button" class="btn small quiet" data-action="continuity-source" data-id="'+esc(r.id)+'">'+esc(t('查看来源'))+'</button>';
const stamp=r=>label(r)+' · '+(r.type==='lab'?(labSampleTime(r.data)?esc(formatDate(labSampleTime(r.data).slice(0,10),locale())):t('采样时间待核实')):esc(formatDate(r.data.date||'',locale())))+' · '+t('来源版本')+' '+r.version+' · '+time(r.updatedAt);
const value=s=>'<p dir="auto" class="continuity-value">'+esc(s||t('未录入；请核实并补充。'))+'</p>';
const problems=r=>(r.data.problems||[]).map(p=>PROBLEM_FIELDS.filter(([k])=>p[k]).map(([k,l])=>t(l)+': '+p[k]).join('\n')).join('\n\n');
export function taskProblemHTML(task,records){
 const state=problemReferenceState(task,records),ref=state.reference;
 if(state.state==='none')return '';
 if(!ref)return '<p class="review-note">'+t('关联来源不可用')+'</p>';
 const title='<span dir="auto">'+esc(ref.problem.title)+'</span>';
 return '<details class="fold task-problem-link"><summary>'+t('关联问题')+' · '+title+(state.state==='current'?'':' · '+t('待核对'))+'</summary><small>'+t('关联时的来源')+' · '+esc(formatDate(ref.noteDate,locale()))+' · '+t('来源版本')+' '+ref.sourceVersion+' · '+time(ref.sourceUpdatedAt)+'</small>'+(state.state==='current'?'':'<p class="review-note">'+t(state.state==='changed'?'关联来源已变化，请重新选择问题。':'关联来源不可用')+'</p>')+[['assessment','当前判断 / 状态'],['plan','主要计划'],['monitor','预期反应 / 监测与复核']].filter(([key])=>ref.problem[key]).map(([key,name])=>'<h4>'+t(name)+'</h4>'+value(ref.problem[key])).join('')+(state.source?sourceButton(state.source):'')+'</details>';
}
export function feedbackCard(records,id,noteId){
 const feedback=roundFeedback(records,id,noteId);
 if(!feedback.previous||!feedback.plans.length&&!feedback.linked.length)return '';
 const plans=feedback.plans.map(p=>'<article><strong dir="auto">'+esc(p.title||t('未命名问题'))+'</strong><h4>'+t('主要计划')+'</h4>'+value(p.plan)+'<h4>'+t('预期反应 / 监测与复核')+'</h4>'+value(p.monitor)+'</article>').join('');
 const outcomes=feedback.linked.map(({task,state,reference})=>'<article class="linked-feedback"><strong dir="auto">'+esc(task.data.title)+'</strong><p>'+t('关联问题')+' · <span dir="auto">'+esc(reference.problem.title)+'</span> · '+t(task.data.done?'已完成':'待跟进')+'</p>'+taskProblemHTML(task,records)+'<h4>'+t('结果 / 完成依据')+'</h4>'+value(task.data.outcome)+'<small>'+t('记录更新时间')+' · '+time(task.updatedAt)+'</small>'+sourceButton(task)+'</article>').join('');
 return '<details class="fold round-feedback"><summary>'+t('上次计划与结果反馈')+'</summary><p class="review-note">'+t('对照此前计划与实际反馈，在本次评估中记录判断变化；待办完成不代表临床问题已解决。')+'</p>'+plans+'<h4>'+t('已关联的待办反馈')+'</h4>'+(outcomes||'<p>'+t('暂无关联反馈；可在待办中选择对应问题。')+'</p>')+'</details>';
}
export function changesCard(records,id,noteId,open=false){
 const d=roundChanges(records,id,noteId),fields=SCHEMAS.daily;
 const missing=fields.filter(([k])=>typeof d.current?.data.fields?.[k]!=='string'||!d.current.data.fields[k].trim()).map(([,l])=>t(l));
 const rows=d.fields.map(f=>'<article class="continuity-change"><h4>'+esc(t(fields.find(([k])=>k===f.key)?.[1]||f.key))+'</h4><div class="continuity-columns"><div><small>'+t('此前记录')+'</small>'+value(f.before)+'</div><div><small>'+t('本次记录')+'</small>'+value(f.after)+'</div></div></article>').join('');
 return '<details class="fold continuity-panel previous-note" id="round-changes" '+(open?'open':'')+'><summary>'+t('自上次查房以来的变化')+'</summary><p class="review-note">'+t('比较当前保存的记录版本；文字差异不等于病情变化，未录入不代表正常或无变化。')+'</p>'+(d.previous?'<div class="continuity-columns"><div>'+stamp(d.previous)+sourceButton(d.previous)+'</div><div>'+stamp(d.current)+sourceButton(d.current)+'</div></div>'+feedbackCard(records,id,noteId)+rows+(d.problemsChanged?'<article><h4>'+t('评估与计划')+'</h4><div class="continuity-columns"><div><small>'+t('此前记录')+'</small>'+value(problems(d.previous))+'</div><div><small>'+t('本次记录')+'</small>'+value(problems(d.current))+'</div></div></article>':'')+(!rows&&!d.problemsChanged?'<p>'+t('已填写内容未见文本差异；不能据此判断病情无变化。')+'</p>':'')+'<details class="fold"><summary>'+t('期间新增或更新的资料')+' · '+d.events.length+'</summary><p class="review-note">'+t('按录入或更新时间筛选，非临床发生时间；起点为前次记录建立时间。')+' '+time(d.from)+' — '+time(d.to)+'</p>'+d.events.map(({record:r,added})=>'<article><strong>'+t(added?'新增记录':'更新记录')+' · '+label(r)+'</strong><p dir="auto">'+esc(r.data.title||r.data.name||r.data.date||'')+'</p><small>'+stamp(r)+'</small>'+sourceButton(r)+'</article>').join('')+'</details>':'<p>'+t('暂无更早查房记录，不能判断变化。')+'</p>')+(missing.length?'<p class="review-note">'+t('本次尚未录入')+': '+esc(missing.join(' · '))+'</p>':'')+'</details>';
}
export function sourceContent(r){
 let body='';
 if(r.type==='note'||r.type==='background'){body=(SCHEMAS[r.data.kind]||SCHEMAS.background).filter(([k])=>r.data.fields?.[k]).map(([k,l])=>'<h3>'+t(l)+'</h3>'+value(r.data.fields[k])).join('');if(r.type==='note')body+=value(problems(r));}
 else {const keys=r.type==='lab'?[['name','项目'],['value','原始结果'],['unit','单位'],['sampledAt','采样 / 检查时间'],['source','来源']]:r.type==='task'?[['title','待办'],['owner','负责人'],['due','到期时间'],['next','下一步 / 联系方式'],['outcome','结果 / 完成依据']]:r.type==='encounter'?[['displayName','姓名 / 研究代号'],['bed','床位'],['caseId','本次住院 / 就诊标识'],['codeStatus','复苏医嘱状态 / Code status'],['allergySummary','重要过敏 / 反应'],['precautions','隔离 / 防护及原因']]:[['title','标题'],['text','备忘'],['memo','语音备忘']];body=keys.filter(([k])=>r.data[k]).map(([k,l])=>'<h3>'+t(l)+'</h3>'+value(r.data[k])).join('');}
 if(r.type==='lab'&&!labSampleTime(r.data))body='<p class="review-note">'+t('采样时间待核实')+'</p>'+body;
 const status=r.type==='task'?(r.data.done?'已完成':'待跟进'):r.type==='lab'?(r.data.verified&&labSampleTime(r.data)?'原报告已核对':'待核对'):r.type==='note'?(r.data.review?'已复核':'待核对'):null;
 const canOpen=['note','background','task','lab','memo','recording','encounter'].includes(r.type);
 return '<p>'+stamp(r)+(status?' · '+t(status):'')+'</p>'+body+(canOpen?'<button type="button" class="btn small" data-action="brief-open-source" data-id="'+esc(r.id)+'">'+t('打开原始记录')+'</button>':'');
}
export function handoffSources(r){return '<p class="review-note">'+t('人工修改不回写来源；新增内容请核实。')+'</p>'+r.data.sources.map((s,i)=>'<article><h3>['+(i+1)+'] '+esc(s.date)+'</h3><small>'+t('来源版本')+' '+s.version+' · '+time(s.updatedAt)+' · '+t(s.reviewed?'已复核':'待核对')+'</small>'+r.data.sourceEntries.filter(e=>e.sourceId===s.id).map(e=>'<h4>'+esc(t(e.label))+'</h4>'+value(e.text)).join('')+'<button class="btn small quiet" type="button" data-action="continuity-source" data-id="'+esc(s.id)+'">'+t('查看当前记录')+'</button></article>').join('');}
