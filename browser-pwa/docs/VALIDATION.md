# Validation status / 验证状态

Version **0.6.15** · 2026-10-21 (Asia/Shanghai).

UI 修订 r1：备忘区顺序统一为“文字备忘 → 开始录音 → 导入录音”。本次定向重跑现有备忘流程 11 项全部通过，包含八语言、390px/RTL、录音和数据保留。下列全量结果仍归属于此前 0.6.15 完整验证，本次未重复全量测试。

UI patch r1: memo actions now follow Text memo → Start recording → Import audio. All 11 existing memo workflow checks passed again, including eight languages, 390px/RTL, recording and preservation. Full-suite results below retain their preceding 0.6.15 run attribution; this layout patch did not repeat the full suite.

本轮通过 **167 项核心/API/发布检查与 21 套流程中的 320 项浏览器检查**，包含 23 项更新专项和 15 项更新单元检查（后者计入 167 项）。独立源码交付包再次运行全部 167 项核心/API/发布检查，全部通过。检查全部使用虚构账号、病例和模拟音频；无未捕获页面错误，无更新流程外部请求。

**167 core/API/publication checks and 320 browser checks across 21 suites** passed, including 23 update workflow checks and 15 update unit checks (included in the core total). All 167 core/API/publication checks also passed from an independently packaged source copy. All accounts, cases and microphone input were synthetic; no uncaught page errors or external update-flow requests occurred.

验证范围：长时间打开后的前台/定时检测、登录/设置手动检查、稍后提醒、过期 HTTP 缓存、候选缓存完整性与重新下载、保存失败、录音及完成保存、异步待办、未完成弹窗/备份、多个窗口、意外激活不刷新、断网、兼容回退及旧版无更新界面的迁移。更新前后记录、核对及来源状态保持一致，音频内容哈希相同，联网授权不被开启。八语言提示检查包括 390px 和 RTL；standalone 仅为浏览器显示模式模拟。

Covered: foreground/periodic discovery, login/settings manual checks, Later reminder, stale HTTP cache, candidate completeness/re-download, failed saves, capture/finalization, pending task writes, unfinished forms/backups, multiple windows, unsolicited activation, offline use, compatible rollback and legacy migration. Records, review/provenance and audio hashes remained equal; connectivity authorization stayed off. Eight-language notice checks include 390px and RTL; standalone display was emulated only.

初轮测试的两处文档版本引用和缓存命名后缀假设已修正并复验。录音测试改为显式等待并核对当前录音片段，避免测试提前停止采集；“稍后”测试先展开提示再应用。未把这些测试时序问题描述为临床录音数据丢失，也未降低最终内容及哈希断言。

Physical devices, installed PWAs, native clinical review and hospital deployment remain future evaluation. No actual GitHub publication or public deployment is part of this work.

## Previous release evidence / 既往版本证据 — 0.6.14

Version **0.6.14** · 2026-10-21 (Asia/Shanghai).

UI patch r2: the memo entry now uses the same localized “Start recording” label as the voice panel. The existing voice-memo and main-browser suites were rerun for this change (11 + 38 checks); the 309-check full-run totals below remain attributed to the preceding 0.6.14 verification. No recording, consent, storage or transcription behavior was changed.

**158 core/API/publication checks, 158 independently packaged-source checks, and 309 browser checks across 21 suites** passed with no uncaught browser errors. All cases, accounts and audio were synthetic. No existing patient workspace was used.

Windows 5.1 launcher checks cover repeat launches, folder/process ownership, fixed-origin conflicts, failure cleanup and explicit stop confirmation. The graphical panel was rendered and inspected; the final portable package is rehearsed separately with an isolated data directory. This does not establish compatibility with every Windows configuration.

The exported static PWA was checked for account creation, note saving, explicit-consent synthetic recording, offline reload/replay, encrypted segmented backup verification and restore. Static UI and network client gates prevent unavailable API calls, including stale authorization states. The offline administrator wizard downloads a valid Caddyfile. Official Caddy 2.11.7, checked against its official SHA-512 list, parsed the generated configuration; it was not installed as a service, and no host, certificate or domain was created.

