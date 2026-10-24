// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {t,locale} from './i18n.js';
import {REGION_DEFAULTS,TIME_ZONES,regionPreferences,saveRegionPreferences,resolvedTimeZone,formatDateTime,formatQuantity,applyPaperSize} from './region-settings.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=(key,label,choices,value)=>`<div class="field"><label for="region-${key}">${esc(t(label))}</label><select id="region-${key}" data-region-setting="${key}">${choices.map(([id,text])=>`<option value="${esc(id)}" ${id===value?'selected':''}>${esc(text)}</option>`).join('')}</select></div>`;
export function regionPanel(){
 const p=regionPreferences(),zones=[['device',t('跟随设备时区')+' · '+resolvedTimeZone(REGION_DEFAULTS)],...TIME_ZONES.map(z=>[z,z])];
 if(p.timeZone!=='device'&&!TIME_ZONES.includes(p.timeZone))zones.push([p.timeZone,p.timeZone]);
 const example=formatDateTime('2026-10-21T12:34:00Z',locale(),p);
 return `<section class="panel region-panel" id="region-settings"><details class="fold"><summary>${t('地区与显示')}</summary><p class="muted">${t('仅调整本机显示；不会修改记录日期、临床数字或单位。')}</p><div class="field-grid">${select('dateOrder','日期顺序',[['ymd',t('年-月-日 (YMD)')],['dmy',t('日-月-年 (DMY)')],['mdy',t('月-日-年 (MDY)')]],p.dateOrder)}${select('timeZone','显示时区',zones,p.timeZone)}${select('numbering','数字显示',[['latn',t('拉丁数字 0–9')],['locale',t('跟随界面语言')]],p.numbering)}${select('paper','打印纸张',[['A4','A4'],['Letter','Letter']],p.paper)}</div><p>${t('显示示例')}：<bdi class="region-example" id="region-example">${esc(example)}</bdi> · <bdi>${esc(formatQuantity(1234.5,locale(),p))}</bdi></p><p class="muted">${t('未注明时区的记录保留原时间；日期输入控件由系统决定。')}</p><p class="muted">${t('显示日历采用公历；打印纸张仍需在打印窗口核对。')}</p><details class="fold region-font-check"><summary>${t('离线字体检查')}</summary><p class="muted">${t('若下列文字显示为方框或断开，请使用支持该文字的系统字体。')}</p><div class="region-font-samples"><p lang="ar" dir="rtl">العربية · عرض النص</p><p lang="ur" dir="rtl">اردو · متن کی نمائش</p><p lang="hi" dir="ltr">हिन्दी · पाठ प्रदर्शन</p><p lang="ru" dir="ltr">Русский · отображение текста</p></div><p class="muted">${t('仅检查文字显示，不代表临床译文已审校。')}</p></details></details></section>`;
}
export function setupRegions({refresh=()=>{},notice=()=>{},beforeChange=async()=>true}={}){
 applyPaperSize();let changing=false;
 const onChange=async event=>{
  const target=event.target?.closest?.('[data-region-setting]');if(!target)return;
  const key=target.dataset.regionSetting,previous=regionPreferences(),value=target.value;
  if(!Object.hasOwn(REGION_DEFAULTS,key))return;
  if(changing){target.value=previous[key];return;}changing=true;target.disabled=true;
  try{if(await beforeChange()===false){target.value=previous[key];return;}const next=saveRegionPreferences({[key]:value});applyPaperSize(undefined,next);await refresh();const fold=document.querySelector('#region-settings>details');if(fold)fold.open=true;notice(t('显示设置已保存。'));}
  catch(error){target.value=regionPreferences()[key];notice(t(error.message),true);}
  finally{changing=false;if(target.isConnected)target.disabled=false;}
 };
 document.addEventListener('change',onChange);
 return ()=>document.removeEventListener('change',onChange);
}
