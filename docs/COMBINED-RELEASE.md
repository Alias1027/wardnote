# 整体预发布 / Combined pre-release

2026-10-24 · main project **0.6.15 UI r1** + Android **0.1.2-preview**, versionCode **3**.

[下载与安装 / Downloads and installation](../README.md) · [English](../README.en.md) · [Release](https://github.com/Alias1027/wardnote-android/releases/tag/v0.6.15-preview.1)

## 目录与不可变版本 / Layout and immutable versions

`browser-pwa/` 从已核验的冻结源码包逐项提取，182 个公开文件中180个保持原字节；`.gitattributes` 添加禁止换行转换的规则，账号测试等待模式切换后的新表单，再相应更新内部清单。原始主项目源码、Windows 便携包、静态 PWA 包按原字节发布；运行代码和缓存版本未更改。根目录保留 Android 结构并添加统一入口和主项目托管流程。`web/` 是 Android 的资源，独立浏览器/PWA 使用 `browser-pwa/`。

`browser-pwa/` is extracted from the verified frozen source archive, preserving 180 of its 182 public files byte-for-byte; `.gitattributes` gains a no-conversion rule, the account test waits for the replacement mode form, and the internal manifest is updated. Original main source, Windows portable and static PWA archives retain their bytes. Runtime code and cache versions are unchanged. Android retains its root layout; the repository adds unified entry points and main-project CI. `web/` belongs to Android; the standalone browser/PWA lives under `browser-pwa/`.

原 [Android r1 发布](https://github.com/Alias1027/wardnote-android/releases/tag/android-v0.1.2-preview)及五个附件不替换、不删除。整体 Release 中的 APK 与原 APK 字节、应用标识、签名和版本一致。旧版 source-r1 是 Android 发布时的固定源码快照；整体源码包包含两条产品线及本次统一说明。

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