八语言引导覆盖登录前和设置页，保留已填账号与密码；桌面、390px 与 RTL 布局通过。安装请求取消及完成后没有残留无效入口。分享仅保留可信 HTTPS 程序地址，剔除路径、查询、片段及凭据；不分享患者或账号信息。

初轮回归发现旧测试仍断言固定8787地址，已按实际来源地址修正并重跑。Windows测试修正了PowerShell5.1读取无BOM中文JSON和测试管道继承；重复安装入口已修复并定向复验。环境沙箱导致的本机端口访问/目录连接失败不计作通过，隔离测试获准后重新执行。没有把既往版本验证改记为本轮证据。

Source packaging uses **182 explicit public files**. Source, Windows portable and static PWA ZIPs each have SHA-256 sidecars and internal per-file manifests. The portable runtime remains verified Node.js 24.19.0, with its complete original license; SHA verification is not independent release-signature verification.

Physical phones and installed PWAs, background/lock-screen recording, low-resource hardware, native clinical translation review, hospital HTTPS/certificate setup and clinical benefit remain future evaluation. The user plans post-publication voluntary fictional-case feedback. No actual GitHub publication or public deployment occurred. Existing data/private configuration and C-drive templates are preserved.

[Easy deployment](EASY-DEPLOYMENT.md) · [Evidence](VALIDATION-RESULTS.json) · [Remaining verification](RELEASE-CHECKLIST.md)

## Previous release evidence / 既往版本证据

# Validation status / 验证状态

Version **0.6.13** · 2026-10-21 (Asia/Shanghai).

Current: **140 core/API/publication checks**, **140 independently packaged-source checks**, and **283 browser checks across 19 suites**, with zero page errors. All clinical records, users and microphone audio used in tests were synthetic. No production patient workspace or external model was used.

本轮新增设备与当前版本完整离线资源检查、独立本机写读探针、未知容量/空间预警、录音及导入容量保护；备份提供下载、文件夹写入、重新核验分开记录，外来或过期快照不误标当前账号。地区日期/时区/数字仅改显示，A4与Letter的真实PDF页面尺寸已验证。八语言及390px界面检查通过，包含乌尔都语RTL与临床原文保留。

Review found and repaired pending microphone requests surviving cancellation/patient switching, capture state sticking after recorder-start or wake-lock errors, and malformed legacy timestamps being interpreted as HTML. New browser tests cover each case. Critical capacity now ends capture and preserves existing and final audio chunks; saving errors retain recovery prompts. These checks do not certify continuous real-microphone recording or arbitrary storage capacity.

Windows PowerShell 5.1 launched the current 0.6.13 package with its verified bundled Node 24.19.0 and no external Node in PATH; synthetic account/record creation, stop, restart and login preserved the record. Eleven portable core checks include path/checksum protections and refusal to silently reuse another running version. The source package contains 162 allowlisted files. Runtime provenance and the full original Node license accompany the separate Windows x64 package. SHA-256 verification is not a claim of independent release-signature verification.

现有15套浏览器流程完整回归，新增4套；安全更新、兼容资源回退、备份恢复及账号隔离全部通过。初轮失败来自尚未完成的文档/清单、旧打印按钮测试名称及测试清理步骤，已修正并重跑；未把失败运行计为通过。既往大容量合成备份和0.6.11/0.6.12服务回退演练保留原版本归属，本轮没有重跑，不冒充0.6.13新增证据。

Physical phones and installed PWAs, native pickers/printers/fonts, real low-memory/battery/audio behavior, native clinical language review, institutional deployment and clinical benefit remain future evaluation. The owner intends to invite voluntary fictional-case feedback after separate publication authorization. No GitHub repository was published. Existing records, private configuration and C-drive templates are preserved.

[Infrastructure choices](INFRASTRUCTURE.md) · [Machine-readable evidence](VALIDATION-RESULTS.json) · [Remaining verification](RELEASE-CHECKLIST.md) · [Feedback](EVALUATION.md)

## Previous release evidence / 既往版本证据

# Validation status / 验证状态

