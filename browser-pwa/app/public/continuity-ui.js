// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {roundChanges} from './continuity.js';
import {SCHEMAS,PROBLEM_FIELDS} from './domain.js';
import {t,locale} from './i18n.js';
import {formatDate} from './region-settings.js';
import {briefTime} from './patient-brief-ui.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>'<bdi>'+esc(briefTime(s))+'</bdi>';
const label=r=>t(r.type==='note'?(r.data.kind==='daily'?'查房':'初诊'):({task:'待办',lab:'检查与化验',background:'初诊与背景',memo:'备忘',recording:'语音备忘',encounter:'患者信息'})[r.type]||'记录');
const sourceButton=r=>'<button type="button" class="btn small quiet" data-action="continuity-source" data-id="'+esc(r.id)+'">'+esc(t('查看来源'))+'</button>';
const stamp=r=>label(r)+' · '+esc(formatDate(r.data.date||'',locale()))+' · '+t('来源版本')+' '+r.version+' · '+time(r.updatedAt);
const value=s=>'<p dir="auto" class="continuity-value">'+esc(s||t('未录入；请核实并补充。'))+'</p>';
const problems=r=>(r.data.problems||[]).map(p=>PROBLEM_FIELDS.filter(([k])=>p[k]).map(([k,l])=>t(l)+': '+p[k]).join('\n')).join('\n\n');
export function changesCard(records,id,noteId,open=false){
 const d=roundChanges(records,id,noteId),fields=SCHEMAS.daily;
 const missing=fields.filter(([k])=>typeof d.current?.data.fields?.[k]!=='string'||!d.current.data.fields[k].trim()).map(([,l])=>t(l));
 const rows=d.fields.map(f=>'<article class="continuity-change"><h4>'+esc(t(fields.find(([k])=>k===f.key)?.[1]||f.key))+'</h4><div class="continuity-columns"><div><small>'+t('此前记录')+'</small>'+value(f.before)+'</div><div><small>'+t('本次记录')+'</small>'+value(f.after)+'</div></div></article>').join('');
 return '<details class="fold continuity-panel previous-note" id="round-changes" '+(open?'open':'')+'><summary>'+t('自上次查房以来的变化')+'</summary><p class="review-note">'+t('比较当前保存的记录版本；文字差异不等于病情变化，未录入不代表正常或无变化。')+'</p>'+(d.previous?'<div class="continuity-columns"><div>'+stamp(d.previous)+sourceButton(d.previous)+'</div><div>'+stamp(d.current)+sourceButton(d.current)+'</div></div>'+rows+(d.problemsChanged?'<article><h4>'+t('评估与计划')+'</h4><div class="continuity-columns"><div><small>'+t('此前记录')+'</small>'+value(problems(d.previous))+'</div><div><small>'+t('本次记录')+'</small>'+value(problems(d.current))+'</div></div></article>':'')+(!rows&&!d.problemsChanged?'<p>'+t('已填写内容未见文本差异；不能据此判断病情无变化。')+'</p>':'')+'<details class="fold"><summary>'+t('期间新增或更新的资料')+' · '+d.events.length+'</summary><p class="review-note">'+t('按录入或更新时间筛选，非临床发生时间；起点为前次记录建立时间。')+' '+time(d.from)+' — '+time(d.to)+'</p>'+d.events.map(({record:r,added})=>'<article><strong>'+t(added?'新增记录':'更新记录')+' · '+label(r)+'</strong><p dir="auto">'+esc(r.data.title||r.data.name||r.data.date||'')+'</p><small>'+stamp(r)+'</small>'+sourceButton(r)+'</article>').join('')+'</details>':'<p>'+t('暂无更早查房记录，不能判断变化。')+'</p>')+(missing.length?'<p class="review-note">'+t('本次尚未录入')+': '+esc(missing.join(' · '))+'</p>':'')+'</details>';
}
export function sourceContent(r){
 let body='';
 if(r.type==='note'||r.type==='background'){body=(SCHEMAS[r.data.kind]||SCHEMAS.background).filter(([k])=>r.data.fields?.[k]).map(([k,l])=>'<h3>'+t(l)+'</h3>'+value(r.data.fields[k])).join('');if(r.type==='note')body+=value(problems(r));}
 else {const keys=r.type==='lab'?[['name','项目'],['value','原始结果'],['unit','单位'],['sampledAt','采样 / 检查时间'],['source','来源']]:r.type==='task'?[['title','待办'],['owner','负责人'],['due','到期时间'],['next','下一步 / 联系方式'],['outcome','结果 / 完成依据']]:r.type==='encounter'?[['displayName','姓名 / 研究代号'],['bed','床位'],['caseId','本次住院 / 就诊标识'],['codeStatus','复苏医嘱状态 / Code status'],['allergySummary','重要过敏 / 反应'],['precautions','隔离 / 防护及原因']]:[['title','标题'],['text','备忘'],['memo','语音备忘']];body=keys.filter(([k])=>r.data[k]).map(([k,l])=>'<h3>'+t(l)+'</h3>'+value(r.data[k])).join('');}
 const status=r.type==='task'?(r.data.done?'已完成':'待跟进'):r.type==='lab'?(r.data.verified?'原报告已核对':'待核对'):r.type==='note'?(r.data.review?'已复核':'待核对'):null;
 const canOpen=['note','background','task','lab','memo','recording','encounter'].includes(r.type);
 return '<p>'+stamp(r)+(status?' · '+t(status):'')+'</p>'+body+(canOpen?'<button type="button" class="btn small" data-action="brief-open-source" data-id="'+esc(r.id)+'">'+t('打开原始记录')+'</button>':'');
}
export function handoffSources(r){return '<p class="review-note">'+t('人工修改不回写来源；新增内容请核实。')+'</p>'+r.data.sources.map((s,i)=>'<article><h3>['+(i+1)+'] '+esc(s.date)+'</h3><small>'+t('来源版本')+' '+s.version+' · '+time(s.updatedAt)+' · '+t(s.reviewed?'已复核':'待核对')+'</small>'+r.data.sourceEntries.filter(e=>e.sourceId===s.id).map(e=>'<h4>'+esc(t(e.label))+'</h4>'+value(e.text)).join('')+'<button class="btn small quiet" type="button" data-action="continuity-source" data-id="'+esc(s.id)+'">'+t('查看当前记录')+'</button></article>').join('');}
