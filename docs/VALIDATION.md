# Android 预览版验证记录 / Validation record

本轮版本 / Current revision: **Web 0.6.15 UI r3 · Android 0.1.4-preview**. [对话整理说明与本轮验证范围 / Conversation changes and validation scope](RELEASE-v0.6.15-preview.3.md). 以下旧版本验证保留原日期与范围。 Historical evidence below retains its original dates and scope.

Android **0.1.2-preview** · Web **0.6.15 UI r1** · 2026-10-23

## 已发布状态与托管检查 / Published status and hosted checks

Android 0.1.2-preview / r1 已于 2026-10-24 [首次预发布](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview)。[首次 main 推送](https://github.com/Alias1027/wardnote/actions/runs/40047905103)及[发布标签](https://github.com/Alias1027/wardnote/actions/runs/40049429003)的 GitHub Actions 均通过，覆盖 15 项核心、18 项桌面浏览器模拟、3 项升级模拟、12 项公开打包边界及临时签名构建/打包检查。发布后 5 个附件匿名回下载与原交付散列一致，原 APK/source-r1 未替换。

The first prerelease was published on 2026-10-24. Both linked hosted runs passed the core, desktop simulation, publication-boundary and disposable-signing build/package checks. All five public assets were anonymously downloaded and hash-matched. The original APK/source-r1 attachments were not replaced.

本页以下保留本机准备阶段的历史记录。托管通过不构成 Android 真机、母语临床或临床验证；反馈入口的登录后交互也未由自动化提交测试。 / The historical local-preparation evidence follows. Hosted success does not establish physical-device, native-language clinical or clinical validation; authenticated feedback forms have not been submitted by automation.

发布材料 r1 历史说明（准备时点）：以下 15/18/3 及包级结果是当前 0.1.2 运行时的既有验证证据。新增发布文档、自动检查配置和反馈模板的本地核验另记于本轮交付记录；配置就绪不代表 GitHub 托管运行已完成。APK 保持原字节。 / Release-material r1 note: the 15/18/3 and package results below are existing evidence for the current 0.1.2 runtime. Local checks of the new release documents, workflow and feedback forms are recorded separately in this round's delivery evidence; prepared configuration does not establish a completed hosted GitHub run. APK bytes remain unchanged.

本轮完成 **15 项自动测试、18 项桌面浏览器集成检查、3 项桌面存储升级模拟及 APK 宿主机核验**。浏览器检查使用 Windows 桌面 Chromium 和原生桥接测试替身；**未运行 Android 模拟器，未在真实手机安装或录音**。源码检查、编译和模拟桥接通过不等于设备运行或临床验证通过。原浏览器/PWA版本的历史测试结果未计入本轮数字。

This run passed **15 automated tests, 18 desktop-browser integration checks, 3 desktop storage-upgrade checks and host-side APK verification**. Browser checks use Windows desktop Chromium and a native-bridge test double. **No Android emulator was run, and no physical-phone installation or recording was performed.** Source inspection, compilation and simulated bridge success do not establish device-runtime or clinical validation. Historical browser/PWA results are excluded from these counts.

## 本轮验证登记 / Current-run evidence

| 检查 / Check | 状态 / Status | 证据 / Evidence |
| --- | --- | --- |
| Android 编译、APK签名与校验 / Build, signing and checksums | 宿主机通过 / Host-side pass | [构建记录](../logs/android-build-final.log)；[APK 核验](../logs/android-apk-verification.json)：v2/v3 签名、ZIP 对齐及 SHA-256 一致。 / v2/v3 signature, alignment and checksum verified. |
| 本地程序资源完整性、首次启动不等待 SW / Bundled assets and SW-independent bootstrap | 包检查及模拟浏览器通过 / Package and simulated-browser pass | APK 中 **57 个**网页资源逐字节匹配；模拟首次启动未注册 SW、未请求 API 或外部资源。 / 57 bundled web files match; simulated first launch has no SW registration, API or external resource request. |
| Manifest 网络权限与自动备份排除 / Network permission and backup exclusions | 宿主机通过 / Host-side pass | 打包 Manifest 无 `uses-permission`，`allowBackup=false`、`debuggable=false`、明文网络禁用；备份排除规则已检查。 / Packaged manifest requests no permissions and disables auto-backup, debugging and cleartext networking; exclusion rules inspected. |
| 系统录音返回、取消、无处理程序 / Recorder return, cancellation and no-handler path | 模拟桥接通过；真实录音工具待验证 / Test double passes; real recorder pending | 录音返回后须再次确认患者；取消／无录音工具不生成完成记录；分块读入保存加密字节，短读不标记完成。 / Second patient confirmation, cancellation/no-handler behavior, encrypted chunks and incomplete-read rejection checked. |
| 患者／账号边界与活动重建 / Patient/account boundaries and activity recreation | 前端守卫检查通过；原生活动生命周期仅代码审查 / Frontend guards pass; native lifecycle code-reviewed only | 每次写入前核对上下文；重建后无旧请求 ID 的音频不自动归属。WebView 采用各版本一致的默认应用私有目录；未模拟 Android 进程回收。 / Context checked before writes; orphan results are not auto-assigned. Consistent default private WebView storage; Android process loss not executed. |
| 备份格式互通、错误密码、缺卷、篡改、已有账号保护 / Backup interoperability and negative cases | 模拟浏览器通过 / Simulated-browser pass | 与未改动的浏览器版进行分卷双向恢复，亦恢复旧版 JSON；核对原声字节、文本、历史；拒绝错误模式及覆盖已有账号。 / Segmented round trip with unchanged browser code, legacy JSON restore, preserved audio/text/history, and mode/overwrite rejection. |
| 八语标签、临床文本保留与 RTL / Eight-language labels, preserved clinical text and RTL | 核心及桌面窄屏检查通过 / Core and desktop narrow-screen pass | 八语目录键完整；390 px 窄屏初始页、六个患者分区及帮助／设置无中文残留，阿拉伯语／乌尔都语 RTL；临床内容不自动翻译。 / Catalog coverage, first-use, six patient sections and settings/help at 390 px, RTL and unchanged clinical text. |
| 原版本保留 / Base release preservation | 散列复核通过 / Hash recheck passed | 原浏览器 **55 个**资源文件与 **3 份**冻结 ZIP 校验值未变；现有数据及 C 盘模板未修改。 / Original 55 browser resource files and 3 frozen ZIP checksums unchanged; existing data and C-drive templates not modified. |

核心检查入口为 [android-core.test.mjs](../tests/android-core.test.mjs)。浏览器检查的最终记录为 [android-browser-results.json](../logs/android-browser-results.json)，时间 **2026-10-23T12:35:04.994Z**，18 项通过、错误数组为空。复核步骤与依赖见[构建与复核](BUILD-TOOLCHAIN.md)。这些模拟检查未使用真实患者、现有本机账号或医院接口。

Core checks are in [android-core.test.mjs](../tests/android-core.test.mjs). The final [browser result](../logs/android-browser-results.json), **2026-10-23T12:35:04.994Z**, records 18 passes and an empty error list. See [build and verification](BUILD-TOOLCHAIN.md) for repeatable steps and dependencies. These simulated checks use no real patients, existing local accounts or hospital interfaces.

开发在独立 Android 目录中进行，原浏览器/PWA与冻结包未被本版替换，现有数据和 C 盘模板不参与修改。基线证据见 [web-baseline.json](../logs/web-baseline.json) 和 [frozen-baseline.json](../logs/frozen-baseline.json)，收尾复核及交付包信息见工作记录和交付清单。 / Development took place in a separate Android directory. This preview does not replace browser/PWA or frozen releases; existing data and C-drive templates are excluded from modification. Baselines are in [web-baseline.json](../logs/web-baseline.json) and [frozen-baseline.json](../logs/frozen-baseline.json); see the work log and delivery manifest for final rechecks and packages.

## 发布后反馈与真实设备验证 / Later feedback and device validation

| 场景 / Scenario | 需要检查 / What to check |
| --- | --- |
| 全新安装、飞行模式启动 / Fresh install in airplane mode | 在满足运行要求但从未打开应用的设备上创建账号、保存记录、退出并重新登录；确认无需初次网页下载。 / Create, save, close and reopen without initial web download. |
| 多厂商录音 / Different OEM recorders | 能否响应系统录音请求、返回可读 URI；无法返回时导入指引是否清楚；格式与播放兼容。 / Intent handling, readable result URI, manual-import fallback and playback. |
| 应用切换、进程回收、锁屏 / App switching, process loss and locking | 不误配患者、不将未导入录音标记完成；能够从原文件重新导入。录音连续性由外部录音应用另行验证。 / No misassignment or false completion; recover via the original file. Recorder continuity is separately tested. |
| 文件提供程序 / Document providers | 本地存储与可移动介质的写入结果，取消、只读位置、空间不足、不同文件选择器的多选限制。 / Write results, cancellation, read-only/full destinations and multi-file selection limits. |
| 浏览器↔Android备份 / Browser↔Android backups | 使用合成文字、来源、修改历史、核对状态及可回听音频往返恢复；不覆盖目标已有账号。 / Synthetic round trip including provenance, revisions, review state and playable audio. |
| 长期录音与低配置设备 / Long recordings and low-resource devices | 实际可承受的音频大小、导入/备份内存、耗时、耗电、存储不足响应；不把格式上限作为承诺。 / Real memory, time, battery and low-storage behavior. |
| 安装与升级 / Install and upgrade | 真机安装、保持签名和应用标识的升级、Android 系统升级后资料保留；升级前已核验备份，之后记录与原声可读取。 / Physical installation, same-signature updates, Android OS-upgrade preservation and post-update data/audio access. |
| 八语与无障碍 / Languages and accessibility | 母语临床人员核对术语；真实手机系统栏／安全区域、窄屏、放大字体、RTL、键盘及读屏操作。 / Native clinical review, actual phone system bars/insets, narrow screens, large text, RTL, keyboard and screen reader. |
| 临床使用 / Clinical use | 医院许可与流程边界、录音告知、真实工作负担、遗漏和误归类、患者上下文确认。 / Institutional authorization, recording arrangements, workload, omissions and misrouting. |

先使用虚构病例反馈。不要在公开问题、截图或日志中提交患者资料、账号密码、音频或备份。不同医院的部署授权和临床治理由部署单位与作者另行确认。

Use synthetic cases first. Do not submit patient information, credentials, audio or backups through public issues, screenshots or logs. Institutional deployment authorization and clinical governance require separate arrangements.

## 0.1.1 历史证据 / Historical evidence

详见[本轮自检与修复](SELF-CHECK-0.1.1.md)。导入中关闭窗口的失败先复现、再通过回归；手动导入完成患者确认一致化。保存失败时保留输入并阻止返回退出已验证。前后 APK 应用标识及签名相同，versionCode 1 → 2；同源桌面冷重启保留两类账号、记录历史和 18 MiB 合成音频，多分卷恢复核对通过。

See the [self-check report](SELF-CHECK-0.1.1.md). The import-dismissal regression failed before repair and now passes; manual import uses consistent patient confirmation. Save-failure exit protection is verified. APK application ID/signature match with versionCode 1 → 2; same-origin desktop cold restart preserves both account modes, history and an 18 MiB synthetic audio fixture, including multi-part backup restoration. These are package and desktop tests, not Android device installation/runtime validation.

## 0.1.2 安全回归 / Security regression

见[安全审查报告](SECURITY-REVIEW-0.1.2.md)。15 项顶层自动测试中有一项 JVM 测试直接执行生产 DocumentGuard，包含 10 个情景；它们不额外计入 15 项。18 项桌面流程新增实际导出与账号失效保护。3 项升级模拟使用保留的 0.1.1 源码，包级核验确认相同签名及 versionCode 2 → 3。

See the [security report](SECURITY-REVIEW-0.1.2.md). One of the 15 top-level tests executes production DocumentGuard on a host JVM with 10 scenarios; these are not additional top-level tests. The 18 browser checks include actual export and session-invalidation paths. Three upgrade checks use retained 0.1.1 source; package verification confirms unchanged signing identity and versionCode 2 → 3.

原生 SecurityException、异常 Parcelable、真实 ContentResolver 和厂商录音交互仍限于源码/编译检查，不能以桌面替身宣称通过真机验证。 / Native SecurityException, malformed Parcelable, real ContentResolver and OEM recorder interactions remain source/compile checks, not device-tested behavior.

## 发布准备 r1 本机复核 / Local release-preparation checks

本轮通过自包含入口重新执行 15 项核心、18 项桌面浏览器和 3 项桌面升级检查；新增 12 项公开打包边界测试（含链接目录、私钥标记、清单及嵌套基线篡改拒绝）。112 个历史资源从随包基线校验，无需开发者原目录。隔离 CI 构建使用临时签名，57 个资源核验通过，临时 APK/私钥已删除；正式交付 APK 保持原字节。签名私有备份通过 5 项恢复检查，公开记录只含结果与证书指纹，不含秘密。

This round reran 15 core, 18 desktop-browser and 3 desktop-upgrade checks through the self-contained entry and passed 12 publication-boundary tests. The 112 bundled historical assets require no maintainer-only directory. An isolated CI-style build verified 57 assets using a disposable key, then removed its APK/key; the delivered APK is unchanged. Five private signing-recovery checks passed; public evidence contains only outcomes and the certificate fingerprint.

证据见 [本轮发布核查](../logs/release-readiness-r1.json)、[签名恢复核验](../logs/signing-backup-verification.json)、[临时签名构建](../logs/ci-android-build-results.json)及[本轮工作记录](../logs/release-worklog-r1.md)。上述临时构建的证书和散列不能用于核对正式交付 APK。上述为本机准备时点记录；此后 GitHub 托管运行已通过，见页首。反馈表登录后交互、真机和临床验证仍未执行。签名备份仅在本机同盘，尚无异地容灾副本。

See the linked evidence. The temporary build's certificate/hash must not be used to verify the official APK. This describes the local-preparation stage; hosted execution subsequently passed as linked above. Authenticated feedback-form interaction, physical-device and clinical checks remain pending. The signing backup is local on the same drive, not off-device disaster recovery.
