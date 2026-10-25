# Introduction and help copy update / 简介与帮助文案同步

历史记录 / Historical copy-update record: the following “no new Release” statements describe the earlier documentation-only task. Current downloads are in the [aligned pre-release](RELEASE-v0.6.15-preview.2.md). / 下方“不创建Release”为当时任务的记录，当前发布状态见统一预发布说明。

2026-10-25 · Main project 0.6.15 UI r2 · Android 0.1.3-preview (versionCode 4)

The approved [complete Chinese and English introduction](PROJECT-INTRODUCTION.md) is displayed directly in the bilingual README, the standalone English README, and Settings & help. Acknowledgments are plain text, in the approved order, with no profile links or click-through page. The same content is supplied in all eight interface languages; translations beyond Chinese/English still need native clinical review.

完整[中英文项目简介](PROJECT-INTRODUCTION.md)直接展示于中英文 README、独立英文 README 和“设置与帮助”。特别鸣谢按确认顺序使用纯文本，不设个人资料链接或跳转页。八种界面语言使用对应文案；新增中英文以外译文仍待母语临床审校。

## Versions, delivery and preserved releases / 版本、交付与既有发布

- This update does not create a new GitHub Release or replace existing assets/tags. Published UI r1 / Android 0.1.2-preview assets remain byte-identical. Current source and the new local delivery contain the copy update; old APK/ZIP downloads retain their original help text.
- 本次不创建新 Release，不替换既有附件或移动标签。已发布 UI r1／Android 0.1.2-preview 文件保持原字节；当前源码与新本机交付包含新文案，历史 APK／ZIP 保留原有帮助内容。
- Browser/PWA cache revision becomes r2 using the existing save-before-update confirmation and active-recording protection. No forced reload or data-store migration is added.
- 浏览器／PWA 使用 r2 资源缓存；沿用保存后确认更新及录音保护，不强制刷新，不迁移数据结构。
- The newly built Android preview uses versionCode 4 and the existing package/signing identity. Save records and verify an independent backup before updating; do not uninstall or clear app data. APK metadata verification does not establish physical-device upgrade success.
- 新 Android 预览安装包递增至 versionCode 4，沿用原应用标识与签名。更新前保存记录并核验独立备份；不要卸载或清除数据。包身份核验不等同真机升级验证。

## Scope / 范围

This is documentation/help maintenance, not a new clinical feature or expanded authorization. Offline behavior, account isolation, encryption, record formats, clinical source text and authorization terms are unchanged. Device/clinical validation and low-resource performance remain pending. Signing private keys, passwords, recovery keys and existing patient data are excluded from public files.

本轮为文案与帮助维护，不增加临床功能或授权范围。脱机策略、账号隔离、加密、记录格式、临床原文和许可条款不变。真机、临床和低配置性能验证仍待后续反馈。签名私钥、密码、恢复密钥和既有患者资料不进入公开文件。C 盘模板及 D 盘电子模板原件均保留；本轮未为 PDF 生成或应用证书。


## 2026-10-25 local checks / 本轮本机检查

- Existing 167 main core/API/publication tests and one new public-resource integration test passed; all 21 main browser/PWA groups passed, including exact introduction/acknowledgment content in eight languages and phone-width layouts.
- Android: 20 core tests (including five new introduction tests), 18 desktop bridge/browser checks and three desktop upgrade simulations passed. All 13 public-package boundary checks passed. A newly built APK has 58 web assets verified against source, no requested permissions, the same application/signing identity and an increased versionCode.
- The local browser regression copy was verified file-by-file against the public allowlist and used a shorter isolated path. A controlled comparison reproduced Chrome cache-initialization failure under the original deep Windows test-profile directory and success under the shorter path. This is not a low-end-device or installed-PWA result.
- The update test now accepts both the status message and the ready Apply action as completion of a manual check; all subsequent save, recording, concurrent-window, rollback and audio-preservation assertions remain in place. Runtime update gating was not weakened.
- 主项目既有 167 项核心/API/发布检查及新增 1 项公开资源访问检查通过；21 组浏览器/PWA回归通过，八语简介与鸣谢正文及窄屏布局均核对。Android 为 20 项核心、18 项桌面桥接/浏览器及 3 项桌面升级模拟；13 项公开打包边界检查通过。APK 的 58 项页面资源、无权限申请及同标识同签名升级元数据已核验。
- 八语自动检查不能替代母语临床审校；桌面模拟、包身份及摘要核验不能替代真机安装升级、资源有限地区应用或临床验证。真实资料、C盘模板及D盘电子模板原件均保留，PDF未签名或加密。
