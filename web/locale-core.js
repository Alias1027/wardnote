// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {EN} from './translations.js';
import ar from './locales/ar.js';
import fr from './locales/fr.js';
import ru from './locales/ru.js';
import es from './locales/es.js';
import hi from './locales/hi.js';
import ur from './locales/ur.js';
export const dictionaries=Object.freeze({en:EN,ar,fr,ru,es,hi,ur});
const escapeRegex=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp(Object.keys(EN).sort((a,b)=>b.length-a.length).map(escapeRegex).join('|'),'g');
// Call only on program-owned labels/messages, never on interpolated record values.
export function isolateNumericRanges(value,code){
 if(!['ar','ur'].includes(code)||/[<>]/.test(value))return value;
 return value.replace(/\d+(?:\.\d+)?(?:\s*[-–—→/:]\s*\d+(?:\.\d+)?)+/g,range=>'\u2066'+range+'\u2069');
}
export function translate(text,code='zh'){
 const source=String(text??''),dictionary=dictionaries[code];
 if(!dictionary)return source;
 if(Object.hasOwn(dictionary,source))return isolateNumericRanges(dictionary[source],code);
 return source.replace(pattern,key=>isolateNumericRanges(dictionary[key]??key,code));
}
