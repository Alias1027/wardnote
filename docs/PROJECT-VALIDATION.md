# 整体发布验证 / Combined publication validation

本轮版本 / Current revision: **Web 0.6.15 UI r3 · Android 0.1.4-preview**. [对话整理说明与本轮验证范围 / Conversation changes and validation scope](RELEASE-v0.6.15-preview.3.md). 以下旧版本验证保留原日期与范围。 Historical evidence below retains its original dates and scope.

此前统一预发布 / Previous aligned release: [0.6.15 UI r2 + Android 0.1.3-preview + original V007 PDFs](RELEASE-v0.6.15-preview.2.md). New evidence is recorded in the Release and delivery log; historical results below are not relabeled as new tests.

Current 2026-10-25 copy-update scope and evidence: [UI r2 / Android 0.1.3-preview](INTRODUCTION-UPDATE-20261025.md). The original release evidence below retains its original versions and dates. / 本轮文案更新及验证范围见该说明；以下原发布证据保留原版本与日期。

2026-10-24 · **0.6.15 UI r1 + Android 0.1.2-preview**.

## Evidence attribution / 证据归属

- Main-project existing local evidence: **167** core/API/publication checks, **320** browser checks across 21 suites; **11** UI r1 memo checks; final **29** publication checks. These retain their original 2026-10-21 attribution. [Detailed evidence](../browser-pwa/docs/VALIDATION.md)
- Android existing evidence: **15** core checks, **18** desktop bridge simulations, **3** desktop upgrade simulations, **12** packaging boundary tests; APK signature and all **57** bundled resources checked. [Detailed evidence](VALIDATION.md)
- Combined publication: 180 original main-source files preserved; `.gitattributes` packaging adjustment, account-test synchronization and updated manifest, runtime-byte comparisons, exact public-file allowlist, nested fixture integrity, documentation links, whole-source packaging and attachment hashes are checked before release. Hosted results are linked from the Release and the workflows below; no historical result is relabeled as a fresh run.

主项目和 Android 既有证据各保留原始版本与时间。本次整合检查180个原始源码文件的字节一致性、`.gitattributes` 打包规则、账号测试同步及更新清单、运行代码一致性、公开清单、历史夹具、说明链接、完整源码包与附件校验值；实际托管结果见 Release 和下列流程，不把旧证据改记为本轮通过。

## Hosted workflows / 托管流程

- [Main project: Windows/Linux/macOS core and isolated source; Linux Chromium workflows](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml)
- [Android: Windows-hosted regression, package boundaries, ephemeral-signing APK build](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

Both workflows use pinned action revisions and read-only repository permissions. Main-project workflows run from `browser-pwa/`; the nested original workflow remains part of the frozen source and is not separately discovered by GitHub. CI uses fictional accounts/cases/audio and disposable Android signing. It never needs the maintainer's signing private key or patient data.

两条流程使用固定 Action 版本及只读仓库权限。主项目从 `browser-pwa/` 执行；嵌套的冻结流程文件不会被 GitHub 独立触发。自动检查仅用虚构资料及临时 Android 签名，不需要正式升级私钥或患者资料。

## Deferred validation / 后续反馈

Physical Android phones and installed PWAs, OEM recorder/document-provider round trips, low-memory/battery/storage and full-shift behavior, native clinical language review, hospital deployment, real ASR performance and clinical/educational benefit remain unverified. No new Apple-platform work is part of this release. Use synthetic cases for feedback; institutional/commercial evaluation still requires prior authorization.

真实 Android 手机、已安装 PWA、厂商录音与文件服务往返、低配置／电池／存储／完整班次、母语临床审校、医院环境、真实识别效果及临床教学获益仍待后续反馈。本轮不开展苹果平台适配。体验反馈仅用虚构病例，机构及商业评估仍须事先授权。

## Hosted browser test synchronization / 托管浏览器测试时序

The first hosted run passed all three core/source-package jobs and Android, but the browser suite filled an old sign-in form while switching account mode. A controlled synthetic reproduction confirmed that asynchronous mode-status lookup replaced the old filled form with an empty new form. The test now waits for the previous form to disconnect and the intended mode to be selected before typing. No assertion, authentication rule, encryption code or runtime file was relaxed or changed. The original failed run remains visible; the corrected commit is rerun before publication.

首次托管的三平台核心／源码包和Android通过，浏览器脚本在模式切换期间填写旧表单。受控虚构复现确认异步状态读取完成后新表单替换了旧输入；现测试等待旧表单移除及目标模式选中后再输入。未削弱断言或修改认证、加密与运行代码；失败记录保留，修正提交须重新通过托管检查后发布。