Version **0.6.12** · 2026-10-18 (Asia/Shanghai).

Current release: **112 core/API/publication checks**, **112 independently packaged-source checks**, and **236 browser checks across 15 suites**, with no uncaught page errors. All patients, accounts and audio were synthetic; no production patient workspace or external model was used.

安全更新覆盖首次准备、下载后等待、保存失败/录音/未完成表单/备份忙碌/其他窗口阻断、下载中断、兼容资源回退与旧版关闭全部页面后的迁移。原有 13 套浏览器工作流完整回归，新增更新和分卷备份两套。额外界面证据检查新增提示的八语言桌面、390px与RTL布局；译文仍待母语临床审校。

已复现并修复恢复最终保存后账号目录登记失败/关闭页面时的登录边界；无旧工作区及存在未绑定旧工作区两种情况均通过实际登录界面恢复，旧资料保留，错误密码不回退绑定。分卷备份覆盖清单和各卷校验、密码、缺卷/重复/混卷/损坏、模式隔离、不覆盖已有账号、存储失败、关闭页面中断、清理未发布暂存、取消导出、快照锁以及实际多文件选择恢复流程。另一次大容量合成数据演练：**482.25 MiB 原始数据、243片段、3条录音**，形成 **643.15 MiB 加密备份、42卷及1份清单**，最大卷15.84 MiB，导出、恢复及再核验通过。未据此声称真实长时录音或低内存设备通过。

Actual **0.6.11 → 0.6.12 → 0.6.11** Windows launcher/server rehearsal used isolated personal/institution encrypted databases. Records, revisions and audio hashes remained identical; health/start/stop checks passed. Browser resource rollback was checked separately. Do not restore an old patient backup over newer records merely to roll back program files. Legacy 0.6.11 pages must be individually closed before reopening the updated version.

首次针对性验证发现并修正更新提示的内联样式与内容安全策略冲突；旧版迁移演练也明确了逐一关闭旧页面后再重开这一条件。分卷下载与“已落盘”区分，需重新选择文件核验；原生文件选择器的系统语言不受网页语言控制。测试工具初次失败保留在工作记录中，不计作通过。

Physical devices, installed standalone PWAs, native folder pickers, low-resource memory/battery limits, clinical translations, hospital deployment and hosted CI remain unverified. Those checks move to voluntary fictional-case feedback after separate publication authorization; no GitHub repository was published. Independent offline text use remains the core; speech and institutional connections stay optional.

[Usage](OFFLINE-AND-ACCOUNTS.md) · [Machine-readable evidence](VALIDATION-RESULTS.json) · [Remaining validation](RELEASE-CHECKLIST.md) · [Feedback](EVALUATION.md).

## Previous release evidence / 既往版本证据

The following entries are historical, with their original versions and test counts. The historical 0.6.12 evidence above records 147 public source files and 15 browser suites. The former 600 MiB backup-file limit applies to legacy single-file backups; 0.6.12 multipart backup and its verified scope are described above.

以下为旧版验证记录，保留原版本及测试数量。上述 0.6.12 历史验证记录为 147 份公开文件、15 套浏览器测试；旧版 600 MiB 限制仅适用于旧格式单文件备份，0.6.12 分卷备份及验证范围见上文。

# Validation status / 验证状态

Version **0.6.11** · 2026-10-18 (Asia/Shanghai).

Current release: **106 core/API/publication checks**, **106 independently packaged-source checks**, and **211 browser checks across 13 suites**, with zero uncaught page errors. Test patients, accounts, data and microphone input were synthetic; no production patient workspace or external model was used.

新增验证覆盖床位数字排序、在院/出院范围、搜索及无匹配、保留当前分区、切换前保存、保存失败阻止切换、录音中阻断、交接待办复用、完成失败还原勾选、完成后旧SBAR失效、来源直达原记录、八语言及390px/RTL布局、真正断网重载和注销。

首次新增浏览器检查中的失败注入步骤使用了“勾选成功”的自动断言，与预期“保存失败后还原勾选”冲突；改为真实点击后验证还原，最终九项新增流程全部通过。十二套既有浏览器测试也完整通过。界面截图经查看；没有将测试工具的首次失败记作通过。

