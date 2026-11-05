# V007 对齐修订记录 / Update record

2026-11-05 · Web 0.6.16 UI r1 / Android 0.1.5-preview

依据 V007 自检，补齐初诊结果、出院交接、患者/照护者核对及复盘提示；生命体征前移；复盘日期可选；打印可选背景与教学提示。八语言同步，保留旧字段和临床原文。修复 Windows 5.1 启动完成误报，新增实际异步流程回归。

The V007 audit led to completed clinical and learning prompts, earlier vital signs, an optional reflection review date, and selectable background/teaching print output. All eight interfaces preserve original clinical text and saved-field compatibility. The Windows 5.1 asynchronous startup reporting defect is fixed and covered by a real completion-flow regression.

本地最终检查：主项目 179 项核心检查、23 套浏览器流程；Android 20 项核心、18 项桥接流程及 3 项模拟升级检查。签名身份、APK 内置资源和版本递增已验证。最初旧打印断言已适配新确认窗口；受限进程查询导致的测试环境失败，在可查询隔离测试进程的环境复核通过。未用实际患者资料。

Final local checks: 179 main core checks, 23 browser suites; 20 Android core, 18 bridge workflows and 3 simulated-upgrade checks. Signing identity, packaged assets and version progression are verified. Legacy print assertions were updated for the new confirmation dialog. Restricted process-query tests were rerun successfully with access to isolated test-process identities. Only synthetic data were used.

V007 PDF/Word 原件、既有发布附件、用户数据与私密签名材料保留。主项目与 Android 的包独立编号；交付只包含公开白名单文件。托管检查与下载结果见对应提交和 Release，真实设备和临床验证仍待反馈。

Original V007 worksheets, previous release assets, user data and private signing material are preserved. Product versions remain separate, and delivery uses explicit public allowlists. Hosted results and downloads are tied to the release commit; device and clinical validation remain pending.

[发布说明 / Release notes](RELEASE-v0.6.16-preview.1.md)

托管检查补充：Windows、macOS、Linux 核心及 Android 流程首次运行通过；Linux 浏览器语言流程发现测试在异步保存/收起浮窗完成前再次点击，已改为等待浮窗隐藏并断言收起状态，本地八语言复测通过。此修正只涉及测试同步，不改变临床数据或应用行为。

Hosted follow-up: core checks on Windows/macOS/Linux and the Android workflow passed on the first run. The Linux locale workflow exposed a test that clicked again before asynchronous saving/panel closure finished. It now waits for the panel to disappear and checks the collapsed state; the local eight-language rerun passed. This is test synchronization only, with no clinical-data or runtime change.
