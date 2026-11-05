# WardNote v0.6.16-preview.1

## 太长不看 / TL;DR

V007 内容对齐与 Windows 启动修复预发布：**Web 0.6.16 UI r1 + Android 0.1.5-preview**。继续作为独立、默认脱机的便携查房记录和工作备忘；不是医院 EMR/HIS 的替代品。

This pre-release aligns the app with V007 worksheet content and fixes Windows startup reporting: **Web 0.6.16 UI r1 + Android 0.1.5-preview**. WardNote remains an independent, offline-first ward-round notebook and reminder tool, not a replacement for hospital EMR/HIS systems.

## 本轮变化 / Changes

- 补齐初诊检查、出院与交接、患者参与核对及决策复盘的教学提示；八种语言同步，提示可收起。 / Complete optional teaching prompts for results, discharge, handover, patient verification and reflection across eight interfaces.
- 生命体征前移；复盘增加可选日期，旧记录不自动回填；打印可选择背景和教学提示。 / Move vital signs earlier, add an optional reflection review date without backfilling old records, and offer background/teaching print options.
- 修复 Windows PowerShell 5.1 服务已启动却显示 `ScriptHalted` 的问题；浏览器自动打开失败时给出手动访问地址。 / Fix a Windows PowerShell 5.1 false startup failure and distinguish browser-opening failure from service failure.
- 更新版本、缓存标识、说明与测试；保留已有字段、加密备份格式及学习记录导出边界。 / Update versions, cache identity, documentation and tests while retaining saved-field and encrypted-backup compatibility and excluding learning records from clinical exports.

详见 / Details: [V007 对齐说明 / Alignment](../browser-pwa/docs/V007-ALIGNMENT.md).

## 下载 / Downloads

Choose one runtime for your platform. 选择适合的平台包即可。

- [Windows x64 便携版 / Portable](https://github.com/Alias1027/wardnote/releases/download/v0.6.16-preview.1/wardnote-0.6.16-ui-r1-portable-win-x64.zip)
- [浏览器/PWA 部署包 / Deployment package](https://github.com/Alias1027/wardnote/releases/download/v0.6.16-preview.1/wardnote-0.6.16-ui-r1-static-pwa.zip)
- [Android APK](https://github.com/Alias1027/wardnote/releases/download/v0.6.16-preview.1/wardnote-android-0.1.5-preview.apk)
- [完整源码 / Combined source](https://github.com/Alias1027/wardnote/releases/download/v0.6.16-preview.1/wardnote-0.6.16-ui-r1-android-0.1.5-preview-source.zip)
- [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.16-preview.1/SHA256SUMS.txt)
- [V007 PDF 原件（保持不变） / Unchanged originals](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-v007-pdf-originals-r1.zip)

## 更新与范围 / Updating and scope

先结束并保存录音、确认文字保存并独立验证加密备份。Windows 保留原地址、浏览器工作区、`data` 和本地配置；不要卸载 Android 或清除浏览器数据来刷新版本。PWA 按安全更新提示操作。Android 使用相同应用标识及签名升级。旧标签和附件不替换；签名私钥、密码和恢复密钥不在公开文件中。

Finish recordings, save edits and independently verify encrypted backups before updating. Keep the same Windows address/browser workspace and preserve `data` and local configuration. Do not uninstall Android or clear browser storage to refresh versions. Follow the PWA safe-update prompt; Android upgrades retain the application ID and signing identity. Historical tags/assets stay unchanged, and private signing material is never included.

真机、低配置设备、母语临床审校及临床验证仍待反馈。Android 继续不提供网络权限、云同步或转写；第三方录音工具的行为由其自身控制。所有机构与商业用途须事先取得书面授权，具体以项目许可证为准。

Physical-device, low-resource-device, native clinical-language and clinical validation remain pending feedback. Android still has no network permission, cloud sync or transcription; external recorder behaviour remains outside this app's control. Institutional and commercial use requires prior written authorization under the project license.

[反馈 / Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)

## 本地验证 / Local verification

- 主项目 179 项核心检查、23 套浏览器流程通过；包含 8 项 Windows 启动回归及 V007 日期、打印和八语言检查。 / 179 main-project core checks and 23 browser workflow suites passed, including 8 Windows launcher checks and V007 date, print and locale coverage.
- Android 20 项核心检查、18 项浏览器桥接检查及 3 项模拟升级检查通过；18 MiB 虚构录音可备份恢复。 / Android: 20 core, 18 browser-bridge and 3 simulated-upgrade checks passed, including backup/restore of 18 MiB synthetic audio.
- APK 的 59 个网页资源逐字节匹配，签名与上一版一致，版本码 5 → 6；无网络权限。 / All 59 bundled web assets match source; signing identity is unchanged, version code increases from 5 to 6, and no network permission is requested.
- 托管检查以本标签对应提交的 GitHub Actions 结果为准；上述均不替代真机和临床验证。 / Consult GitHub Actions for hosted checks on the tagged commit; these engineering checks do not substitute for device or clinical validation.