These additions reuse existing records rather than a second task database or team platform. Existing source-version checks, manual clinician review and default offline operation remain in place. The future roadmap records optional phrases, speech and institutional adapters; those capabilities are not claimed as implemented.

[Workflow](CONTINUITY.md) · [Demonstration](DEMO.md) · [Machine-readable evidence](VALIDATION-RESULTS.json) · [Remaining validation](RELEASE-CHECKLIST.md).

Physical devices, installed standalone PWAs, native clinical translation review, hospital deployment and hosted CI remain unverified. No GitHub repository was published. Launcher rehearsals from 0.6.9 remain historical, not newly claimed device certification.

## Previous release evidence / 既往版本证据

# Validation status / 验证状态

Version **0.6.10** · 2026-10-18 (Asia/Shanghai).

Current release: **105 core/API/publication checks**, **105 packaged-source checks**, and **202 browser checks across 12 suites**, with zero uncaught browser errors. All cases, accounts and audio fixtures were synthetic. No external speech/model service or actual patient record was used.

新增连续查房验证覆盖：同日记录排序、前后字段与空白差异、更新时间范围、来源查看、SBAR 原文/否定/不确定性保留、待办责任与期限、编辑撤销核对、来源元数据保护、另一页面新增/更新来源的阻断、复制前二次版本检查、保存失败重试、历史版本、八语言与390px布局、真正断网重载、患者切换与注销。

旧“上一条查房”入口已与新对照合并。首次回归发现重复内容导致旧浏览器检查定位不唯一；另有新增测试在复制/历史对话框完成前读取结果的等待问题。修正后完整重跑全部十二套，而非仅重跑失败步骤。

Comparison is a view of currently saved versions, not a reconstruction of an earlier clinical state. SBAR is literal assembly, not medical inference; omitted laboratories/memos must be checked manually. It reuses summary revision/review handling. Local review/copy does not constitute formal institutional handoff or EHR entry.

See [usage](CONTINUITY.md), [synthetic screenshots](DEMO.md), [machine-readable evidence](VALIDATION-RESULTS.json) and [follow-up validation](RELEASE-CHECKLIST.md). Previous Windows launcher and extracted-backup rehearsals below are historical 0.6.9 evidence; physical-device, clinical and hospital acceptance are not implied. New source packaging is independently checked in this release.

## Previous release evidence / 既往版本证据

# Validation status / 验证状态

Date: 2026-10-18 (Asia/Shanghai). Version: **0.6.9**, local evaluation pre-release, pre-publication closeout.

The current closeout passed **94 core/API/publication checks**, **94 independently packaged-source checks** and **190 browser workflow checks across all eleven existing suites**, with no uncaught browser errors. This includes recording and voice routing, accounts, briefs, source evidence, auxiliary panels, eight-language layouts, offline recovery and cross-page/device consistency. No production service or real microphone was used.

本轮完整运行现有测试，另核对当前版本、账号隔离及服务端共享范围说明，并生成六张中英文虚构演示截图。截图生成未访问外部服务。八语言开始使用说明的折叠、桌面与 390 px 布局、脱机可用性均通过；当前译文仍待母语临床审校。应用运行代码、数据结构、默认脱机和人工核对行为未修改。

Windows launchers passed start/status/guide asset/stop checks under Windows PowerShell 5 and PowerShell 7 using isolated ports/data and preinstalled Node.js; automatic browser opening was suppressed. Extracted-source launch is checked separately. This does not validate installing Node.js on a new computer, physical phones, installed standalone PWAs, hospital HTTPS or continuous background/lock-screen recording.

The first restricted-environment attempt was blocked by loopback/junction permissions; it was not treated as a product pass or defect. The complete suite was rerun in an approved isolated environment. All fixtures were fictional. See [machine-readable evidence](VALIDATION-RESULTS.json), [demonstration](DEMO.md) and [follow-up checklist](RELEASE-CHECKLIST.md).

The earlier same-version guidance update passed 94 core, 94 package and 65 browser checks; it is retained under previousSameVersionCheck. Earlier 0.6.8 and 0.6.7 evidence remains under previousRelease without relabeling.

