# Android development work log

2026-10-23 — Self-check 0.1.1 completed: 10/10 core tests, 16/16 desktop Chromium integration checks, 3/3 persistent-profile upgrade checks, and 41 JS syntax checks passed. Reproduced and fixed dismissing the modal during native encrypted audio import; close controls and cancel events now respect active submission. Manual file import now uses patient display and checkbox confirmation with optional notes and guards account/patient context across asynchronous reads and writes. Verified failed autosaves retain input and block native Back backgrounding. Old/new desktop asset restart preserves both account modes, histories and 18 MiB synthetic audio, with exact multi-part backup restore. These are desktop/mock checks, not Android device tests.

0.1.1 package: versionCode 2, same application ID and signing certificate as retained 0.1.0 (versionCode 1). APK 492219 bytes, SHA-256 6d4872cc8a42ab3b742eb1d83c6ab63c878689e67276c3b6e8d26453d7472118. All 57 packaged assets match; v2/v3 signature and alignment passed; no Android permissions. 55 browser/PWA source files, 3 frozen packages and 35 previous Android delivery files remain hash-identical. No existing patient data or C: template was accessed or modified. True Android installation/upgrade, OEM recorder/SAF behavior and clinical validation remain pending.

Debug evidence: baseline desktop network access was blocked by the sandbox and rerun with approved loopback access. Two test-harness issues were corrected: clinical-tab navigation after the learning view, and counting local blob audio metadata reads as external network traffic. The manual import test also exposed the unmarked mandatory-note mismatch, now replaced by explicit patient/recording confirmation. No production data was used.

User asked about well-known public skills during closeout. Reviewed original Google Android, Trail of Bits and Anthropic repositories; recorded four scoped candidates in docs/SKILLS-ROADMAP.md. No candidate installed and no remote scripts executed. Existing diagnosing-bugs workflow was used; no third-party audit or certification is claimed.

Closeout: bilingual documentation, validation, build/update instructions and quick-start updated. New source/APK/checksums and this log are delivered separately as Android-offline-preview-0.1.1. Previous Android/browser/PWA deliveries remain retained. Final source and delivery hashes are recorded in source-package-verification.json and DELIVERY-CHECK.json. Only owned test profiles, extracted test baseline and build intermediates are eligible for cleanup; SDK and private signing key remain on D:. No repository or public release created.

2026-10-23 — Self-check/debug round started for Android 0.1.1-preview. Scope: first-use offline bootstrap, eight-language UI, recorder return/manual import, encrypted backup/restore and update preservation. Work uses isolated synthetic profiles; original browser/PWA, frozen releases, existing data and C: templates remain excluded. Baseline 7 core tests pass. Initial browser run was blocked by sandbox loopback access (environment failure); rerun with approved local-test access. Current work adds cancellation/interruption and upgrade regression coverage before applying fixes. No real-device/clinical validation or publication planned.

2026-10-23 — Started Android offline preview in an isolated workspace. Base: WardNote 0.6.15 UI r1. Existing browser/PWA, frozen ZIP files, patient data and C: templates are preserved. Scope: packaged first-use offline UI, eight languages, system-recorder delegation/import, existing encrypted backup formats. Cloud sync, iOS, real-device/clinical validation are deferred. Build dependencies and caches stay on D:. Current step: implementation and build prerequisites; no APK yet.

Implementation checkpoint — Added native packaged WebView shell, secure local asset interception, no network/microphone/storage permissions, system recorder intent + SAF imports/exports, context-bound encrypted audio import, native backup file read-back verification, eight-language Android instructions and offline-only profile. Core adapter checks: 7 passed. Initial APK compiled/signed/verified; final rebuild pending. Independent review fixed Android OS-upgrade storage-directory drift, renderer recovery, generic MIME and extension handling, and actual EOF validation. Browser bridge simulations are in progress; no Android emulator/device or clinical validation performed.

Final implementation checkpoint — 2026-10-23: 7/7 core adapter tests and 12/12 desktop Chromium checks passed; all 41 JavaScript modules passed syntax checking. The Chromium run uses a deterministic native bridge double, not an Android emulator or phone. It checks eight-language/RTL UI, context-bound audio import, no-recorder fallback, encrypted byte preservation, forward/reverse browser backup compatibility (legacy + segmented), missing/tampered/wrong-password backup rejection, wrong account mode and existing-account preservation. Original 55 web files and three frozen packages remain byte-identical. Patient data and C: templates were not accessed or modified.

