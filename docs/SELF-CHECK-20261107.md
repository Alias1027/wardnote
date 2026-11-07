# Dot 工作记录复核与自检 / Dot review and self-check

2026-11-07 · Web/PWA 0.6.17 UI r1 · Android 0.1.6-preview

## 范围与结论 / Scope and conclusion

本轮依据 [PR #1 的工作记录](https://github.com/Alias1027/wardnote/pull/1)，复核提交 `051d77a7e8e5e07655126184358a3557dd25e86d`，并在本机 Windows 环境重跑核心、浏览器与 Android 宿主测试。另发现并修复了随机端口被浏览器拦截的测试问题。两项修复均位于自动测试及源码发行清单，不改动应用运行代码、临床字段、八语言文案、加密格式、录音或升级行为。本次检查没有复现新的应用功能故障。

This review uses the work log in [PR #1](https://github.com/Alias1027/wardnote/pull/1), checks commit `051d77a7e8e5e07655126184358a3557dd25e86d`, and reruns core, browser and Android-host tests on Windows. It also identifies and fixes browser rejection of an OS-assigned test port. Both fixes concern automated tests and public-source metadata. Application runtime code, clinical fields, eight-language UI text, encryption formats, recording and upgrade behavior are unchanged. No additional application failure was reproduced in these checks.

## 原因与修复 / Cause and correction

- 旧版测试仅允许 PowerShell 启动 15 秒。繁忙的 Windows 托管环境可能超过此时限；旧捕获逻辑丢失进程终止信息，继而出现“未找到预期错误文字”的误导性失败。
- 独立副本中仅为测试调用加入 16 秒延迟，旧测试在约 15.07 秒失败，stderr 为空。对修复分支使用同一延迟，约 18.00 秒通过，并仍验证错误版本拒绝、退出码 1、保存记录提醒及原服务保持运行。
- 测试启动预算调整为有限的 45 秒，与已有友好启动器测试一致；应用健康检查时限不变，不增加自动重试。
- 超时、进程信号、执行文件缺失和输出截断分别作为测试执行异常报告，保留原始 cause、耗时、预算和输出。只有明确的正常非零退出才进入应用拒绝断言。

The old harness allowed only 15 seconds for PowerShell startup. Slow Windows CI startup could exceed this limit, and the old catch block discarded termination metadata. A deterministic 16-second delay in an isolated baseline reproduced the failure at about 15.07 seconds with empty stderr. The corrected test passed the same delayed scenario in about 18.00 seconds while checking exit code 1, the version refusal, the saved-work warning and continued operation of the existing service. The bounded test-process budget is now 45 seconds; application health-check timeouts are unchanged. There are no automatic process or workflow retries. Timeout, signal, spawn and truncated-output errors retain their diagnostic cause and output instead of being mistaken for intentional application refusal.

## 本轮追加修复 / Additional fix found in this review

备份浏览器测试使用 `listen(0)` 时被系统分配到 4045 端口，真实浏览器返回 `ERR_UNSAFE_PORT`，尚未进入应用。Chromium 的[受限端口定义](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/port_util.cc)包含该端口。独立浏览器复现确认了这一原因，改用高位端口后可访问同一类合成测试页面。

统一测试辅助函数将测试服务绑定到 `127.0.0.1` 的 49152–65535 范围，至多尝试 32 次端口分配；仅对占用或无权限的候选端口换一个端口，不重跑失败的工作流。实际服务在选定端口上持续占用套接字，不先“探测再释放”，避免竞争窗口。意外网络错误立即向上报告。25 个浏览器套件与两个 Android 宿主脚本复用此函数；6 项新增回归覆盖受限端口、冲突、预算耗尽、原服务保护和异常清理。未使用禁用端口安全限制的浏览器参数。

The backup browser test received port 4045 from `listen(0)`. Chromium rejected navigation with `ERR_UNSAFE_PORT` before reaching the application; the port appears in its [restricted-port definition](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/net/base/port_util.cc). An isolated browser check reproduced the rejection and verified access on the replacement port. A shared fixture helper now binds only to `127.0.0.1` in the 49152–65535 range, with at most 32 candidate allocations. Only occupied or permission-denied ports advance to another candidate; failed workflows are not retried. The actual server retains the bound socket, avoiding a probe-and-release race. Unexpected errors propagate immediately. All 25 browser suites and both Android-host browser scripts use this helper; six new regressions cover unsafe candidates, collisions, bounded exhaustion, existing-service preservation and error cleanup. Browser port protections remain enabled.

## 本轮本机检查 / Local checks in this round

| 检查 / Check | 结果 / Result |
| --- | --- |
| Windows 核心与启动测试 / Core and launcher | 211 passed; 1 POSIX-only signal test skipped; 0 failed |
| 浏览器／PWA / Browser and PWA | 345 checks across 25 suites passed |
| Android 核心 / Android host core | 20 passed |
| Android 浏览器与原生桥接模拟 / Desktop browser and native bridge simulations | 18 passed |
| Android 冷升级与备份模拟 / Cold-upgrade and backup simulations | 3 passed |
| 公开文件边界 / Public-file boundaries | 13 passed |

覆盖默认脱机、八语言与 RTL、账号隔离、录音确认与导入、语音候选人工核对、检查时间真实性、前次计划与结果反馈、摘要来源、加密备份恢复及更新保护。Android 检查使用桌面浏览器与模拟原生接口，并包括 18 MiB 合成录音和跨 16 MiB 分片边界的备份恢复，不等同于真机验证。

Checks cover offline defaults, eight languages and RTL, account isolation, recording confirmation/import, reviewed voice-routing candidates, sample-time authenticity, prior plans and outcome feedback, summary provenance, encrypted backup/restore and update protection. Android coverage uses a desktop browser and simulated native interfaces, including 18 MiB of synthetic audio and recovery across a 16 MiB backup-part boundary; it is not physical-device validation.

公开边界测试第一次因本地沙箱禁止创建合成目录联接而失败；在允许该测试操作的环境重测 13 项全部通过。该权限限制没有通过削弱断言绕过。

The first public-boundary run could not create a synthetic junction under the local sandbox. All 13 tests passed after running with the required filesystem permission; assertions were not weakened.

## 托管证据与交付 / Hosted evidence and delivery

Dot 修复提交的 [主项目 CI](https://github.com/Alias1027/wardnote/actions/runs/42317479064) 与 [Android CI](https://github.com/Alias1027/wardnote/actions/runs/42317479078) 已通过。原发布标签在未修改源码的情况下单次重跑也[通过](https://github.com/Alias1027/wardnote/actions/runs/42243353538/attempts/2)，支持冷启动测试超时的诊断。包含本报告的最终主分支提交另由 [主项目工作流](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) 和 [Android 工作流](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml) 校验，以对应提交结果为准。

The Dot fix passed [main-project CI](https://github.com/Alias1027/wardnote/actions/runs/42317479064) and [Android CI](https://github.com/Alias1027/wardnote/actions/runs/42317479078). A single rerun of the unchanged historical tag also [passed](https://github.com/Alias1027/wardnote/actions/runs/42243353538/attempts/2), supporting the test-startup diagnosis. The final main-branch commit containing this report is checked separately by the [main-project](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) and [Android](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml) workflows; refer to the results for that commit.

main 分支为维护后的源码；[v0.6.17-preview.1](https://github.com/Alias1027/wardnote/releases/tag/v0.6.17-preview.1) 的标签、源码归档、Windows/PWA 安装部署包、APK 和校验值继续固定。此次不重新发布安装包、不移动标签、不替换附件。实际患者数据、签名材料和 C 盘模板不纳入提交。

The main branch carries source maintenance. The [v0.6.17-preview.1](https://github.com/Alias1027/wardnote/releases/tag/v0.6.17-preview.1) tag, attached source archive, Windows/PWA packages, APK and checksums remain fixed. No installers are republished, tags moved or assets replaced. Patient data, signing materials and local C-drive templates are excluded from this commit.

真实设备、完整班次、低配置设备、母语临床审校及临床使用效果仍留待后续反馈。

Physical-device and full-shift operation, low-resource performance, native clinical-language review and clinical outcomes remain for subsequent feedback.