## Historical 0.6.3 heading follow-up / 标题微调

2026-10-17: the daily heading is now “评估与计划” / “Assessment and Plan”, with equivalent concise labels in all eight interfaces. Thirteen existing localization/worksheet tests passed. A focused browser check verified all eight headings, unchanged stored clinical text and the unchanged initial-history heading, with no page errors. The full suites were not repeated for this wording-only update.

## Historical 0.6.3 task count follow-up / 待办计数说明

2026-10-17: the daily task shortcut now explicitly identifies unfinished items, e.g. “待办与待回报 · 未完成 1 项”. Counting remains scoped to the selected encounter and includes open tasks from earlier dates. Thirteen existing localization/worksheet tests passed; a synthetic browser check verified all eight labels, counts 0/1/2, exclusion of completed tasks and other encounters, and no horizontal overflow at 390 px. No full-suite rerun was performed for this wording-only follow-up.

## Feature verification history

- **0.6.7 recording and dictation routing:** the exact checked-confirmation/blank-details failure was reproduced, then passed with details explicitly optional. Missing permission has an actionable message and creates no empty recording. All eight template heading languages, adjacent headings, unknown lines, original negatives and uncertainty, edited candidate review reset, exact source quotes, atomic local/server append, incomplete lab rejection, failed-save retry, stale targets/sources, duplicate submission, offline recovery and switching patients during an ASR request are covered. Existing drafts are preserved on automatic transcription completion; users choose when to load another transcript. No real microphone, external vendor, offline ASR or Dragon integration was validated.

- **0.6.6 voice memos:** the new Voice input button works without an initial/daily note. Offline capture retains original audio and returns to memos. Explicitly authorized recognition uses a local mock service in tests; no real provider was called. Creating a separate text memo requires clinician review and retains a transcript/source snapshot. Cancellation, retry after failed storage, recognition errors, source navigation, patient isolation, eight languages and offline persistence pass. Editing a reviewed text memo clears its review marker. This does not add offline ASR or validate real speech accuracy.

- **0.6.5 registration follow-up (2026-10-18):** the local registration form has one account field; new workspaces use the normalized account name as the recorder label. Existing workspace and history attribution remain unchanged. All nine browser suites (143 groups), 84 core checks and 84 packaged-source checks passed. The account and localization suites specifically verify the simplified form and preserved legacy attribution. This follow-up records a cross-device account design in the roadmap; it does not implement a shared server identity or account-scoped server sync.

- **0.6.5 local accounts:** create/login with username and password, normalized duplicate rejection, wrong-password handling, user and mode isolation, mandatory sign-out across tabs, offline reload, restore into a new account, and original-password binding of legacy workspaces pass. Binding preserves existing records and wrapped encryption keys. Tests use fictional users; no real user was created or migrated during release. Local usernames do not provide hospital SSO or server-side staff roles.

- **0.6.5 full memo section:** text and audio controls now use the existing records below the patient brief; the duplicate floating entry is removed. Clinical-note autosave preserves the audio element and playback; collapsing memos pauses audio. Existing import/recovery, review, excerpt, transcription and download workflows pass. Mobile tests explicitly close a floating tool before interacting with the page beneath it.

- **0.6.4 patient brief:** local four-field extraction preserves exact negatives and uncertainty; source snapshots, date/version navigation, expand/collapse, manual editing, failed-save retry, explicit clinician review and history pass. Editing clears review; a changed/new meaningful source blocks review of the old brief. Regeneration requires confirmation. The full memo section uses existing records and independent review. Eight-language desktop/mobile UI, genuine offline reload/edit/review and patient/logout isolation pass. No external model was called.

- **0.6.3 record tools:** a single voice entry, modal edge drawer with focus restoration, teaching-toggle field preservation, failed-save draft export/retry, selected-note history, eight-language desktop/mobile direction, offline reload and cross-page logout. A deterministic delayed permission-read fixture checks the logout race.

