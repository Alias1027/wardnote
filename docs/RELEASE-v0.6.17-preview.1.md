# WardNote v0.6.17-preview.1

## 太长不看 / TL;DR

**Web 0.6.17 UI r1 + Android 0.1.6-preview**：独立、默认脱机的便携查房记录与工作备忘。本次完善“真实时间—此前计划—实际反馈—重新判断”的记录链路，保持四项患者摘要与可收起的教学提示，不扩展为医院 EMR/HIS。八种界面语言同步；既有记录和加密备份格式保留。

**Web 0.6.17 UI r1 + Android 0.1.6-preview**: an independent, offline-first tool for ward-round notes and care reminders. This release connects recorded times, prior plans, observed outcomes and reassessment, while keeping the four-part patient brief and optional teaching prompts. It does not replace hospital EMR/HIS systems. All eight interfaces are updated; existing records and encrypted backup formats are retained.

选择适合平台的一个运行包即可；开发者可另取完整源码。技术预览不代表已经完成真机、低配置设备、母语临床审校或临床验证。

Choose one runtime package for your platform; developers can download the combined source separately. This technical preview does not establish physical-device compatibility, low-resource performance, native clinical-language review or clinical validity.

## 下载 / Downloads

| 用途 / Use | 附件 / Asset |
| --- | --- |
| Windows x64：解压后双击 `Start-WardNote.cmd` / Extract and double-click | [Windows portable ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.17-preview.1/wardnote-0.6.17-ui-r1-portable-win-x64.zip) |
| 手机／电脑浏览器与 PWA：管理员部署至可信 HTTPS / Administrator-hosted trusted HTTPS | [Static PWA deployment ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.17-preview.1/wardnote-0.6.17-ui-r1-static-pwa.zip) |
| Android 8.0+：支持首次脱机启动，需满足 WebView 能力检查 / Offline first launch, subject to WebView capability checks | [Android APK](https://github.com/Alias1027/wardnote/releases/download/v0.6.17-preview.1/wardnote-android-0.1.6-preview.apk) |
| 两条产品线的完整源码 / Both product lines | [Combined source ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.17-preview.1/wardnote-0.6.17-ui-r1-android-0.1.6-preview-source.zip) |
| 以上四个附件的 SHA-256 / Checksums for the four assets | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.17-preview.1/SHA256SUMS.txt) |

[V007 中英文 PDF 原件 / Unchanged V007 PDF originals](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-v007-pdf-originals-r1.zip) 继续使用既有下载入口，不重复上传或改写。 / The existing PDF download remains available without replacing or duplicating its assets.

本标签和随附完整源码包对应本次版本；main 分支可能继续更新。GitHub 自动生成的 Source code ZIP/TAR.GZ 是标签仓库归档，不是运行包。

The tag and attached combined source archive identify this release; the main branch may advance. GitHub's automatic Source code ZIP/TAR.GZ files are repository snapshots, not runnable installers.

## 本轮变化 / Changes

- **时间真实性：** 新检查不再预填采样时间。时间不详可明确记录，保留在单独列表，核实前不进入日期趋势或标为已完整核对；旧时间及修改历史保留。 / **Time accuracy:** New results no longer receive a prefilled sample time. Explicitly undated results remain visible separately and are excluded from dated trends and full verification until checked. Existing timestamps and revision history are preserved.
- **计划与结果反馈：** 前次查房对照可查看上次计划、预期反应及手动关联的待办结果，即使前后文字相同。关联保留来源版本与时间；变更、重排或移除后需重新核对。完成待办不代表临床问题解决。 / **Plan-to-outcome review:** The previous-round comparison shows prior plans, expected responses and manually linked task outcomes, even when prose is unchanged. Links retain source versions and times; changed, reordered or removed sources require review. Completing a task does not resolve a diagnosis automatically.
- **未决问题：** 四项患者摘要纳入已记录的不确定性、下次复核及应变条件；最新记录为空时，不从旧记录自动补成当前判断。 / **Unresolved issues:** The four-part brief includes recorded uncertainty, next reassessment and contingency criteria. Blank latest notes are not filled from older assessments.
- **简洁教学：** 复用评估、依据、监测和复盘栏目，可收起提示，区分当时可得证据与事后认识、预期与实际结果。八种界面同步；既有临床原文不随语言切换重写。 / **Optional teaching:** Existing assessment, evidence, monitoring and reflection fields provide collapsible prompts to distinguish contemporaneous evidence from hindsight and expectations from outcomes. All eight interfaces are aligned; changing interface language preserves clinical source text.
- **来源隔离：** 脱机及服务端写入、同步导入和备份恢复校验任务关联的真实患者归属；变更来源的旧关联保留原文字，不自动按名称重连。 / **Source isolation:** Offline/server writes, sync import and backup restore validate the actual patient ownership of task-linked sources. Older links retain their literal snapshots and are not rematched by name.

