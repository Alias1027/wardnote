# 整体预发布 / Combined pre-release

## 太长不看

**WardNote：便携式查房记录与工作备忘，默认脱机，持续追踪每位患者。**

面向临床实习生、住院医师及其他临床工作者，将初诊信息、每日查房、患者摘要、备忘、待办与交接集中于单个患者，辅助日常记录及临床决策复盘。

- **多平台：** Windows 一键启动、浏览器／PWA，以及支持首次脱机使用的 Android 安装版。手机浏览器／PWA 需先完成 HTTPS 部署和脱机准备。
- **独立使用：** 核心记录不依赖医院 EMR/HIS、云端模型或持续联网，兼顾网络不稳定和医疗信息化基础有限的使用环境。
- **八种界面语言：** 本机加密保存、账号间数据隔离，并支持加密备份与迁移；目前不提供跨设备自动云同步。
- **文字优先，语音辅助：** Android 优先调用已有录音应用并支持导入，当前不提供语音转写；自动生成或整理的内容仍需人工核对。

**当前为技术预览版。** 真机、低配置设备、母语临床审校及实际临床适用性仍待验证。用于辅助记录、备忘和学习，不能替代正式病历、医嘱、机构流程或临床判断。

**许可：** 源码可见；所有机构及商业用途须事先取得书面授权，具体范围以随附许可证为准。

**版本提示（2026-10-25）：**

- **已发布下载：** 主项目 **v0.6.15（UI r1）**、Android **0.1.2-preview／r1**。
- **当前 main 源码及本地交付：** 主项目 **v0.6.15（UI r2）**、Android **0.1.3-preview**，包含后续简介与帮助文案更新；尚未作为新 Release 附件发布。
- 更新 README 或 Release 说明不会更新安装包。下载附件和标签对应的源码仍是其发布时的快照；本轮保留全部既有附件。

## TL;DR

**WardNote is a portable tool for ward-round notes and care reminders, designed to work offline and keep each patient’s care in view.**

Built for medical students, residents, and other clinicians, it brings initial assessments, daily notes, patient summaries, memos, tasks, and handover information together in one patient workspace. It also supports reflection on clinical decisions.

- **Multiple platforms:** One-click startup on Windows, browser/PWA access, and an Android app that can launch offline from first use. Mobile browser/PWA use requires HTTPS hosting and initial offline setup.
- **Independent operation:** Core documentation requires neither hospital EMR/HIS integration nor cloud AI or continuous internet access, with unreliable connectivity and limited digital infrastructure in mind.
- **Eight interface languages:** Encrypted local storage, separate account workspaces, and encrypted backup and transfer. Automatic cloud synchronization is not currently available.
- **Text comes first; voice is optional:** Android uses an existing recording app and supports audio import, but does not currently offer transcription. Generated or organized content requires human review.

**This is a technical preview.** Physical-device testing, performance on less powerful hardware, clinical language review, and suitability for clinical practice remain to be evaluated. WardNote does not replace official records, medical orders, institutional procedures, or clinical judgment.

**License:** Source-available. All institutional and commercial use requires prior written authorization; see the accompanying license for full terms.

**Version note (2026-10-25):**

- **Published downloads:** Main project **v0.6.15 (UI r1)** and Android **0.1.2-preview/r1**.
- **Current main source and local delivery:** Main project **v0.6.15 (UI r2)** and Android **0.1.3-preview**, including later introduction/help updates; these have not been published as new Release assets.
- README and Release-note edits do not update installers. Download assets and tag-based source remain their release snapshots; all existing assets are retained in this update.

---

## 2026-10-24 发布记录（历史快照） / Original publication record

以下保留原始发布说明；其版本、文件数量和检查范围属于当时快照，当前源码差异见上方版本提示。

The original release record below is retained. Its versions, file counts and check scope describe that historical snapshot; see the version note above for the current-source distinction.

2026-10-24 · main project **0.6.15 UI r1** + Android **0.1.2-preview**, versionCode **3**.

