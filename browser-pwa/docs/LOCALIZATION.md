# Language support

WardNote 0.6.15 provides Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu interfaces. The selector uses each language's own name. Arabic and Urdu use right-to-left layout; Hindi uses left-to-right layout. System fonts are used without external font requests.

The implementation follows the Headache Diary project's shared language registry, complete translation catalogs, original-text preservation, independent report direction and desktop/mobile verification approach. Each of the seven translated catalogs covers the same program-owned source keys. Missing keys fail automated checks rather than silently falling back to English. UI structure and field identifiers stay identical across languages.

## Three separate settings

- **Interface language** changes navigation, labels, hints, states, errors and print headings. It is remembered on this browser. Switching first saves pending edits; if saving fails, the language and draft stay in place.
- **Report language** defaults to preserving the source. The eight specific target languages require a configured text-model service and explicit submission. Results remain unreviewed candidates. The model provider's actual language quality is not established by UI tests. Local summaries save the language of their generated labels; existing summaries retain their text and reading direction when the interface changes.
- **Speech language** remains a separate validated integration contract: automatic detection, Chinese or English. Eight interface/report choices do not establish speech recognition support in eight languages. Other speech languages require adapter validation before exposure in the selector.

User-entered clinical text, names, laboratory values, doses, dates, source transcripts, saved reports and exported data are never automatically translated when the interface changes. Mixed-language records and imported records can therefore legitimately contain several languages. Local heading-based classification recognizes template headings in all eight languages and retains the original text; this is not medical semantic understanding.

## Review status and extension

Translations and the clinical glossary are **experimental drafts**. They have not been signed off by native-speaking clinicians. The shared registry records this status explicitly. [Translation review sheet](translation-review.csv) contains the source strings and seven translations, with blank reviewer/date columns for a documented review. Particular priorities include negation, uncertainty, serious versus critical illness, allergy/reaction terminology, consent, summaries and handoff instructions.

To add or update a locale, update the registry, catalog and application-shell assets together. Preserve HTML markup and source keys, avoid translating interpolated record content, regenerate localized manifests and the review sheet, and run core and browser suites. Browser-native date, file and password controls follow the browser/operating-system language. Technical identifiers such as FHIR, JSON and provider names remain identifiers.

## Verification boundary

Automated checks verify catalog parity, markup, original-text preservation, field routing, report metadata, cache inclusion and mocked model requests. Isolated synthetic browser tests exercise all eight languages at desktop and 390-pixel mobile widths, including form ordering, assistive panels, printing and language persistence. These checks establish implementation behavior, not clinical accuracy or external speech/model performance. See [validation results](VALIDATION.md) for the release-specific run.

The Settings & Help reference notice uses the same eight-language source metadata as [PROJECT-NOTICE.md](PROJECT-NOTICE.md). Copyright is attributed to Junhui Liu M.D. without changing the license. Source addresses are copyable plain text in the app: viewing or expanding this panel makes no external request and remains available offline. New translations remain review drafts.

Sign-in and Settings & Help share the same collapsible getting-started guide as [GETTING-STARTED.md](GETTING-STARTED.md). All eight languages distinguish available browser/Windows entry points, deployment prerequisites and pending physical-device/PWA validation. Viewing the guide makes no network request and does not change stored data.

## Region display / 地区显示（0.6.15）

Interface language and regional settings are independent. The local settings panel offers YMD/DMY/MDY, display time zone, Latin or language-default display digits, and A4/Letter. Only timestamps with a stored offset are converted to the selected zone; calendar dates and timezone-free clinical times retain their recorded meaning. Lab values, units, drug doses, identifiers, original text and exports are never automatically converted. Font samples permit a manual readability check without downloading a font.

语言与地区偏好分开设置，不从语言推定所在国家或临床制度。日期格式保留顺序标记；时区只用于有时区的时间戳。纸张选择用于 App 打印，不改动原始 Word 模板。新增界面文案已补齐八语言；母语临床语义、真实设备字体和纸质打印质量仍待体验验证。

## 0.6.15 device guidance

The pre-login and Settings device-entry panel and the offline start page cover all eight interface languages, including Arabic/Urdu RTL. The Windows launcher and administrator-facing deployment wizard use Chinese and English. Native browser installation prompts retain the operating system/browser language; native clinical review remains pending.

Update checks, availability/error notices and safety guards use the same eight-language UI catalogs. The getting-started document explains manual checks, saved-work/recording protection and the older-page migration limit in each language. Catalog completeness does not substitute for native clinical review.
