import {formatDateTime} from './region-settings.js';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {t,locale} from './i18n.js';
import {BRIEF_FIELDS,currentBrief,briefStale,briefHasContent} from './patient-brief.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(action,label,id='',disabled=false)=>`<button type="button" class="btn small quiet" data-action="${action}" data-id="${esc(id)}" ${disabled?'disabled':''}>${esc(t(label))}</button>`;
export const briefTime=s=>formatDateTime(s,locale());
const time=s=>`<bdi>${esc(briefTime(s))}</bdi>`;
export function renderBriefCard(records,id,folds={}){
 const r=currentBrief(records,id),d=r?.data,stale=briefStale(r,records);
 const state=!r?'暂无摘要':stale?'摘要待更新':d.review?'医生已复核':'待医生复核';
 const body=BRIEF_FIELDS.map(([key,label])=>{const value=d?.fields[key]||'',long=value.length>160||value.split('\n').length>4;return `<div class="brief-item"><h3>${esc(t(label))}</h3><div class="brief-value ${long?'brief-long':''}"><p dir="auto" class="brief-preview">${esc(value||t('未填写'))}</p>${long?`<details><summary>${esc(t('展开全文'))}</summary><p dir="auto">${esc(value)}</p></details>`:''}</div></div>`;}).join('');
 return `<section class="patient-brief" id="patient-brief"><details class="brief-fold" data-brief-fold="summary" ${folds.summary===false?'':'open'}><summary><strong>${esc(t('患者摘要'))}</strong><span class="pill ${r&&!stale&&d.review?'teal':'amber'}" data-brief-status>${esc(t(state))}</span></summary>${r?`<div class="brief-metadata"><span>${esc(t('来源记录更新至'))} ${time(d.recordedThrough)}</span><span>${esc(t('生成时间'))} ${time(d.generatedAt)}</span>${d.review?`<span>${esc(t('上次核对'))} ${time(d.review.time)} · <bdi>${esc(d.review.clinician)}</bdi></span>`:''}${d.manuallyEdited?`<span>${esc(t('人工修改'))} · ${time(r.updatedAt)}</span>`:''}</div>${stale?`<p class="brief-warning">${esc(t('来源记录已更新，请重新汇总并核对。'))}</p>`:''}<div class="brief-grid">${body}</div>`:`<p class="review-note">${esc(t('本地提取已有记录，生成后请逐项核对。'))}</p>`}<div class="actions brief-actions">${button('brief-generate',r?'重新生成摘要':'生成摘要',r?.id)}${r?button('brief-edit','编辑摘要',r.id)+button('brief-verify','医生核对',r.id,stale||!briefHasContent(d))+button('brief-sources','查看来源',r.id)+button('history','修改历史',r.id):''}</div></details></section>`;
}
export function briefSourcesContent(r,records){
 const label=s=>s?.type==='task'?t('待办'):s?.type==='background'?t('初诊与背景'):s?.kind==='initial'?t('初诊'):t('查房');
 return `<p class="review-note">${esc(t('人工修改不回写来源；新增内容请核实。'))}</p>`+BRIEF_FIELDS.map(([key,title])=>`<section class="brief-source-group"><h3>${esc(t(title))}</h3>${r.data.entries.filter(e=>e.key===key).map(e=>{const s=r.data.sources.find(s=>s.id===e.sourceId),now=records.find(x=>x.id===e.sourceId&&x.encounterId===r.encounterId);return `<article><small>${esc(label(s))} · <bdi>${esc(s.date)}</bdi> · ${esc(t('来源版本'))} <bdi>${s.version}</bdi> · ${time(s.updatedAt)} · ${esc(t(s.reviewed?'已复核':'待核对'))}</small><blockquote dir="auto">${esc(e.text)}</blockquote>${now?button('brief-open-source','查看当前记录',now.id):''}</article>`;}).join('')||`<p class="muted">${esc(t('暂无可引用来源，可手动补充摘要。'))}</p>`}</section>`).join('');
}