反馈卡显示紧邻上一次每日查房的显式关联结果；初诊或更早记录的关联仍可从待办查看。录入／更新时间不等于临床发生时间，关联和摘要均不能替代医生判断。

The feedback card shows outcomes explicitly linked to the immediately preceding daily note. Links to initial or earlier notes remain accessible from tasks. Entry/update times are not clinical event times; links and summaries do not replace clinical judgment.

完整说明 / Details: [本轮改动与边界 / Changes and limitations](https://github.com/Alias1027/wardnote/blob/v0.6.17-preview.1/browser-pwa/docs/REASONING-UPDATE.md).

## 更新与数据保护 / Updating and data protection

结束并保存录音，确认文字已保存，并独立核验加密备份后再更新。Windows 保留原地址、浏览器工作区、`data` 与本地配置；PWA 按安全更新提示操作。Android 保留应用标识和签名身份，版本码由 6 升至 7；请覆盖升级，不要卸载或清除应用／浏览器数据来刷新版本。历史发布附件、现有数据及 V007 原件不替换。私钥、密码和恢复密钥不在公开文件中。

Finish and save recordings, save edits and independently verify an encrypted backup before updating. On Windows, retain the address, browser workspace, `data` and local configuration; follow PWA safe-update prompts. Android retains its application ID and signing identity, with versionCode increasing from 6 to 7. Install as an upgrade; do not uninstall or clear app/browser storage to refresh the version. Historical release assets, existing data and V007 originals are preserved. Private keys, passwords and recovery keys are excluded from public files.

## 验证范围与后续 / Validation scope and follow-up

本地合成资料检查：主项目 **200 项核心检查**、**25 套浏览器流程中的 345 项检查**通过；Android **20 项核心检查、18 项模拟流程和 3 项冷升级／数据保留模拟**通过。APK 内 59 个网页资源与对应源码逐字节一致。记录详见 [验证说明](https://github.com/Alias1027/wardnote/blob/v0.6.17-preview.1/docs/VALIDATION.md)。

Local checks with synthetic data passed: **200 main-project core checks**, **345 browser checks across 25 suites**, and **20 Android core checks, 18 simulated workflows and 3 cold-upgrade/storage-retention checks**. All 59 bundled APK web assets match the corresponding source byte-for-byte. See the [validation record](https://github.com/Alias1027/wardnote/blob/v0.6.17-preview.1/docs/VALIDATION.md).

托管检查以本发布标签对应提交的 [Main project CI](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) 和 [Android CI](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml) 结果为准；本地通过不代表托管检查已经通过。真机、外部录音应用差异、低配置性能、母语临床译文和实际临床／教学效果继续通过后续反馈验证。

For hosted checks, consult [Main project CI](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) and [Android CI](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml) for the commit referenced by this tag. Local success does not establish hosted CI success. Physical devices, external recorder differences, low-resource performance, native clinical wording and clinical/educational outcomes remain subjects for subsequent feedback and validation.

Android 不申请网络权限，不提供云同步、模型调用或转写。手机浏览器／PWA 首次使用仍需可信 HTTPS 与脱机准备；静态 PWA 不提供服务端接口。项目为源码可见软件，所有机构及商业用途须事先获得书面授权，具体以随附许可证为准。

Android requests no network permission and provides no cloud sync, model calls or transcription. First use in a mobile browser/PWA still requires trusted HTTPS hosting and offline preparation; the static PWA has no server endpoints. This is source-available software; all institutional and commercial use requires prior written authorization under the accompanying license.

[安装说明 / Installation](https://github.com/Alias1027/wardnote/blob/v0.6.17-preview.1/README.md#下载与开始使用) · [English instructions](https://github.com/Alias1027/wardnote/blob/v0.6.17-preview.1/README.en.md#downloads-and-getting-started) · [反馈入口 / Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)

反馈请使用虚构或适当去标识化示例，勿上传患者资料、录音、密码或签名材料。 / Use synthetic or appropriately de-identified examples in feedback; do not upload patient data, recordings, passwords or signing material.
