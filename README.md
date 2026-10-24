# 循记临床 · Android 脱机预览版

[English](README.en.md)

**Android 0.1.2-preview／发布材料 r1 已于 2026-10-24 首次预发布**，基于 WardNote 0.6.15 UI r1。查看[正式发布页面](https://github.com/Alias1027/wardnote-android/releases/tag/android-v0.1.2-preview)。这是技术预览版，真机及临床验证仍待后续反馈。

| 下载 | 链接 |
| --- | --- |
| Android 安装包（APK） | [下载 wardnote-android-0.1.2-preview.apk](https://github.com/Alias1027/wardnote-android/releases/download/android-v0.1.2-preview/wardnote-android-0.1.2-preview.apk) |
| 固定 r1 源码包 | [下载 source-r1.zip](https://github.com/Alias1027/wardnote-android/releases/download/android-v0.1.2-preview/wardnote-android-0.1.2-preview-source-r1.zip) |
| 文件校验值 | [下载 SHA256SUMS.txt](https://github.com/Alias1027/wardnote-android/releases/download/android-v0.1.2-preview/SHA256SUMS.txt) |

`main` 分支的说明可在发布后继续修订；已发布 APK、source-r1 附件及发布标签保持原版本。下载固定 r1 请使用上表或 Release 附件。中英文[使用说明](docs/ANDROID-USER-GUIDE.md)、[快速开始](docs/开始使用-Android.txt)、[发布说明](docs/RELEASE-0.1.2-preview.md)及[安全问题反馈](SECURITY.md)均可直接查阅。

最低 Android **8.0（API 26）**；设备内 WebView 还必须通过安全上下文、Web Crypto、IndexedDB 和 Web Locks 能力检查。建议使用已更新的 Android System WebView；尚未验证一个适用于所有厂商的最低 WebView 版本号，不能仅凭 Android 版本判断兼容性。

循记临床（WardNote）是便携式查房记录与工作备忘工具，围绕单个患者持续记录初诊背景、每日变化、评估与计划、检查、备忘及交接。它辅助临床思维训练和患者管理，不取代医院的正式病历、医嘱、签署、身份管理或制度执行。

## 本版范围

| 项目 | Android 预览版范围 |
| --- | --- |
| 首次脱机使用 | 程序资源随安装包提供；无需首次连接 HTTPS 站点或部署服务器。仍须设备预先具备可用的 Android System WebView 及本版要求的网页能力。 |
| 八种界面语言 | 简体中文、英语、西班牙语、法语、俄语、阿拉伯语、印地语、乌尔都语；阿拉伯语与乌尔都语采用从右向左布局。 |
| 本地账号 | 复用按账号和个人／机构模式隔离的加密工作区；切换前须注销。它不是医院实名认证系统。 |
| 录音 | 优先调用设备现有录音应用，返回后由用户核对目标并导入；没有兼容录音应用时使用“导入录音”。不重新开发录音引擎。 |
| 备份与恢复 | 沿用 `.wnmanifest` + `.wnpart` 加密分卷格式，并保留旧版单份 JSON 恢复入口。恢复到同一模式的新账号，不覆盖现有账号。 |
| 网络 | 当前 Android 包不申请 `INTERNET` 权限，不提供云同步、模型调用或联网语音转写；这些列入后续计划。 |
| 适配范围 | 本轮仅 Android；不开展 iOS 或其他苹果平台适配。真实设备、完整班次和临床验证待后续反馈。 |

**系统录音应用和文件选择器属于另外的应用／系统服务。** 它们可能在共享存储中保留原音频，或使用自己的云端同步。WardNote 导入的副本加密保存，并不意味着外部原文件被加密、删除或禁止上传。请选择允许使用的录音应用及其脱机设置；本版不自动删除外部原文件。八种界面语言也不等于八种语言的离线语音识别。

## 开始使用

1. 在手机浏览器[下载 APK](https://github.com/Alias1027/wardnote-android/releases/download/android-v0.1.2-preview/wardnote-android-0.1.2-preview.apk)；也可先在电脑下载，再通过 USB 或其他可信方式传入手机。可对照[校验文件](https://github.com/Alias1027/wardnote-android/releases/download/android-v0.1.2-preview/SHA256SUMS.txt)确认完整性。安装后首次使用可保持脱机，无需自行部署 HTTPS 服务器。
2. 在 Android 手机上安装预览 APK。仅对本次安装所用的可信文件管理器临时允许“安装未知应用”；完成后可关闭该权限。
3. 打开应用，选择语言和个人／机构模式，创建账号与密码。首次使用可保持飞行模式；请先用虚构病例检查记录、退出重开、录音返回和备份恢复。
4. 在“备忘”中选择“开始录音”，确认当前患者与录音安排。录制在设备录音应用中完成；返回后核对目标，确认导入并回听。若录音应用不返回文件，手动选“导入录音”。
5. 定期导出并核验加密备份。**卸载应用或清除应用数据会删除此安装版的本机副本**；更新前先保存、核验独立备份，使用同一应用标识和签名的升级包。

完整操作及文件位置边界见[使用说明](docs/ANDROID-USER-GUIDE.md)。开发者可按[构建与复核](docs/BUILD-TOOLCHAIN.md)重复构建及检查；结果及后续工作见[验证记录](docs/VALIDATION.md)和[后续路线](docs/ROADMAP.md)。

当前 0.1.2 运行时已有 15 项自动测试（其中一项含 10 个原生文档故障情景）、18 项桌面 Chromium 模拟原生桥接检查、3 项桌面存储升级模拟检查，以及 APK 签名、校验和 57 个资源逐字节核对的通过记录。此外有 12 项公开打包边界检查。[首次推送托管检查](https://github.com/Alias1027/wardnote-android/actions/runs/40047905103)与[发布标签托管检查](https://github.com/Alias1027/wardnote-android/actions/runs/40049429003)均已通过；详细证据见[验证记录](docs/VALIDATION.md)。**尚未进行 Android 模拟器或真机安装、系统录音往返及临床验证**。

## 问题、建议与授权联系

- [提交问题或建议](https://github.com/Alias1027/wardnote-android/issues/new/choose)：使用 GitHub 账号登录，选择相应模板，填写应用、手机、Android／WebView、录音工具版本和复现步骤。
- [私密报告安全问题](https://github.com/Alias1027/wardnote-android/security/advisories/new)：入口已启用；安全漏洞请走私密渠道。未登录时会先进入 GitHub 登录页。
- 仅用虚构病例反馈，不上传真实病历、原始录音、加密备份、密码或密钥。授权申请联系 junhuiliu1025@gmail.com；机构模式本身不代表已获得使用许可。

## 与浏览器／PWA 的关系

三种入口各自使用自己的本机副本。相同账号名不会自动共享资料；浏览器/PWA 账号也不会因安装 Android 包而消失。通过兼容格式的完整加密备份转移资料，恢复时使用原备份密码和新的目标账号名。本版不承诺自动合并两端修改。

Android 程序通过重新安装受信任的升级 APK 更新，不使用浏览器的 Service Worker 缓存更新流程。不要卸载或清除应用数据来解决旧版本显示；先保存和备份，再核对安装包版本、应用标识及签名。

## 许可与验证范围

版权归 **Junhui Liu M.D.** 所有。原有 [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE) 同样适用于本版新增的项目自有 Android 代码与文档：符合条款的个人非商业学习、研究、实验与测试可使用；商业或机构使用须事先取得书面授权。此为源码可见许可，**不是 OSI 认可的开源许可**。既往有效授权和第三方许可保持各自效力。授权联系：junhuiliu1025@gmail.com。

源代码检查、编译或模拟检查不能代替真实 Android 设备及临床验证。当前验证结果须按[验证记录](docs/VALIDATION.md)逐项读取；未验证内容不会标记为可用于真实患者的成熟能力。

## 先前自检修复（0.1.1）

0.1.1 阻止录音加密导入时关闭确认窗口；手动导入与系统录音统一显示患者并要求勾选确认，补充说明选填。保存失败时保留输入，系统返回不退出。安装包与 0.1.0 使用相同应用标识和签名，versionCode 从 1 增至 2。更新前完成录音与保存、导出并核验备份，随后覆盖安装；应用不能阻止从系统安装器强制更新或系统终止进程。详见[自检说明](docs/SELF-CHECK-0.1.1.md)。

## 0.1.2 安全修复

已安装并应用两项选定安全技能。导出全程核对账号及患者，传输期间阻止切换；文件选择被策略拒绝时保留当前界面。新文件保护拒绝写入或删除已有及无法验证的目标；清理失败会明确提示。详见[安全审查报告](docs/SECURITY-REVIEW-0.1.2.md)。包标识及签名保持一致，versionCode 从 2 增至 3；真机和临床验证仍待后续反馈。
