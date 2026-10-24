// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
export const LANGUAGES = Object.freeze({
 zh:{native:'简体中文',locale:'zh-CN',dir:'ltr',model:'Simplified Chinese'},
 en:{native:'English',locale:'en',dir:'ltr',model:'English'},
 es:{native:'Español',locale:'es',dir:'ltr',model:'Spanish'},
 fr:{native:'Français',locale:'fr',dir:'ltr',model:'French'},
 ru:{native:'Русский',locale:'ru',dir:'ltr',model:'Russian'},
 ar:{native:'العربية',locale:'ar',dir:'rtl',model:'Modern Standard Arabic'},
 hi:{native:'हिन्दी',locale:'hi',dir:'ltr',model:'Hindi'},
 ur:{native:'اردو',locale:'ur',dir:'rtl',model:'Urdu'}
});
export const languageCodes=Object.freeze(Object.keys(LANGUAGES));
export const isLanguage=code=>Object.hasOwn(LANGUAGES,code);
export const isReportLanguage=code=>code==='original'||isLanguage(code);
// Interface/report coverage does not imply a validated speech adapter.
export const speechLanguages=Object.freeze(['zh','en']);
export const isSpeechLanguage=code=>speechLanguages.includes(code);
export const glossaryStatus=Object.freeze({version:'0.1.0',status:'experimental-draft',reviewer:null,reviewDate:null});
export const localeAssets=[...languageCodes.filter(c=>!['zh','en'].includes(c)).map(c=>`/locales/${c}.js`),...languageCodes.map(c=>`/manifest-${c}.webmanifest`)];
