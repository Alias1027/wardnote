# WardNote · 循记临床

[简体中文](#简体中文) · [English](#english) · [English-only README](README.en.md)

[整体预发布 / Combined pre-release](https://github.com/Alias1027/wardnote/releases/tag/v0.6.15-preview.1) · [反馈 / Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)

## 简体中文

**便携式查房记录与单患者持续追踪工具。** 初诊与背景、每日查房、病程记录、检查与化验、患者摘要、备忘、待办、交接与可选决策复盘集中于患者工作区。文字记录为主，语音为辅助；医生核对后使用候选内容。产品辅助临床思维训练和患者管理，医院的正式病历、医嘱、签署及管理流程仍由医院承接。

**本仓库现合并主项目 v0.6.15（含 UI r1）与 Android 0.1.2-preview。** 当前仓库为 `Alias1027/wardnote`，内容已覆盖 Windows、浏览器／PWA 和 Android。两条运行版本保持各自编号；[原 Android r1 发布](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview)及其五个附件保留。

### 下载与开始使用

| 使用方式 | 下载 | 开始使用与范围 |
| --- | --- | --- |
| Windows x64 电脑 | [一键启动便携包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-portable-win-x64.zip) | 解压后双击 `Start-WardNote.cmd`；内含 Node 运行时。默认本机访问，可脱机记录。 |
| 手机／电脑浏览器、PWA | [静态 PWA 部署包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-static-pwa.zip) | 管理员按随包向导把 `site/` 部署到专用可信 HTTPS 地址；用户打开地址后准备脱机资源，可按浏览器提示安装。尚无公共演示站点。 |
| Android 首次脱机安装 | [APK 安装包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-android-0.1.2-preview.apk) | Android 8.0+，还需满足 WebView 能力检查；下载安装后可首次脱机使用，不需自建 HTTPS。 |
| 主项目开发 | [冻结的 v0.6.15 源码](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15.zip) | 源码包需 Node.js 24+；运行前阅读包内说明。 |
| 整体项目开发 | [浏览器／PWA＋Android 完整源码](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-ui-r1-android-0.1.2-preview-source.zip) | 含两条产品线、统一说明和托管检查。APK 不包含在源码包内。 |
| 完整性核验 | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/SHA256SUMS.txt) | 各包另附 `.sha256` 文件；校验用于确认下载完整性。 |

**Windows：** 下载并完整解压便携包，双击启动，先用虚构病例创建记录、退出重开并核验备份。关闭网页不会自动停止本机服务，可从启动面板停止。[部署说明](browser-pwa/docs/EASY-DEPLOYMENT.md)

**手机浏览器／PWA：** 需先有可信 HTTPS 程序地址；它不是公共在线服务。初次准备完成后可脱机重开。静态部署版不提供服务器同步或云端语音识别接口。[八语言使用引导](browser-pwa/docs/GETTING-STARTED.md)

**Android：** 下载 APK 后用可信文件管理器安装，可先由电脑下载后通过 USB 传入。仅按系统要求为本次安装临时允许安装来源，随后按需关闭。程序优先调用已有录音应用，再核对患者并导入；没有兼容录音应用时可手动导入录音。[Android 使用说明](docs/ANDROID-USER-GUIDE.md)

### 共同能力与平台边界

- 八种界面语言：简体中文、英语、西班牙语、法语、俄语、阿拉伯语、印地语、乌尔都语；阿拉伯语与乌尔都语支持从右向左布局。界面切换不改写临床原文；母语临床审校仍待反馈。
- 默认脱机，按账号与个人／机构模式隔离加密工作区。相同账号名不会自动跨设备共享；使用兼容格式的加密备份迁移，恢复到新账号，不自动合并两端修改。
- 主项目提供可选、需明确授权与配置的接口；静态 PWA 不提供服务器功能。Android 不申请 `INTERNET` 权限，没有云同步、模型调用或语音转写；八语言界面不代表八语言离线识别。
- 主项目支持本地录音、来源核对、安全更新提示和分卷加密备份。Android 使用系统录音与文件选择器；外部应用可能自行保留或同步原文件，导入副本加密不控制外部副本。
- 更新前结束录音、保存并核验独立备份。浏览器／PWA 等待使用者确认安全更新；Android 使用同一标识与签名的升级 APK。不要卸载或清除站点／应用数据来处理旧版本显示。

### 项目结构与验证

| 路径 | 内容 |
| --- | --- |
| [browser-pwa/](browser-pwa/README.md) | v0.6.15 UI r1 的完整、冻结主项目源码，含 Windows 启动器、静态部署工具、测试与[公开纸表](browser-pwa/templates/README.md) |
| `android/`、`web/` | Android 原生容器及随 APK 打包的网页资源；`web/` 不能代替独立主项目 |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | 整体发布的版本、检查与待验证范围 |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | 统一安装、更新、源码与历史附件说明 |

[主项目托管检查](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) · [Android 托管检查](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

主项目既有本机证据为 167 项核心/API/发布检查、320 项浏览器检查及最终 29 项发布专项检查；Android 既有证据为 15 项核心、18 项桌面桥接模拟、3 项桌面升级模拟和 12 项公开打包边界检查。新合并目录另运行托管检查，结果与实际范围见整体验证说明和 Release。所有测试使用虚构资料。真机、系统录音往返、低配置、完整班次、母语临床及医院／临床验证仍留待反馈，不据工程检查宣称临床获益。

整合目录在 `.gitattributes` 增加字节保留规则，并修正账号模式切换测试等待表单重绘的时序，相应更新内部清单；180 个原文件及全部运行代码保持原字节，原始三个下载包完全保留。

冻结 `browser-pwa/` 文档保留 2026-10-21 的准备阶段记录；其中“尚未发布／托管检查待执行”描述当时状态。当前下载、整体发布状态及托管结果以本首页、整体说明和 Release 为准。

### 反馈、参考来源与许可

- [提交问题或建议](https://github.com/Alias1027/wardnote/issues/new/choose)：注明 Windows／浏览器／PWA／Android、版本和复现步骤。仅提交虚构资料，不上传病历、录音、备份、密码或密钥。
- [私密报告安全问题](https://github.com/Alias1027/wardnote/security/advisories/new)：私密漏洞报告已启用；其他联系与授权申请：[junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)。
- 设计参考包括中国十八项核心制度、美国 CMS-CoPs、Joint Commission NPSG、ACGME CPR、英国 NICE CG50、NHS England／CPOC NatSSIPs 及德国 G-BA QM-RL。详细名称、出处与适用边界见[临床设计参考](browser-pwa/docs/CLINICAL-SCOPE.md)。参考不代表获得认证或完整履行各地制度。

版权归 **Junhui Liu M.D.** 所有。采用 [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE)：许可范围内的独立个人非商业学习、研究、实验与测试可使用，**所有机构及商业用途须事先取得书面授权**。此为源码可见项目，不是 OSI 认可的开源许可；既往有效的 Apache-2.0／CC BY 4.0 授权和第三方许可仍保留各自效力。[授权政策](LICENSES/README.md)

---

## English

**Portable ward-round notes and longitudinal patient follow-up.** Initial history, daily review, clinical course, tests/results, patient briefs, memos, tasks, handoff and optional decision reflection share one patient workspace. Text entry is primary; voice is optional and candidates require clinician review. WardNote supports clinical reasoning education and patient management; institutions retain responsibility for official records, orders, signatures and governance.

**This repository now includes the main project v0.6.15 (UI r1) and Android 0.1.2-preview.** The current `Alias1027/wardnote` repository includes Windows, browser/PWA and Android resources. Each runtime keeps its own version. The [original Android r1 release](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview) and all five assets are preserved.

### Downloads and getting started

| Use | Download | Start and scope |
| --- | --- | --- |
| Windows x64 | [One-click portable package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-portable-win-x64.zip) | Extract fully and double-click `Start-WardNote.cmd`; Node is bundled. Local access and offline notes are supported. |
| Phone/desktop browser and PWA | [Static PWA deployment package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-static-pwa.zip) | An administrator hosts only `site/` at a dedicated trusted HTTPS origin using the included guide. Users prepare offline resources and may install via browser prompts. No public demonstration site is hosted. |
| Android, offline first launch | [APK installer](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-android-0.1.2-preview.apk) | Android 8.0+ plus the required WebView capability checks. First launch can be offline; no self-hosted HTTPS site is needed. |
| Main-project development | [Frozen v0.6.15 source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15.zip) | Requires Node.js 24+; read the included instructions. |
| Whole-project development | [Combined browser/PWA and Android source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-ui-r1-android-0.1.2-preview-source.zip) | Both product lines, unified guidance and hosted workflows. The APK is a separate download. |
| Integrity | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/SHA256SUMS.txt) | Individual `.sha256` sidecars are also available; hashes verify download integrity. |

**Windows:** download and fully extract the portable package, launch it, and use fictional cases to check saving, reopening and verified backup. Closing a browser tab does not stop the local server; use the launch panel to stop it. [Deployment guide](browser-pwa/docs/EASY-DEPLOYMENT.md)

**Phone browser/PWA:** a trusted HTTPS app address is required for initial preparation. This is a deployment package, not a public online service. After preparation, offline reopening is available. Static deployment has no server synchronization or cloud-ASR API. [Eight-language getting-started guide](browser-pwa/docs/GETTING-STARTED.md)

**Android:** install the APK using a trusted file manager; downloading on a computer and transferring by USB is also possible. Allow the installation source temporarily only as required by Android, then disable it if desired. WardNote invokes an existing recorder, then asks the user to verify the patient and import its output; manual audio import is the fallback. [Android user guide](docs/ANDROID-USER-GUIDE.md)

### Shared features and platform boundaries

- Eight UI languages: Simplified Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu; Arabic/Urdu use right-to-left layouts. Changing UI language preserves clinical source text. Native clinical language review remains pending.
- Offline by default, with encrypted workspaces isolated by account and personal/institutional mode. Matching usernames do not share data across devices. Transfer compatible encrypted backups into a new account; changes from separate copies are not automatically merged.
- The main project offers optional interfaces requiring explicit authorization and configuration; static PWA deployment has no server features. Android has no `INTERNET` permission, cloud synchronization, model calls or transcription. Eight UI languages do not establish eight-language offline ASR.
- The main project includes local recording, source review, safe update prompts and encrypted multipart backup. Android uses external recording/document applications; those apps may retain or synchronize their own copies. Encrypting an imported copy does not control external originals.
- Finish recording, save and independently verify backups before updating. Browser/PWA updates wait for a safe user-confirmed transition; Android upgrades require the same application ID and signature. Do not uninstall or clear site/app data to fix an old-version display.

### Repository and validation

| Path | Contents |
| --- | --- |
| [browser-pwa/](browser-pwa/README.en.md) | Complete frozen v0.6.15 UI r1 main-project source, Windows launchers, static deployment tools, tests and [public paper templates](browser-pwa/templates/README.md) |
| `android/`, `web/` | Android container and bundled web resources; `web/` is not the standalone main product |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | Combined version/check scope and pending validation |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | Unified installation, updates, source and historical assets |

[Main-project hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) · [Android hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

Existing main-project local evidence covers 167 core/API/publication checks, 320 browser checks and 29 final publication-specific checks. Existing Android evidence covers 15 core, 18 desktop bridge simulations, 3 desktop upgrade simulations and 12 public-package boundary checks. Hosted checks also run against the combined tree; see the validation guide and Release for actual results and scope. All cases are fictional. Physical devices, recorder round trips, low-resource operation, full shifts, native clinical review and hospital/clinical validation remain future feedback work. Engineering checks do not establish clinical benefit.

The integrated tree adjusts `.gitattributes` for exact checkout bytes and makes the account-mode browser test wait for form replacement, updating its manifest; 180 original files and all runtime code remain byte-identical. All three original download archives are unchanged.

Frozen `browser-pwa/` documentation retains the preparation-stage record dated 2026-10-21. Statements there about publication or hosted CI being pending describe that historical snapshot. This README, the combined guide and Release describe current downloads and publication/CI status.

### Feedback, design references and license

- [Report an issue or suggestion](https://github.com/Alias1027/wardnote/issues/new/choose): identify Windows/browser/PWA/Android, version and reproducible steps. Use fictional data only; do not attach clinical records, audio, backups, passwords or keys.
- [Report a vulnerability privately](https://github.com/Alias1027/wardnote/security/advisories/new): private reporting is enabled. Contact and licensing: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com).
- Design references include China's 18 Core Medical Quality and Safety Systems, US CMS-CoPs, Joint Commission NPSG, ACGME CPR, UK NICE CG50, NHS England/CPOC NatSSIPs and Germany's G-BA QM-RL. [Sources and scope](browser-pwa/docs/CLINICAL-SCOPE.md) identify the documents. Reference does not imply certification or complete fulfillment of regional requirements.

Copyright **Junhui Liu M.D.** The [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE) permits independent personal noncommercial learning, self-directed research, experimentation and testing within its terms. **All institutional and commercial uses require prior written authorization.** This is source-available, not OSI-approved open source. Valid earlier Apache-2.0/CC BY 4.0 grants and third-party licenses retain their own effect. [Licensing policy](LICENSES/README.md)
