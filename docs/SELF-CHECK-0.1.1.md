# Android 0.1.1 自检与修复 / Self-check and fixes

日期 / Date: 2026-10-23。基线 / Baseline: Android 0.1.0-preview; Web 0.6.15 UI r1.

## 已修复 / Fixed

1. **导入过程中关闭窗口**：模拟延迟原生音频读取时，关闭按钮能够关闭窗口，并提前触发文件释放。回归测试先复现失败，再验证修复。提交保存期间禁用关闭按钮，并阻止系统取消事件；完成或失败后恢复正常操作。手动导入在读取、创建记录、分块写入和完成前核对账号/患者上下文。
   **Dismissal during import:** a delayed native read reproduced a close action that dismissed the dialog and released the file too early. The regression failed before repair and passed afterwards. Closing and system-cancel actions are blocked while submitting; normal controls return after completion/failure. Manual import checks account/patient context around asynchronous reads, record creation, chunk writes and finalization.
2. **手动导入确认不一致**：原先补充说明未标明必填，底层却拒绝空说明。现与系统录音采用一致的患者显示和勾选确认，补充说明选填；未确认不会创建录音。原声不自动填入临床表单。
   **Inconsistent import confirmation:** the previous form did not mark notes as required although empty notes were rejected. Manual import now uses the same patient display and explicit checkbox as system recording; additional notes are optional. Unconfirmed audio is not created or automatically inserted into clinical fields.
3. **更新身份与版本检查**：构建从 `package.json` 读取版本和递增的 `androidVersionCode`，原生界面报告实际安装包版本。核验脚本对照前版 APK，确认应用标识、签名一致且版本号上升；固定本地 origin、WebView 私有目录和加密格式保持不变。
   **Update identity/version checks:** builds read the release version and increasing `androidVersionCode` from `package.json`; the native bridge reports the installed package version. Verification compares both APKs for the same application ID/signing certificate and a higher versionCode. The local origin, private WebView directory and encryption format remain unchanged.

## 本轮验证 / Verification

- 10 项核心测试：八语目录、音频类型/大小、分块和上下文检查、异常短读、取消、写入/回读失败、缺少安全存储能力时拒绝启动、稳定存储标识及原版格式一致性。
- 16 项桌面 Chromium 集成检查：首次加载无 SW/外部请求，八语登录、六个患者分区及设置窄屏界面，系统录音返回二次确认/无工具回退，真实 WAV 测试文件手动导入，加密字节核对，保存失败时退出保护，备份双向恢复及错误备份拒绝。
- 3 项桌面持久配置升级模拟：关闭旧版进程，以新资源在同一 origin 重启；个人/机构同名账号的记录与历史分别保持一致，18 MiB 合成音频散列不变；跨越 16 MiB 分卷边界的备份完整恢复；无外部流量、保持脱机。
- APK 编译、v2/v3 签名、ZIP 对齐、57 项资源逐字节一致、无 Android 权限请求。与 0.1.0 的签名/应用标识相同，versionCode 1 → 2。

The run comprises **10 core tests, 16 desktop Chromium integration checks and 3 persistent-profile upgrade checks**, plus APK build/signature/alignment/asset verification. The upgrade simulation preserves separate personal/institutional accounts, revisions and the exact hash of an 18 MiB synthetic audio fixture across a cold desktop-browser restart. A backup spanning multiple bounded parts restores the same bytes. Existing browser/PWA backup formats remain compatible.

证据 / Evidence: [core](../logs/android-core-results.txt), [browser](../logs/android-browser-results.json), [upgrade](../logs/android-upgrade-results.json), [APK](../logs/android-apk-verification.json), [work log](../logs/WORK-LOG.md).

## 明确边界 / Limits

本轮未运行 Android 模拟器或真实手机。桌面升级模拟不等于 Android 包管理器覆盖安装测试；录音调用及文件选择器使用测试替身，真实厂商工具仍待验证。18 MiB 文件为合成字节压力样本，不等于真实长录音回听或低配置性能验收。八语自动检查不能代替母语临床人员审校。

No Android emulator or physical device was used. Desktop asset/storage simulation does not validate Android package-manager installation. Recorder and file-picker calls use test doubles; OEM behavior remains pending. The 18 MiB fixture tests synthetic bytes, not long-recording playback or low-end-device performance. Automated language checks do not replace native clinical review.

更新前先结束外部录音并确认导入、保存所有记录、导出并核验完整备份，再覆盖安装；不要卸载或清除数据。应用不能阻止外部安装器强制更新、系统杀进程或存储硬件故障，不能承诺尚未提交的表单在这些情况下保留。系统录音工具可能保留或自行同步原文件；本应用不删除外部原件。

Before updating, finish external recording and confirm import, save records, export and verify a complete backup, then install over the existing app. Do not uninstall or clear data. The app cannot block forced installer updates, OS process termination or storage failure; unsubmitted forms cannot be guaranteed in those cases. External recorders may retain/sync originals; WardNote does not delete them.

云同步、离线语音转写仍为后续方向；iOS/Apple 不在本轮范围。真实设备、临床和机构流程验证留待后续反馈。未创建仓库或发布 GitHub。

Cloud sync and offline transcription remain future work; iOS/Apple are outside scope. Device, clinical and institutional-workflow validation remain deferred. No repository was created and nothing was published to GitHub.