[下载与安装 / Downloads and installation](../README.md) · [English](../README.en.md) · [Release](https://github.com/Alias1027/wardnote/releases/tag/v0.6.15-preview.1)

## 目录与不可变版本 / Layout and immutable versions

`browser-pwa/` 从已核验的冻结源码包逐项提取，182 个公开文件中180个保持原字节；`.gitattributes` 添加禁止换行转换的规则，账号测试等待模式切换后的新表单，再相应更新内部清单。原始主项目源码、Windows 便携包、静态 PWA 包按原字节发布；运行代码和缓存版本未更改。根目录保留 Android 结构并添加统一入口和主项目托管流程。`web/` 是 Android 的资源，独立浏览器/PWA 使用 `browser-pwa/`。

`browser-pwa/` is extracted from the verified frozen source archive, preserving 180 of its 182 public files byte-for-byte; `.gitattributes` gains a no-conversion rule, the account test waits for the replacement mode form, and the internal manifest is updated. Original main source, Windows portable and static PWA archives retain their bytes. Runtime code and cache versions are unchanged. Android retains its root layout; the repository adds unified entry points and main-project CI. `web/` belongs to Android; the standalone browser/PWA lives under `browser-pwa/`.

原 [Android r1 发布](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview)及五个附件不替换、不删除。整体 Release 中的 APK 与原 APK 字节、应用标识、签名和版本一致。旧版 source-r1 是 Android 发布时的固定源码快照；整体源码包包含两条产品线及本次统一说明。

The original Android r1 release and all five assets remain intact. The combined-release APK is byte-identical to the original, with the same application ID, signature and version. Old source-r1 remains the fixed Android publication snapshot; the combined source contains both product lines and unified guidance.

## 使用、备份与更新 / Use, backup and updates

Windows 选择便携包并双击 `Start-WardNote.cmd`。手机浏览器/PWA 的初次准备需要可信 HTTPS；管理员仅部署静态包中的 `site/`，不能上传完整工作目录。Android 首次使用可完全脱机，仍需具备本版要求的 WebView 能力与可用系统录音工具／文件选择器。

Windows users extract the portable archive and run `Start-WardNote.cmd`. Phone browser/PWA preparation requires trusted HTTPS; administrators deploy only `site/`, never a live working directory. Android first launch can be entirely offline but still requires the documented WebView capabilities and recorder/document services.

各设备、浏览器及安装版各存自己的资料；同名账号不自动同步。使用兼容的加密分卷备份迁移至新账号，不覆盖旧账号、不自动合并。更新前结束录音、保存并核验独立备份；浏览器/PWA 按安全更新提示操作，Android 覆盖安装同签名 APK，避免卸载或清除数据。

Each device/browser/installation stores its own copy; matching usernames do not synchronize. Transfer compatible encrypted multipart backups to a new account, without overwriting existing accounts or automatically merging changes. Finish recording, save and verify an independent backup before an update. Follow browser/PWA safe-update prompts or install a same-signature Android upgrade without uninstalling/clearing data.

## 文档与许可 / Documentation and licensing

主项目内的冻结文档反映 2026-10-21 的准备状态，当前发布状态以统一 README、此说明及 Release 为准。根目录和 `browser-pwa/LICENSE` 采用同一许可证正文；根目录的版本生效说明覆盖 Android 新增材料。机构及商业用途均须书面授权，源码公开不等于 OSI 开源许可。既往有效授权及第三方声明保持各自效力。

Frozen main-project documents describe preparation on 2026-10-21; current publication status is given by the unified READMEs, this guide and Release. Root and `browser-pwa/LICENSE` contain the same license terms, with the root effective-scope notice covering Android additions. Institutional and commercial use requires written authorization; public source is not an OSI-approved license. Prior valid grants and third-party notices retain their effect.

检查、未来验证及反馈见 [PROJECT-VALIDATION](PROJECT-VALIDATION.md)。签名私钥、密码、恢复密钥、现有数据库、录音和本机配置均不属于公开源码或附件。

See [PROJECT-VALIDATION](PROJECT-VALIDATION.md) for checks and pending feedback. Private signing keys, passwords, recovery keys, live databases/audio and local configuration are excluded from public source and assets.
