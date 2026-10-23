// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {androidText,overrides} from './android-strings.js';
import {translate} from './locale-core.js';
import {LANGUAGES,isLanguage,languageCodes,speechLanguages} from './languages.js';
export {LANGUAGES,languageCodes};
let current='zh';
try{const saved=globalThis.localStorage?.getItem('wardnote-language');if(isLanguage(saved))current=saved;}catch{}
export const language=()=>current;
export const locale=()=>LANGUAGES[current].locale;
export const t=text=>overrides[text]?androidText(overrides[text],current):translate(text,current);
export function setLanguage(value){
 if(!isLanguage(value))throw new Error('Unsupported language');
 current=value;
 try{globalThis.localStorage?.setItem('wardnote-language',value);}catch{}
 if(globalThis.document){
  document.documentElement.lang=LANGUAGES[value].locale;document.documentElement.dir=LANGUAGES[value].dir;
  document.title=`${t('循记临床')} · ${t('临床连续照护')}`;
  document.querySelector('meta[name=description]')?.setAttribute('content',t('初诊与住院查房工作区'));
  document.querySelector('link[rel=manifest]')?.setAttribute('href',`/manifest-${value}.webmanifest`);
 }
}
// Translate literals only. Never translate interpolated clinical values.
export function ui(strings,...values){return strings.reduce((out,part,i)=>out+t(part)+(i<values.length?values[i]:''),'');}
export function languageName(value){return LANGUAGES[value]?.native||t(value==='auto'?'自动识别':'保留原文');}
export function reportLanguages(original=true){return [[original?'original':'auto',t(original?'保留原文':'自动识别')],...(original?languageCodes:speechLanguages).map(code=>[code,LANGUAGES[code].native])];}
export const reportDirection=data=>LANGUAGES[data.language==='original'?data.labelLanguage:data.language]?.dir||'auto';
export function languageButton(){return `<label class="language-picker"><span class="sr-only">${t('界面语言')}</span><select class="language-select" data-ui-language aria-label="${t('界面语言')}">${languageCodes.map(code=>`<option value="${code}" lang="${LANGUAGES[code].locale}" dir="${LANGUAGES[code].dir}" ${code===current?'selected':''}>${LANGUAGES[code].native}</option>`).join('')}</select></label>`;}
setLanguage(current);
const loading=globalThis.document?.querySelector('.loading');if(loading)loading.textContent=t('正在打开工作区…');