Final APK compiled with official Android SDK tools; 57 bundled web assets match source. APK v2/v3 signatures, alignment, no requested Android permissions, disabled automatic backup/debug/cleartext and SHA-256 passed. Android version 0.1.0-preview (base Web 0.6.15 UI r1), package org.wardnote.offline.preview, 492218 bytes, SHA-256 2bb1dbeef8a23f9d56c2645adcf10355c9df21b5c58bedfaa92cba26ceb8b192. Preview signing key remains private outside project; preserve it for compatible updates. No GitHub publication or repository creation.

Scope still pending: emulator/physical Android installation, real OEM recorder and SAF-provider round trips, process-loss/OS-update/data upgrade runs, Android 15 inset/keyboard rendering, long audio on low-resource phones, native-language clinical review and clinical validation. Cloud sync and speech recognition are future work; iOS/Apple are excluded. External recorder/file providers may retain or sync their own copies. System recording originals are never automatically deleted.

Cleanup: removed owned build intermediates, empty test-profile staging, superseded failure screenshot and one-time adapter scripts. Separately removed 326.7 MiB of verified tool download archives; kept D: SDK/JDK and private signing material for reproducible updates. Frozen releases, existing data and C: templates preserved.

Delivery preparation: signed APK, public source archive, bilingual README, Android quick start, validation/roadmap/build notes, checksums and evidence logs are being assembled in a separate Android-offline-preview-0.1.0 delivery directory. Existing browser/PWA and frozen releases remain the primary unchanged baseline; no repository created and no publication performed.

Delivery synchronized — Android-offline-preview-0.1.0 was created under the requested D: delivery folder. It contains the signed preview APK, source ZIP, bilingual instructions, quick start, test evidence and checksum sidecars. No existing delivery file was overwritten. Final source archive and a per-file delivery manifest are refreshed after this log entry; see source-package-verification.json and DELIVERY-CHECK.json for their verification results.


## 2026-10-23 Security skills review started
User authorized installation/application of android-intent-security and differential-review. Baseline: retained 0.1.1 source/APK, with 0.1.0-to-0.1.1 diff context. No Git history exists; do not infer commits/blame. Existing deliveries snapshotted; C-drive templates and patient data are not accessed. Checks use synthetic data only.


### 2026-10-23 Security review completed — Android 0.1.2-preview
- Installed pinned Google android-intent-security (95ea931a1ad8f9b2be132ae0cfb2aad964d71118, Apache-2.0) and Trail of Bits differential-review (196a9073ab10d35bacf111f945e02c00b2c6883a, CC BY-SA 4.0). Read all relevant supporting guidance; licenses, registry backup, pristine snapshots and separate recovery add-on retained locally. No skill runtime embedded in APK.
- Windows long-path installation required the installer download method with an extended-length temporary path and Windows path separators. Initial git fallback failed host-key verification; no host-key bypass was used. The optional Python skill validator lacked PyYAML; upstream frontmatter was inspected directly, and installed file hashes/recovery archive were verified.
- Snapshot differential review used retained 0.1.1, with previous 0.1.0 context; no Git history exists, so no fabricated blame/commit analysis. Independent adversarial review found two medium and two low source-level issues. All findings repaired; checked-create provider protection added as defense-in-depth rather than claimed privilege exploit.
- Red/green reproduction: stale chunk write and busy-state gaps failed before repair. Exports now bind account/patient context before data fetch, await completion, recheck after byte/hash awaits, block switching, and abort on invalidation.
- Native picker denial/malformed result returns cancellation; callback retained until parsing completes. DocumentGuard rejects existing/nonempty/unverifiable targets without write/delete; close failure still attempts cleanup and deletion must be confirmed. Eight-language cleanup/busy messages added.
- Final re-review closed two follow-up lows: duplicate cleanup false warning after VERIFY_FAILED and early file-picker callback clearing. Added regression for confirmed cleanup.
- Regression: 15/15 top-level automated tests (one host-JVM production-helper test includes 10 fake-provider scenarios), 18/18 desktop Chromium workflows, 3/3 persistent-profile upgrades from 0.1.1 with exact 18 MiB audio and multi-part restore; no external traffic/page errors. 41 JavaScript modules parse. Browser sandbox initially blocked localhost; isolated tests passed with local execution permission. One stale test version assertion was updated to package.json.
- Built 0.1.2-preview versionCode 3 with same package/signing identity as versionCode 2; APK verifier confirms no requested permissions and all 57 bundled web assets match. No encryption/account format migration.
- Browser/PWA 55 files, three frozen packages, and 77 files across retained Android 0.1.0/0.1.1 deliveries rehashed unchanged. Existing patient data and C-drive templates not accessed or modified.
- Documentation, source/APK and checksums synchronized into a separate Android-offline-preview-0.1.2 delivery. Exact final hashes/file counts are in source-package-verification.json and DELIVERY-CHECK.json. Temporary generated build/test directories are cleaned only after checks, retaining tools, private signing material and previous releases.
- Native Android lifecycle, permission denial/Parcelable/ContentResolver behavior, OEM recorder compatibility, physical installation/update, low-resource and clinical validation remain later feedback work. No repository or GitHub release created; cloud sync remains future work.


