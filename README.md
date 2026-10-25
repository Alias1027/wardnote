# WardNote · 循记临床

[简体中文](#简体中文) · [English](#english) · [English-only README](README.en.md)

[整体预发布 / Combined pre-release](https://github.com/Alias1027/wardnote/releases/tag/v0.6.15-preview.2) · [反馈 / Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)

## 简体中文

### 太长不看

**WardNote：便携式查房记录与工作备忘，默认脱机，持续追踪每位患者。**

面向临床实习生、住院医师及其他有需要的临床工作者，将初诊信息、每日查房、患者摘要、备忘、待办与交接集中于单个患者，辅助日常记录及临床决策复盘。

- **多平台：** Windows 一键启动、浏览器／PWA，以及支持首次脱机使用的 Android 安装版。手机浏览器／PWA 需先完成 HTTPS 部署和脱机准备。
- **独立使用：** 核心记录不依赖医院 EMR/HIS、云端模型或持续联网，兼顾网络不稳定和医疗信息化基础有限的使用环境。
- **八种界面语言：** 本机加密保存、账号间数据隔离，并支持加密备份与迁移；目前不提供跨设备自动云同步。
- **文字优先，语音辅助：** Android 优先调用已有录音应用并支持导入，当前不提供语音转写；自动生成或整理的内容仍需人工核对。

**当前为技术预览版。** 真机、低配置设备、母语临床审校及实际临床适用性仍待验证。用于辅助记录、备忘和学习，不能替代正式病历、医嘱、机构流程或临床判断。

**许可：** 源码可见；所有机构及商业用途须事先取得书面授权，具体范围以随附许可证为准。

**统一预发布（2026-10-25）：**

- **本次下载与源码：** 主项目 **v0.6.15（UI r2）**、Android **0.1.3-preview**，以及 **V007 中英文 PDF 原件**，统一收录于 `v0.6.15-preview.2`。
- **历史版本：** UI r1／Android 0.1.2-preview／r1 的附件和标签完整保留；旧安装包不会因文档更新而变化。
- PDF 未添加证书签名或加密；使用官方原件及 SHA-256 校验值进行逐字节比对。纸表编号与App版本分别管理；工程检查不代表真机或临床验证。

### 项目简介

WardNote 是一款便携式临床记录与工作备忘工具，旨在为初诊评估、住院查房及患者的持续追踪提供便利。本项目尤其关注临床实习生、住院医师及其他低年资医生的学习与工作需要，支持临床思维和患者管理能力的培养，并可辅助临床决策的复盘与学习。

本项目强调独立使用、文字优先与默认脱机。完成相应平台的安装及脱机准备后，核心记录功能无需接入医院电子病历系统（EMR/HIS）、云端模型或持续联网。结合多语言界面、本机加密保存及可迁移备份，本项目旨在降低使用与部署门槛，兼顾不同国家和地区，尤其是网络不稳定、医疗信息化基础薄弱及医疗资源有限环境的使用需求。具体设备兼容性、低配置运行表现及实际临床适用性仍待进一步验证。

本项目在设计过程中，参考了以下制度、标准与指南中的相关原则：中国《医疗质量安全核心制度要点》（十八项核心制度）；美国 CMS 医院参与条件（CoPs）、Joint Commission 国家患者安全目标（NPSGs）及其自 2026 年起适用于医院和关键可及医院认证项目的后续框架——国家绩效目标（NPGs），以及 ACGME 住院医师培训通用要求（Common Program Requirements, CPR）；英国 NICE CG50、NHS England 发布的 NatSSIPs 及 CPOC 发布的修订版 NatSSIPs 2；德国联邦联合委员会（G-BA）的质量管理指令（QM-RL）。

**本次整体预发布包含主项目 v0.6.15（UI r2）、Android 0.1.3-preview 与 V007 中英文 PDF 原件。** 当前仓库为 `Alias1027/wardnote`，内容已覆盖 Windows、浏览器／PWA 和 Android。两条运行版本保持各自编号；[原 Android r1 发布](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview)及其五个附件保留。

**2026-10-25 版本对齐：** 本次发布最新运行包、与该标签一致的整体源码及V007 PDF原件。此前仅在本地提供的UI r2／Android 0.1.3-preview现有对应下载；八语言简介和帮助已包含在运行包内。详细范围见[本次发布说明](docs/RELEASE-v0.6.15-preview.2.md)。

### 下载与开始使用

| 使用方式 | 下载 | 开始使用与范围 |
| --- | --- | --- |
| Windows x64 电脑 | [一键启动便携包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-portable-win-x64.zip) | 解压后双击 `Start-WardNote.cmd`；内含 Node 运行时。默认本机访问，可脱机记录。 |
| 手机／电脑浏览器、PWA | [静态 PWA 部署包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-static-pwa.zip) | 管理员按随包向导把 `site/` 部署到专用可信 HTTPS 地址；用户打开地址后准备脱机资源，可按浏览器提示安装。尚无公共演示站点。 |
| Android 首次脱机安装 | [APK 安装包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-android-0.1.3-preview.apk) | Android 8.0+，还需满足 WebView 能力检查；下载安装后可首次脱机使用，不需自建 HTTPS。 |
| 主项目开发 | [v0.6.15 UI r2 源码](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-source.zip) | 源码包需 Node.js 24+；运行前阅读包内说明。 |
| 整体项目开发 | [浏览器／PWA＋Android 完整源码](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-android-0.1.3-preview-source.zip) | 含两条产品线、统一说明和托管检查。APK 不包含在源码包内。 |
| V007 中英文 PDF | [8份原件下载包](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-v007-pdf-originals-r1.zip) | 初诊、住院管理、续页及决策复盘；保留原件，无证书或加密。[逐份浏览](pdf-templates/v007/README.md) |
| 完整性核验 | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/SHA256SUMS.txt) | 各包另附 `.sha256` 文件；校验用于确认下载完整性。 |

**Windows：** 下载并完整解压便携包，双击启动，先用虚构病例创建记录、退出重开并核验备份。关闭网页不会自动停止本机服务，可从启动面板停止。[部署说明](browser-pwa/docs/EASY-DEPLOYMENT.md)

**手机浏览器／PWA：** 需先有可信 HTTPS 程序地址；它不是公共在线服务。初次准备完成后可脱机重开。静态部署版不提供服务器同步或云端语音识别接口。[八语言使用引导](browser-pwa/docs/GETTING-STARTED.md)

**Android：** 下载 APK 后用可信文件管理器安装，可先由电脑下载后通过 USB 传入。仅按系统要求为本次安装临时允许安装来源，随后按需关闭。程序优先调用已有录音应用，再核对患者并导入；没有兼容录音应用时可手动导入录音。[Android 使用说明](docs/ANDROID-USER-GUIDE.md)

### 共同能力与平台边界

- 八种界面语言：简体中文、英语、西班牙语、法语、俄语、阿拉伯语、印地语、乌尔都语；阿拉伯语与乌尔都语支持从右向左布局。界面切换不改写临床原文；母语临床审校仍待反馈。
- 默认脱机，按账号与个人／机构模式隔离加密工作区。相同账号名不会自动跨设备共享；使用兼容格式的加密备份迁移，恢复到新账号，不自动合并两端修改。
- 主项目提供可选、需明确授权与配置的接口；静态 PWA 不提供服务器功能。Android 不申请 `INTERNET` 权限，没有云同步、模型调用或语音转写；八语言界面不代表八语言离线识别。
- 主项目支持本地录音、来源核对、安全更新提示和分卷加密备份。Android 使用系统录音与文件选择器；外部应用可能自行保留或同步原文件，导入副本加密不控制外部副本。
- 更新前结束录音、保存并核验独立备份。浏览器／PWA 等待使用者确认安全更新；Android 使用同一标识与签名的升级 APK。不要卸载或清除站点／应用数据来处理旧版本显示。

### 特别鸣谢

衷心感谢我目前的住院医师规范化培训单位——陕西省人民医院，以及我的导师 Dr. 雷琦（MD, PhD）对本项目的支持。

感谢 Dr. June Chunqiu Hou（MD）、Dr. Andrew Fagelman（MD）和 Dr. Laszlo Mechtler（MD）等师长在我赴美临床学习期间给予的悉心指导。

同时，感谢 Dr. Charles Jiang（MD）的专栏文章为本项目临床决策复盘学习页的设计提供启发。

### 用途边界与版权

本项目用于辅助临床记录、工作备忘与教学，不能替代医院或机构的正式病历、医嘱、管理系统及其管理职责，也不能替代医务人员的专业判断。相关诊疗、签署、审批及制度执行，仍须遵循当地要求与所在机构的正式流程。

© Junhui Liu M.D. 版权所有。 使用及再分发须遵循项目随附的许可条款。

反馈与支持： [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)

### 项目结构与验证

| 路径 | 内容 |
| --- | --- |
| [browser-pwa/](browser-pwa/README.md) | v0.6.15 主项目源码及 UI r2 文案更新，含 Windows 启动器、静态部署工具、测试与[公开纸表](browser-pwa/templates/README.md) |
| `android/`、`web/` | Android 原生容器及随 APK 打包的网页资源；`web/` 不能代替独立主项目 |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | 整体发布的版本、检查与待验证范围 |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | 统一安装、更新、源码与历史附件说明 |

[主项目托管检查](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) · [Android 托管检查](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

主项目既有本机证据为 167 项核心/API/发布检查、320 项浏览器检查及最终 29 项发布专项检查；Android 既有证据为 15 项核心、18 项桌面桥接模拟、3 项桌面升级模拟和 12 项公开打包边界检查。新合并目录另运行托管检查，结果与实际范围见整体验证说明和 Release。所有测试使用虚构资料。真机、系统录音往返、低配置、完整班次、母语临床及医院／临床验证仍留待反馈，不据工程检查宣称临床获益。

2026-10-24 整合时在 `.gitattributes` 增加字节保留规则，并修正账号模式切换测试等待表单重绘的时序，相应更新内部清单；180 个原文件及全部运行代码保持原字节，原始三个下载包完全保留。2026-10-25 的 UI r2 仅更新简介／帮助文案及对应资源、缓存和测试清单；不更改记录格式或账号加密。

`browser-pwa/` 中沿用的历史文档保留 2026-10-21 的准备阶段记录；其中“尚未发布／托管检查待执行”描述当时状态。当前下载、整体发布状态及托管结果以本首页、整体说明和 Release 为准。

### 反馈、参考来源与许可

- [提交问题或建议](https://github.com/Alias1027/wardnote/issues/new/choose)：注明 Windows／浏览器／PWA／Android、版本和复现步骤。仅提交虚构资料，不上传病历、录音、备份、密码或密钥。
- [私密报告安全问题](https://github.com/Alias1027/wardnote/security/advisories/new)：私密漏洞报告已启用；其他联系与授权申请：[junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)。
- 设计参考包括中国十八项核心制度、美国 CMS-CoPs、Joint Commission NPSG、ACGME CPR、英国 NICE CG50、NHS England／CPOC NatSSIPs 及德国 G-BA QM-RL。详细名称、出处与适用边界见[临床设计参考](browser-pwa/docs/CLINICAL-SCOPE.md)。参考不代表获得认证或完整履行各地制度。

版权归 **Junhui Liu M.D.** 所有。采用 [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE)：许可范围内的独立个人非商业学习、研究、实验与测试可使用，**所有机构及商业用途须事先取得书面授权**。此为源码可见项目，不是 OSI 认可的开源许可；既往有效的 Apache-2.0／CC BY 4.0 授权和第三方许可仍保留各自效力。[授权政策](LICENSES/README.md)

---

## English

### TL;DR

**WardNote is a portable tool for ward-round notes and care reminders, designed to work offline and keep each patient’s care in view.**

Built for medical students, residents, and other clinicians, it brings initial assessments, daily notes, patient summaries, memos, tasks, and handover information together in one patient workspace. It also supports reflection on clinical decisions.

- **Multiple platforms:** One-click startup on Windows, browser/PWA access, and an Android app that can launch offline from first use. Mobile browser/PWA use requires HTTPS hosting and initial offline setup.
- **Independent operation:** Core documentation requires neither hospital EMR/HIS integration nor cloud AI or continuous internet access, with unreliable connectivity and limited digital infrastructure in mind.
- **Eight interface languages:** Encrypted local storage, separate account workspaces, and encrypted backup and transfer. Automatic cloud synchronization is not currently available.
- **Text comes first; voice is optional:** Android uses an existing recording app and supports audio import, but does not currently offer transcription. Generated or organized content requires human review.

**This is a technical preview.** Physical-device testing, performance on less powerful hardware, clinical language review, and suitability for clinical practice remain to be evaluated. WardNote does not replace official records, medical orders, institutional procedures, or clinical judgment.

**License:** Source-available. All institutional and commercial use requires prior written authorization; see the accompanying license for full terms.

**Aligned pre-release (2026-10-25):**

- **This release and source:** Main project **v0.6.15 (UI r2)**, Android **0.1.3-preview**, and **original V007 Chinese/English PDFs**, together in `v0.6.15-preview.2`.
- **History:** UI r1 / Android 0.1.2-preview/r1 assets and tags are preserved. Documentation edits do not change old installers.
- No certificate signatures or encryption were added to the PDFs. Compare official originals using SHA-256. Worksheet and app versions are managed separately; engineering checks do not establish device or clinical validation.

### About the Project

WardNote is a portable clinical note-taking and work memo tool designed to support initial assessment, inpatient ward rounds, and longitudinal patient follow-up. With particular attention to the learning and practical needs of medical students on clinical rotations, residents, and other early-career physicians, it aims to support the development of clinical reasoning and patient management skills, as well as reflection on and learning from clinical decisions.

The project prioritizes independent use, text-based documentation, and offline operation by default. Once installation and offline preparation for the relevant platform are complete, core note-taking functions do not require integration with hospital electronic medical record or hospital information systems (EMR/HIS), cloud models, or a continuous internet connection. Through multilingual interfaces, encrypted local storage, and portable backups, WardNote aims to reduce barriers to use and deployment across countries and regions, with particular consideration for settings with unreliable connectivity, limited health information infrastructure, or constrained healthcare resources. Device compatibility, performance on devices with limited computing resources, and suitability for clinical use require further evaluation.

Its design draws on relevant principles from the following policies, standards, and guidelines: China’s Key Provisions of the Core Systems for Medical Quality and Safety (the 18 core systems); the US Centers for Medicare & Medicaid Services (CMS) Conditions of Participation for Hospitals (CoPs), Joint Commission National Patient Safety Goals (NPSGs) and their successor framework for the Hospital and Critical Access Hospital accreditation programs from 2026—the National Performance Goals (NPGs)—and the ACGME Common Program Requirements for Residency; the UK’s NICE guideline CG50, the original National Safety Standards for Invasive Procedures (NatSSIPs) published by NHS England, and the revised NatSSIPs 2 published by the Centre for Perioperative Care (CPOC); and Germany’s Federal Joint Committee (G-BA) Quality Management Directive (Qualitätsmanagement-Richtlinie, QM-RL).

**This combined pre-release includes main project v0.6.15 (UI r2), Android 0.1.3-preview and the original V007 Chinese/English PDFs.** The current `Alias1027/wardnote` repository includes Windows, browser/PWA and Android resources. Each runtime keeps its own version. The [original Android r1 release](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview) and all five assets are preserved.

**2026-10-25 version alignment:** This release supplies the current runtime packages, matching tagged source and original V007 PDFs. UI r2 / Android 0.1.3-preview, previously delivered locally, now have published downloads with the eight-language introduction/help update. See the [release scope](docs/RELEASE-v0.6.15-preview.2.md).

### Downloads and getting started

| Use | Download | Start and scope |
| --- | --- | --- |
| Windows x64 | [One-click portable package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-portable-win-x64.zip) | Extract fully and double-click `Start-WardNote.cmd`; Node is bundled. Local access and offline notes are supported. |
| Phone/desktop browser and PWA | [Static PWA deployment package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-static-pwa.zip) | An administrator hosts only `site/` at a dedicated trusted HTTPS origin using the included guide. Users prepare offline resources and may install via browser prompts. No public demonstration site is hosted. |
| Android, offline first launch | [APK installer](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-android-0.1.3-preview.apk) | Android 8.0+ plus the required WebView capability checks. First launch can be offline; no self-hosted HTTPS site is needed. |
| Main-project development | [v0.6.15 UI r2 source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-source.zip) | Requires Node.js 24+; read the included instructions. |
| Whole-project development | [Combined browser/PWA and Android source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-0.6.15-ui-r2-android-0.1.3-preview-source.zip) | Both product lines, unified guidance and hosted workflows. The APK is a separate download. |
| V007 Chinese/English PDFs | [Eight original worksheets](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-v007-pdf-originals-r1.zip) | Initial assessment, inpatient management, continuation and decision review. No certificate or encryption added. [Individual files](pdf-templates/v007/README.en.md) |
| Integrity | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/SHA256SUMS.txt) | Individual `.sha256` sidecars are also available; hashes verify download integrity. |

**Windows:** download and fully extract the portable package, launch it, and use fictional cases to check saving, reopening and verified backup. Closing a browser tab does not stop the local server; use the launch panel to stop it. [Deployment guide](browser-pwa/docs/EASY-DEPLOYMENT.md)

**Phone browser/PWA:** a trusted HTTPS app address is required for initial preparation. This is a deployment package, not a public online service. After preparation, offline reopening is available. Static deployment has no server synchronization or cloud-ASR API. [Eight-language getting-started guide](browser-pwa/docs/GETTING-STARTED.md)

**Android:** install the APK using a trusted file manager; downloading on a computer and transferring by USB is also possible. Allow the installation source temporarily only as required by Android, then disable it if desired. WardNote invokes an existing recorder, then asks the user to verify the patient and import its output; manual audio import is the fallback. [Android user guide](docs/ANDROID-USER-GUIDE.md)

### Shared features and platform boundaries

- Eight UI languages: Simplified Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu; Arabic/Urdu use right-to-left layouts. Changing UI language preserves clinical source text. Native clinical language review remains pending.
- Offline by default, with encrypted workspaces isolated by account and personal/institutional mode. Matching usernames do not share data across devices. Transfer compatible encrypted backups into a new account; changes from separate copies are not automatically merged.
- The main project offers optional interfaces requiring explicit authorization and configuration; static PWA deployment has no server features. Android has no `INTERNET` permission, cloud synchronization, model calls or transcription. Eight UI languages do not establish eight-language offline ASR.
- The main project includes local recording, source review, safe update prompts and encrypted multipart backup. Android uses external recording/document applications; those apps may retain or synchronize their own copies. Encrypting an imported copy does not control external originals.
- Finish recording, save and independently verify backups before updating. Browser/PWA updates wait for a safe user-confirmed transition; Android upgrades require the same application ID and signature. Do not uninstall or clear site/app data to fix an old-version display.

### Acknowledgments

I am grateful to Shaanxi Provincial People’s Hospital, where I am currently undertaking residency training, and to my mentor, Dr. Qi Lei (MD, PhD), for their support of this project.

I sincerely thank Dr. June Chunqiu Hou (MD), Dr. Andrew Fagelman (MD), and Dr. Laszlo Mechtler (MD) for their thoughtful teaching and guidance during my clinical experiences in the United States.

The design of the clinical decision reflection worksheet was also inspired by the published columns of Dr. Charles Jiang (MD).

### Scope and Copyright

WardNote supports clinical note-taking, work memos, and education. It does not replace official medical records, medical orders, institutional management systems or responsibilities, or the professional judgment of healthcare practitioners. Clinical care, signatures, approvals, and implementation of institutional policies must continue to follow applicable local requirements and formal institutional procedures.

© Junhui Liu M.D. All rights reserved. Use and redistribution are subject to the accompanying project license.

Feedback and support: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)

### Repository and validation

| Path | Contents |
| --- | --- |
| [browser-pwa/](browser-pwa/README.en.md) | v0.6.15 main-project source with the UI r2 copy update, Windows launchers, static deployment tools, tests and [public paper templates](browser-pwa/templates/README.md) |
| `android/`, `web/` | Android container and bundled web resources; `web/` is not the standalone main product |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | Combined version/check scope and pending validation |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | Unified installation, updates, source and historical assets |

[Main-project hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) · [Android hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

Existing main-project local evidence covers 167 core/API/publication checks, 320 browser checks and 29 final publication-specific checks. Existing Android evidence covers 15 core, 18 desktop bridge simulations, 3 desktop upgrade simulations and 12 public-package boundary checks. Hosted checks also run against the combined tree; see the validation guide and Release for actual results and scope. All cases are fictional. Physical devices, recorder round trips, low-resource operation, full shifts, native clinical review and hospital/clinical validation remain future feedback work. Engineering checks do not establish clinical benefit.

The 2026-10-24 integration adjusted `.gitattributes` for exact checkout bytes and made the account-mode browser test wait for form replacement, updating its manifest; 180 original files and all runtime code remain byte-identical. All three original download archives are unchanged. The 2026-10-25 UI r2 update changes introduction/help copy and associated resources, cache and test manifests without changing record formats or account encryption.

Frozen `browser-pwa/` documentation retains the preparation-stage record dated 2026-10-21. Statements there about publication or hosted CI being pending describe that historical snapshot. This README, the combined guide and Release describe current downloads and publication/CI status.

### Feedback, design references and license

- [Report an issue or suggestion](https://github.com/Alias1027/wardnote/issues/new/choose): identify Windows/browser/PWA/Android, version and reproducible steps. Use fictional data only; do not attach clinical records, audio, backups, passwords or keys.
- [Report a vulnerability privately](https://github.com/Alias1027/wardnote/security/advisories/new): private reporting is enabled. Contact and licensing: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com).
- Design references include China's 18 Core Medical Quality and Safety Systems, US CMS-CoPs, Joint Commission NPSG, ACGME CPR, UK NICE CG50, NHS England/CPOC NatSSIPs and Germany's G-BA QM-RL. [Sources and scope](browser-pwa/docs/CLINICAL-SCOPE.md) identify the documents. Reference does not imply certification or complete fulfillment of regional requirements.

Copyright **Junhui Liu M.D.** The [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE) permits independent personal noncommercial learning, self-directed research, experimentation and testing within its terms. **All institutional and commercial uses require prior written authorization.** This is source-available, not OSI-approved open source. Valid earlier Apache-2.0/CC BY 4.0 grants and third-party licenses retain their own effect. [Licensing policy](LICENSES/README.md)
