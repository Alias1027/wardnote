// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Presentation preferences only. Do not use these functions to rewrite clinical values.
export const REGION_KEY='wardnote-region-display-v1';
export const REGION_DEFAULTS=Object.freeze({dateOrder:'ymd',timeZone:'device',numbering:'latn',paper:'A4'});
export const TIME_ZONES=Object.freeze(['UTC','Asia/Shanghai','Asia/Kolkata','Asia/Karachi','Asia/Riyadh','Africa/Cairo','Africa/Nairobi','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow','America/New_York','America/Chicago','America/Los_Angeles','America/Sao_Paulo','Australia/Sydney']);
const orders=Object.freeze({ymd:['year','month','day'],dmy:['day','month','year'],mdy:['month','day','year']});
function browserStorage(){try{return globalThis.localStorage;}catch{return null;}}
export function validTimeZone(value){if(value==='device')return true;if(typeof value!=='string'||!value||value.length>128)return false;try{new Intl.DateTimeFormat('en',{timeZone:value}).format(0);return true;}catch{return false;}}
export function validateRegionPreferences(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||!Object.hasOwn(orders,value.dateOrder)||!validTimeZone(value.timeZone)||!['locale','latn'].includes(value.numbering)||!['A4','Letter'].includes(value.paper))throw new Error('地区显示设置无效。');
 return Object.freeze({dateOrder:value.dateOrder,timeZone:value.timeZone,numbering:value.numbering,paper:value.paper});
}
export function regionPreferences(storage=browserStorage()){
 try{const raw=storage?.getItem(REGION_KEY);return raw?validateRegionPreferences(JSON.parse(raw)):REGION_DEFAULTS;}catch{return REGION_DEFAULTS;}
}
export function saveRegionPreferences(changes,storage=browserStorage()){
 const value=validateRegionPreferences({...regionPreferences(storage),...changes});
 if(!storage?.setItem)throw new Error('显示设置未保存，请允许本机存储后重试。');
 try{storage.setItem(REGION_KEY,JSON.stringify(value));}catch{throw new Error('显示设置未保存，请允许本机存储后重试。');}
 return value;
}
export function resolvedTimeZone(preferences=regionPreferences()){
 return preferences.timeZone==='device'?(Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'):preferences.timeZone;
}
function safeLocale(value){try{return Intl.getCanonicalLocales(value||'en')[0]||'en';}catch{return 'en';}}
function displayDigits(value,language,preferences){
 if(preferences.numbering==='latn')return value;
 const f=new Intl.NumberFormat(safeLocale(language),{useGrouping:false});
 return value.replace(/[0-9]/g,d=>f.format(Number(d)));
}
function dateParts(value){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);if(!m)return null;
 const [year,month,day]=m.slice(1).map(Number);if(year<1||month<1||month>12||day<1)return null;
 const date=new Date(0);date.setUTCFullYear(year,month-1,day);date.setUTCHours(0,0,0,0);
 if(date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==day)return null;
 return {year:m[1],month:m[2],day:m[3]};
}
function orderedDate(parts,language,preferences){
 const order=orders[preferences.dateOrder]||orders.ymd,separator=preferences.dateOrder==='ymd'?'-':'/';
 const value=order.map(k=>parts[k]).join(separator);
 return displayDigits(value,language,preferences)+(preferences.dateOrder==='ymd'?'':` (${preferences.dateOrder.toUpperCase()})`);
}
// A clinical calendar date is not an instant: never pass it through timezone conversion.
export function formatDate(value,language='en',preferences=regionPreferences()){
 if(value===null||value===undefined||value==='')return '—';const text=String(value),parts=dateParts(text);
 return parts?orderedDate(parts,language,preferences):text;
}
export function formatDateTime(value,language='en',preferences=regionPreferences()){
 if(value===null||value===undefined||value==='')return '—';const text=String(value);
 if(dateParts(text))return formatDate(text,language,preferences);
 // datetime-local fields carry no timezone. Preserve the original wall-clock value.
 const local=/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(\.\d+)?)?$/.exec(text);
 if(local){if(!dateParts(local[1])||Number(local[2])>23||Number(local[3])>59||Number(local[4]||0)>59)return text;return `${formatDate(local[1],language,preferences)} ${displayDigits(local[2]+':'+local[3]+(local[4]?':'+local[4]:'')+(local[5]||''),language,preferences)}`;}
 const instant=/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|([+-])(\d{2}):(\d{2}))$/i.exec(text);
 if(!(value instanceof Date)&&(!instant||!dateParts(instant[1])||Number(instant[2])>23||Number(instant[3])>59||Number(instant[4]||0)>59||Number(instant[7]||0)>23||Number(instant[8]||0)>59))return text;
 const date=value instanceof Date?value:new Date(text);if(!Number.isFinite(date.getTime()))return text;
 const formatter=new Intl.DateTimeFormat('en-US-u-ca-gregory-nu-latn',{timeZone:resolvedTimeZone(preferences),year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZoneName:'shortOffset'});
 const parts=Object.fromEntries(formatter.formatToParts(date).map(p=>[p.type,p.value]));
 return `${orderedDate(parts,language,preferences)} ${displayDigits(parts.hour+':'+parts.minute,language,preferences)} ${parts.timeZoneName}`;
}
// Use only for application-owned counts/sizes, not lab values, doses or source text.
export function formatQuantity(value,language='en',preferences=regionPreferences()){
 if(typeof value!=='number'||!Number.isFinite(value))return String(value??'—');
 return new Intl.NumberFormat(safeLocale(language),{maximumFractionDigits:2,...(preferences.numbering==='latn'?{numberingSystem:'latn'}:{})}).format(value);
}
export function applyPaperSize(doc=globalThis.document,preferences=regionPreferences()){
 if(doc?.documentElement)doc.documentElement.dataset.wardnotePaper=preferences.paper;
 return preferences.paper;
}