## 2026-10-24 · 发布后中英文说明更新 / Post-publication documentation

- README 中英文统一为已发布状态，加入 APK、固定 source-r1、校验文件、安装与反馈入口；链接指向已公开 Release。记录两次已通过的托管检查，保留真机及临床验证边界。
- 同步中英文快速开始、使用指南、验证说明、维护者发布流程、许可摘要联系入口及已启用的私密漏洞报告说明；LICENSE 正文和授权范围不变。
- main 文档属于发布后的说明修订；已发布 APK、source-r1、其校验文件与发布标签保持原样。Release 中只澄清快照与 main 文档的区别，不替换任何附件。
- 仅变更现有白名单中的文档/工作记录。运行时代码、测试脚本、依赖、签名材料、用户数据与 C 盘模板不参与此次修改。
- 本地验证采用文档链接、双语关键入口、过时表述、公开白名单及 Git 差异检查；不手动重跑运行时测试。推送后由既有 GitHub 工作流自动检查本次提交，结果以对应 Actions 记录为准。

Both READMEs now reflect the published release and provide matching download, installation and feedback links. Related delivery/user/security/validation/release/license-summary documents were synchronized. Governing license terms and all published r1 assets/tag are unchanged. Local checks are documentation-focused; the existing hosted workflow checks the documentation commit automatically. No signing secrets, user data or paper templates are involved.


## 2026-10-24 — Combined project publication / 整体项目发布

The owner authorized merging the frozen main project 0.6.15 UI r1 and Android 0.1.2-preview into this existing repository, running main-project hosted checks, publishing a combined pre-release and registering the checkout in GitHub Desktop. The browser-pwa tree is extracted from the exact reviewed public source archive; Android runtime files and old r1 assets are retained. Unified bilingual downloads and platform boundaries are provided. Private signing and live data remain excluded. Actual run IDs, publication assets and Desktop confirmation are recorded in the Release and local delivery work record after completion; physical-device/clinical checks remain deferred.

用户授权本轮合并、托管检查、整体预发布及 GitHub Desktop 登记。冻结主项目从公开源码包逐项提取，Android 运行代码及旧 r1 附件保留；中英文入口统一。实际托管结果、发布附件和 Desktop 确认在完成后的 Release 与本地交付工作记录中记录，真机及临床验证后置。

Git line-ending filters were detected before upload. The integrated main tree adds a no-conversion .gitattributes rule and refreshes its internal manifest; 181 original files and all runtime code remain byte-identical. Original source/portable/static archives remain unchanged. The index is checked against file bytes before committing. / 上传前发现Git换行过滤，整合目录仅修订.gitattributes并更新清单；181个原文件及全部运行代码字节一致，原始三个交付包不改，提交前逐项比较索引内容。

Hosted run 40078190532 passed all core/packaged-source jobs but exposed account-test timing: a mode change can replace the form after the test fills it. A controlled synthetic module delay reproduced the empty-form submission, while waiting for form replacement passed. The test helper now waits for the intended mode form; all original assertions and runtime files remain unchanged. This adds one test-only difference: 180 main-source files remain byte-identical, with .gitattributes and the account test adjusted and the manifest refreshed. The original three main archives and Android r1 remain unchanged.


## 2026-10-24 — Bilingual project homepage / 首页完整中英文说明

Added the complete English README content directly to the repository homepage, alongside Chinese, with top-level language jump links and a retained standalone README.en.md. Verified the repository now has canonical name Alias1027/wardnote with unchanged repository ID 1431694863; README project/download links use that address. This changes documentation only. Release tags and attachments remain fixed, and runtime, signing material, clinical data and C-drive templates are untouched.

将完整英文说明同步展示于项目首页，顶部提供中英文定位，保留独立英文README。核对现仓库名Alias1027/wardnote及相同身份编号，并统一README地址。仅修改文档；发布标签、附件和运行版本保持原状。


## 2026-10-24 — Canonical repository links / 仓库更名后的文档与入口