- **0.6.2 source evidence and ward workflow:** exact-quote validation, unsupported-source rejection, medication/negation/source-subject preservation, optional ASR segments, malformed-response retention, ambiguous/edited-text timestamp fallback, source replay, candidate edit deselection, saved insertion evidence, pre-round review, task completion/reopen and offline export pass with fictional input. Source matching is not a clinical truth check.

- **Offline and persistence:** initial setup makes no API calls; ciphertext excludes clinical sentinels/passwords; offline reload and complete persistent-browser restart require local unlock and preserve records. Concurrent stale edits are rejected. Saved interrupted audio can be recovered and actually played; the recovery fixture is a short WAV. Encrypted backups restore records/audio into an empty matching-mode workspace; wrong passwords leave the target empty.
- **Account and connection boundaries:** personal/institution passwords and data are independent on device and server; another tab cannot log in to the opposite mode until logout. Reusing the local unlock password is rejected without an API call. Wrong network passwords leave the device offline. Cancelled authorization and restored connectivity upload no clinical data. Storage failure cannot prevent immediate revocation of connection permission.
- **Authorization delivery:** encrypted pending queues, mode-specific mock endpoints, credential/clinical-field exclusion, failed-receiver retries and accepted-event idempotency pass. Backlogs exceeding 100 events are submitted in batches. Real destinations remain unconfigured; queued events are never labeled delivered. HTTP acceptance is not proof of email inbox delivery or completed database processing.
- **Manual synchronization:** patient selection and confirmation precede transfer; audio is unchecked by default. Unselected patients and private learning/candidate drafts are excluded. Preview writes no clinical records. Commit rechecks versions, encounter references and audio hashes atomically; conflicting existing audio is not overwritten. Changes during conflict review are rejected.
- **Clinical workflow:** existing notes, backgrounds, tasks, trends, source review, summaries, patient participation, reflection, export, A4 and retention flows pass against device storage. Failed-save navigation and language changes preserve drafts. Simulated microphone capture, chunk retry, playback and independent excerpts pass. Models remain manually requested; candidates require review.
- **Eight-language UI:** Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu login/errors, forms, hints, panels, printing, connection dialogs, reports, discharge reminders and desktop/390px layouts pass. Language switching does not rewrite authored clinical text. Native clinical translation review remains pending.

## Historical environment and publication / 既往环境与发布检查

Tests used Node.js 24.19.0, managed Playwright 1.62.1 and installed Google Chrome on Windows. The unchanged dependency lock was used; a fresh npm installation was not repeated. Historical installation and earlier-release evidence retain their original version/date in the JSON report. Temporary data and browser profiles were confined to D-drive staging.

In the historical 0.6.9 rehearsal, PowerShell 7 and Windows PowerShell 5 started the application on isolated ports/data directories, returned version 0.6.9, served the guide module and stopped the verified test process. Node.js was already available; automatic browser opening was suppressed. That release checked **129 allowlisted source files**, relative documentation links, version/license consistency, private-file exclusion, refusal to overwrite output and SHA-256 manifests. Its CI configuration included eleven browser suites and synthetic failure evidence. Local core, browser and independently packaged-source checks passed for that release; these are not the current file or suite counts.

CI requests Windows/Linux/macOS core checks and Linux Chromium UI checks. **GitHub-hosted CI has not run; no repository or Release has been published by this work.** Local testing is not cross-platform certification.

## Historical limitations / 既往限制

A narrow desktop viewport is not a physical-phone or standalone installed-PWA test. Hospital HTTPS, device policies, microphone interruptions, lock-screen/background recording and full 20-minute or shift-length capture remain unvalidated. No offline ASR, passkey/biometric or QR authorization is implemented. The legacy single-file backup reader has a 600 MiB limit. Version 0.6.12 adds multipart backup and verified synthetic recovery as described above; actual long-duration capture and device-capacity validation remain pending.

These results do not establish ASR accuracy, institutional identity/access certification, EHR/LIS interoperability, independent security certification, clinical benefit or educational effectiveness. Authorization events are supporting records, not independently attested hospital audit evidence. See [offline/account limits](OFFLINE-AND-ACCOUNTS.md) and the [evaluation plan](EVALUATION.md).
