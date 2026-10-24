# WardNote · 循记临床

[English](README.en.md) · [整体预发布](https://github.com/Alias1027/wardnote-android/releases/tag/v0.6.15-preview.1) · [反馈](https://github.com/Alias1027/wardnote-android/issues/new/choose)

**便携式查房记录与单患者持续追踪工具。** 初诊与背景、每日查房、病程记录、检查与化验、患者摘要、备忘、待办、交接与可选决策复盘集中于患者工作区。文字记录为主，语音为辅助；医生核对后使用候选内容。产品辅助临床思维训练和患者管理，医院的正式病历、医嘱、签署及管理流程仍由医院承接。

**本仓库现合并主项目 v0.6.15（含 UI r1）与 Android 0.1.2-preview。** 仓库地址保留 `wardnote-android`，内容已覆盖 Windows、浏览器／PWA 和 Android。两条运行版本保持各自编号；[原 Android r1 发布](https://github.com/Alias1027/wardnote-android/releases/tag/android-v0.1.2-preview)及其五个附件保留。

## 下载与开始使用

| 使用方式 | 下载 | 开始使用与范围 |
| --- | --- | --- |
| Windows x64 电脑 | [一键启动便携包](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/wardnote-0.6.15-portable-win-x64.zip) | 解压后双击 `Start-WardNote.cmd`；内含 Node 运行时。默认本机访问，可脱机记录。 |
| 手机／电脑浏览器、PWA | [静态 PWA 部署包](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/wardnote-0.6.15-static-pwa.zip) | 管理员按随包向导把 `site/` 部署到专用可信 HTTPS 地址；用户打开地址后准备脱机资源，可按浏览器提示安装。尚无公共演示站点。 |
| Android 首次脱机安装 | [APK 安装包](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/wardnote-android-0.1.2-preview.apk) | Android 8.0+，还需满足 WebView 能力检查；下载安装后可首次脱机使用，不需自建 HTTPS。 |
| 主项目开发 | [冻结的 v0.6.15 源码](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/wardnote-0.6.15.zip) | 源码包需 Node.js 24+；运行前阅读包内说明。 |
| 整体项目开发 | [浏览器／PWA＋Android 完整源码](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/wardnote-0.6.15-ui-r1-android-0.1.2-preview-source.zip) | 含两条产品线、统一说明和托管检查。APK 不包含在源码包内。 |
| 完整性核验 | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote-android/releases/download/v0.6.15-preview.1/SHA256SUMS.txt) | 各包另附 `.sha256` 文件；校验用于确认下载完整性。 |

**Windows：** 下载并完整解压便携包，双击启动，先用虚构病例创建记录、退出重开并核验备份。关闭网页不会自动停止本机服务，可从启动面板停止。[部署说明](browser-pwa/docs/EASY-DEPLOYMENT.md)

**手机浏览器／PWA：** 需先有可信 HTTPS 程序地址；它不是公共在线服务。初次准备完成后可脱机重开。静态部署版不提供服务器同步或云端语音识别接口。[八语言使用引导](browser-pwa/docs/GETTING-STARTED.md)

**Android：** 下载 APK 后用可信文件管理器安装，可先由电脑下载后通过 USB 传入。仅按系统要求为本次安装临时允许安装来源，随后按需关闭。程序优先调用已有录音应用，再核对患者并导入；没有兼容录音应用时可手动导入录音。[Android 使用说明](docs/ANDROID-USER-GUIDE.md)

## 共同能力与平台边界

- 八种界面语言：简体中文、英语、西班牙语、法语、俄语、阿拉伯语、印地语、乌尔都语；阿拉伯语与乌尔都语支持从右向左布局。界面切换不改写临床原文；母语临床审校仍待反馈。
- 默认脱机，按账号与个人／机构模式隔离加密工作区。相同账号名不会自动跨设备共享；使用兼容格式的加密备份迁移，恢复到新账号，不自动合并两端修改。
- 主项目提供可选、需明确授权与配置的接口；静态 PWA 不提供服务器功能。Android 不申请 `INTERNET` 权限，没有云同步、模型调用或语音转写；八语言界面不代表八语言离线识别。
- 主项目支持本地录音、来源核对、安全更新提示和分卷加密备份。Android 使用系统录音与文件选择器；外部应用可能自行保留或同步原文件，导入副本加密不控制外部副本。
- 更新前结束录音、保存并核验独立备份。浏览器／PWA 等待使用者确认安全更新；Android 使用同一标识与签名的升级 APK。不要卸载或清除站点／应用数据来处理旧版本显示。

## 项目结构与验证

| 路径 | 内容 |
| --- | --- |
| [browser-pwa/](browser-pwa/README.md) | v0.6.15 UI r1 的完整、冻结主项目源码，含 Windows 启动器、静态部署工具、测试与[公开纸表](browser-pwa/templates/README.md) |
| `android/`、`web/` | Android 原生容器及随 APK 打包的网页资源；`web/` 不能代替独立主项目 |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | 整体发布的版本、检查与待验证范围 |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | 统一安装、更新、源码与历史附件说明 |

[主项目托管检查](https://github.com/Alias1027/wardnote-android/actions/workflows/main-project-ci.yml) · [Android 托管检查](https://github.com/Alias1027/wardnote-android/actions/workflows/android-ci.yml)

主项目既有本机证据为 167 项核心/API/发布检查、320 项浏览器检查及最终 29 项发布专项检查；Android 既有证据为 15 项核心、18 项桌面桥接模拟、3 项桌面升级模拟和 12 项公开打包边界检查。新合并目录另运行托管检查，结果与实际范围见整体验证说明和 Release。所有测试使用虚构资料。真机、系统录音往返、低配置、完整班次、母语临床及医院／临床验证仍留待反馈，不据工程检查宣称临床获益。

整合目录在 `.gitattributes` 增加字节保留规则，并修正账号模式切换测试等待表单重绘的时序，相应更新内部清单；180 个原文件及全部运行代码保持原字节，原始三个下载包完全保留。

冻结 `browser-pwa/` 文档保留 2026-10-21 的准备阶段记录；其中“尚未发布／托管检查待执行”描述当时状态。当前下载、整体发布状态及托管结果以本首页、整体说明和 Release 为准。

## 反馈、参考来源与许可

- [提交问题或建议](https://github.com/Alias1027/wardnote-android/issues/new/choose)：注明 Windows／浏览器／PWA／Android、版本和复现步骤。仅提交虚构资料，不上传病历、录音、备份、密码或密钥。
- [私密报告安全问题](https://github.com/Alias1027/wardnote-android/security/advisories/new)：私密漏洞报告已启用；其他联系与授权申请：[junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)。
- 设计参考包括中国十八项核心制度、美国 CMS-CoPs、Joint Commission NPSG、ACGME CPR、英国 NICE CG50、NHS England／CPOC NatSSIPs 及德国 G-BA QM-RL。详细名称、出处与适用边界见[临床设计参考](browser-pwa/docs/CLINICAL-SCOPE.md)。参考不代表获得认证或完整履行各地制度。

版权归 **Junhui Liu M.D.** 所有。采用 [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE)：许可范围内的独立个人非商业学习、研究、实验与测试可使用，**所有机构及商业用途须事先取得书面授权**。此为源码可见项目，不是 OSI 认可的开源许可；既往有效的 Apache-2.0／CC BY 4.0 授权和第三方许可仍保留各自效力。[授权政策](LICENSES/README.md)