Normalized the remaining current documentation, download, security and authorization links to Alias1027/wardnote. Historical version/commit evidence and the Android compatibility filenames, application identity, tool paths and archive roots are retained. The maintenance guide now states the existing combined layout and marks old setup instructions as historical. Both published Release bodies receive canonical links with a rename note; assets, tags and publication dates remain fixed. Public readbacks, link/asset checks and the refreshed local delivery are recorded in the local rename work record. Runtime, signing material, current clinical data and C-drive templates are untouched.

将当前文档、下载、安全反馈及授权入口统一到现仓库，保留版本／提交证据和Android兼容标识；发布指南明确现有合并目录与历史建仓步骤。两份已发布Release仅更新正文链接及更名说明，附件、标签与发布日期保留。公开核验与新交付结果写入本轮工作记录，不改运行代码、签名材料、现有资料或C盘模板。


## 2026-10-25 — Approved introduction, offline/resource context and plain-text acknowledgments / 简介与鸣谢同步

Synchronized the user-approved complete Chinese and English copy with the bilingual homepage, standalone English README, main-project introduction and help documents. Settings & help displays purpose, offline/resource context, reference frameworks, all acknowledgments in the approved order, scope, copyright and email directly. No acknowledgment profile link or click-through page is added. All eight interface languages have matching content sections; non-Chinese/English translations still need native clinical review.

The main project keeps version 0.6.15 with UI/cache r2; Android source/locally built preview advances to 0.1.3-preview, versionCode 4, retaining its package and signing identity. This task publishes source/documentation only: no new Release, asset replacement, tag movement, PDF signing or certificate creation. Published UI r1 / Android 0.1.2-preview downloads retain their original contents; current README states that distinction. Data formats, account isolation, encryption and clinical source text are unchanged. Private signing material remains excluded.

Local results: main 167 existing core checks plus one new served-resource integration check; 21 browser/PWA groups, including eight-language desktop/mobile help; Android 20 core, 18 bridge/browser and three upgrade simulations; 13 public-boundary tests. APK has 58 source-matched resources, no requested permissions and matching upgrade identity. A shorter allowlisted test copy avoids a reproduced Windows deep-profile cache failure. The manual-update test recognizes a completed check's ready Apply action as well as its transient status; all safety/data assertions remain. Original failure evidence is retained locally, not relabeled as a successful run. Hosted results, public readbacks, release-preservation comparison and local delivery are recorded by commit in the new delivery work record.

已确认的完整中英文简介、脱机及资源有限环境说明、纯文本鸣谢和用途边界同步至首页、英文README、说明文件与App帮助。保留鸣谢顺序、称谓与版权；同步八语分区。新版帮助对应UI r2／Android 0.1.3-preview；本轮仅推送源码与文档，不新建Release，不替换旧附件或标签。现有账号、记录、备份格式及C盘模板不变，D盘电子模板及PDF原件保留，未生成或应用PDF证书。新本机交付、校验与托管结果另存工作记录。真机、母语临床、低配置及临床应用验证仍待后续反馈。


### Windows checkout compatibility follow-up

The first hosted Android run exposed LF/CRLF differences in the newly added introduction comparison and README section parsing. A mixed-line-ending checkout reproduces both failures with the original test; normalizing line endings only when reading program-owned test text passes all five cases. No runtime, data format, package/signing identity or update gating is changed by this follow-up. Historical failed-run evidence remains local; final hosted results are recorded against the corrected commit.

首轮托管 Windows 检查暴露新增测试的换行兼容性问题；用混合换行检出副本复现失败后，仅在测试读取文本时统一换行，五项检查通过。不改应用逻辑、数据格式、签名或更新保护，保留首次失败证据并以修正提交记录最终托管结果。


## 2026-10-25 — TL;DR and version scope / 太长不看与版本范围

按用户确认的中英文草稿，在首页两种语言及独立英文 README 开头加入摘要，同步整体交付说明，并在两个现有 Release 正文前添加同一项目概览和各自附件范围。已发布下载保持主项目 0.6.15 UI r1／Android 0.1.2-preview（r1）；当前 main 和本地交付为 0.6.15 UI r2／Android 0.1.3-preview，后者尚未成为新 Release 附件。正文补充不更新安装包或标签快照。

保留此前完整简介、纯文本鸣谢和全部历史发布记录；不采用尚未确认同步的英文重译稿。仅修改根目录 README.md、README.en.md、docs/COMBINED-RELEASE.md 和本工作记录。运行代码、内嵌主项目清单、许可正文、已发布附件、签名材料、用户资料、C盘模板及D盘电子模板均不参与修改。PDF证书与加密仅讨论，未实施。

Local checks cover the existing bilingual-introduction regression, public-file allowlist, nested release manifest, Markdown/download consistency and exact preservation of the previous README and Release bodies. Existing hosted workflows run automatically on the documentation commit; their final results, public readbacks, asset/tag preservation and local delivery hashes are recorded in the local TL;DR delivery work log. No new tests or runtime changes are introduced for this documentation-only update. Physical-device, low-resource and clinical evaluation remain pending.


## 2026-10-25 — Aligned release and original V007 PDFs / 最新成果与PDF原件版本对齐

用户授权将最新主项目0.6.15 UI r2、Android 0.1.3-preview与V007 PDF同步至GitHub。检查发现Windows个人/机器证书库暂无文档签名证书，向用户说明CA申领与自签名区别后，用户明确决定取消证书验证，直接上传PDF原件，并要求记录这一取舍。公开分发时编辑、转写和重建无法被技术措施完全阻止；签名仍有来源及完整性核验价值，但本轮优先保留打印、填写及跨设备使用便利性，以官方渠道、版本/许可及SHA256比对支持原件核验。未创建或使用PDF证书、私钥、签名或加密；取消证书不改变许可范围。

Eight owner-provided PDF exports (four worksheet types in Chinese/English, 12 pages) are added byte-for-byte under pdf-templates/v007 with provenance hashes, instructions and explicit no-certificate policy. No DOCX upload, page reflow, new interactive fields or patient data is involved. The PDF public tree is covered by the exact-public-file boundary and checked by the combined integrity workflow. Runtime files and clinical data formats remain unchanged; the existing Android 0.1.3 APK/signing identity is reused after byte/asset verification. README/downloads/current release guidance are aligned, while historical evidence retains its original scope.

The user authorizes publishing the aligned prerelease, retaining the two previous Releases, all 16 old assets/tags, live data, C-drive templates and D-drive electronic originals. Source/package/PDF readbacks, hosted run outcomes, final tag/asset checks and local delivery hashes are recorded in the Release and delivery work log. Physical-device, low-resource, native-language and clinical validation remain later feedback work. Private signing materials are excluded from source and assets.


## 2026-10-25 — Eight-language README previews / 八语言README预览

Added eight actual desktop-browser dashboard screenshots to the bilingual homepage and standalone English README, immediately after the brief version summary. Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu use the same isolated DEMO A/B/C workspace; no real patients, audio, backups or credentials are shown. All images are 1440×1000, with source-base provenance and SHA256 recorded. Arabic/Urdu RTL, visible text, page width and identical synthetic records were checked; screenshots were visually reviewed. No retouching or hidden UI replacement was used.

同步保留用户刚在GitHub增加的“其他有需要的临床工作者”表述，未覆盖手动编辑。README说明截图来自0.6.15 UI r2桌面浏览器，不等同Android真机截图或母语临床验证，临床原文不会随界面语言切换自动翻译。仅新增文档/PNG/公开清单及工作记录，运行代码、已发布3条Release/29项附件、标签、PDF原件、现有数据和C盘模板不变。托管结果与线上图片回读核验在本轮交付工作记录中记录。


## 2026-10-25 · Small talk 双模式优化 / Conversation review

- 依据分支“US临床实践相关”：医生口述／医患对话、完整原声与原文保留、疑似闲聊可回看、所有采用内容人工核对。
- Web 0.6.15 UI r3 / Android 0.1.4-preview：本地对话保守分段；模型未引用内容留在回看区；人物不明、条件性计划与否定不作自动事实转换；模式修改使旧候选失效。
- 八语言模式与回看文案一致；无需新账号或数据库迁移。Android 不新增联网权限、实时或离线 ASR。
- 本轮测试使用虚构对话与模拟服务；真机、口音、临床语言和临床效益仍待反馈。原发布附件、V007 原件、签名材料和用户数据保留。
- English: adds clinician dictation and clinical conversation review, keeps original audio/transcripts, retains unquoted model context, requires explicit review, and localizes eight interfaces. Synthetic validation only; physical-device and clinical validation remain pending.


### 2026-10-26 完成验证与交付准备 / Validation and delivery preparation

主项目 176/176 自动检查、Android 20/20 核心及 18/3 主机模拟通过；APK 59 项网页资源、无新增权限、同签名与递增版本号通过。八语言对话、保存失败重试、来源核对等模拟已通过。深路径浏览器缓存环境问题在字节相同的短路径副本中验证通过，没有放宽脱机检查。真机与临床验证仍待反馈。本轮以独立预发布包交付，不覆盖前 3 个 Release 的 29 项附件。
