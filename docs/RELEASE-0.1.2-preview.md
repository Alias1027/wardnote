# WardNote Android 0.1.2-preview · 首次预发布说明 / First prerelease notes

**待发布草稿 / Prepared, not published.** 建议标签 / Suggested tag: `android-v0.1.2-preview`.

## 中文

循记临床（WardNote）Android 脱机预览版是独立、便携的查房记录与工作备忘工具，支持按患者持续记录、人工核对及加密备份。它不替代医院的正式病历、医嘱、签署、人员身份管理和制度执行。

### 本次提供

- **首次脱机使用**：程序资源内置于 APK，无需首次访问 HTTPS 网站；设备须已具备兼容的 Android System WebView。
- **八种界面语言**：简体中文、英语、西班牙语、法语、俄语、阿拉伯语、印地语、乌尔都语，含阿拉伯语与乌尔都语从右向左布局。
- **本地记录与录音导入**：按账号及个人／机构模式隔离加密工作区；优先调用手机现有录音应用，返回后由用户确认患者并导入；不支持返回文件时可手动导入。
- **兼容加密备份**：沿用 `.wnmanifest` 与 `.wnpart` 分卷格式，并保留旧版单份 JSON 恢复；恢复到同一模式的新账号，不覆盖现有账号。
- **0.1.2 安全修复**：文件传输期间保护账号／患者上下文；处理文件选择被系统策略拒绝的情况；拒绝写入或删除已有及无法验证的目标，清理失败明确提示。

### 版本与附件

| 项目 | 本次范围 |
| --- | --- |
| Android | `0.1.2-preview`，versionCode `3`，包名 `org.wardnote.offline.preview` |
| 界面基线 | WardNote 浏览器／PWA `0.6.15 UI r1`；保留原交付及冻结包，不以 Android 包替换 |
| 安装包 | `wardnote-android-0.1.2-preview.apk`；与既有 0.1.2 交付字节一致 |
| 源码与发布材料 | `wardnote-android-0.1.2-preview-source-r1.zip`；r1 代表发布材料和自动检查整理，不是新的 Android 运行时版本 |
| 完整性 | 下载对应 `.sha256` 与 `SHA256SUMS.txt`；核对安装包和源码包散列 |

最低 Android 8.0（API 26）；WebView 还须支持安全上下文、Web Crypto、IndexedDB 和 Web Locks。尚无经过各厂商验证的通用最低 WebView 版本，不保证所有 Android 8+ 设备兼容。当前 APK 不申请 `INTERNET` 权限；**没有联网转写、离线语音识别或云同步**。外部录音应用和文件提供程序可能保留原件或自行联网，须单独检查其设置。

### 更新与资料保护

沿用 0.1.0／0.1.1 的应用标识及签名。更新前完成录音导入和记录保存，导出并核验完整加密备份，再覆盖安装；**不要先卸载或清除数据**。同名账号不会自动同步浏览器和 Android 资料。其他人自行签名构建的 APK 不能作为本次签名身份的直接升级。

### 验证与反馈

当前运行时已通过 **15 项自动测试、18 项桌面 Chromium 模拟桥接检查、3 项桌面存储升级模拟**及宿主机 APK 核验；15 项中有一项 JVM 测试包含 10 个文档故障情景，不能重复计数。详见[验证记录](VALIDATION.md)及[安全审查](SECURITY-REVIEW-0.1.2.md)。发布材料新增自动检查配置；GitHub 上的实际运行待建仓后完成。

**尚未进行 Android 真机／模拟器安装、厂商录音往返、低配置完整班次、母语临床审校或临床验证。** 本阶段不开展 iOS 或其他苹果产品适配。欢迎在公开发布后使用虚构病例反馈；请提供型号、Android/WebView 版本、录音应用、文件提供程序及升级方式，勿上传患者信息、原声、备份或密码。安全问题依 [SECURITY.md](../SECURITY.md) 私密报告。

版权归 Junhui Liu M.D. 所有。本版遵循 [WardNote Personal Noncommercial Source-Available License 1.0](../LICENSE)，属于源码可见软件，**不是 OSI 开源许可**。个人许可不授权真实临床照护；机构／商业使用须事先取得书面授权。既往有效授权及第三方许可各自保留。

## English

WardNote Android Offline Preview is an independent portable ward-round notebook and work aid with longitudinal patient notes, human review and encrypted backups. It does not replace institutional medical records, orders, signatures, identity management or official processes.

### Included

- **Offline first launch:** application resources ship in the APK; no initial HTTPS site visit is required. A compatible Android System WebView must already be available.
- **Eight interface languages:** Simplified Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu, including right-to-left layout for Arabic and Urdu.
- **Local notes and recording import:** encrypted workspaces are separated by account and personal/institutional mode. The app invokes an existing recorder, then asks the user to confirm the patient and import the result; manual import is available when a recorder does not return a file.
- **Compatible encrypted backups:** `.wnmanifest`/`.wnpart` sets and legacy single-JSON restore remain supported. Restore into a new account in the same mode, without overwriting existing accounts.
- **0.1.2 security repairs:** account/patient context is protected during transfers; picker-policy failures are handled; existing or unverifiable targets are not opened or deleted, and unconfirmed cleanup is reported.

### Versions and assets

| Item | Scope |
| --- | --- |
| Android | `0.1.2-preview`, versionCode `3`, application ID `org.wardnote.offline.preview` |
| Interface baseline | WardNote browser/PWA `0.6.15 UI r1`; the original and frozen packages remain separate |
| Installer | `wardnote-android-0.1.2-preview.apk`, byte-identical to the retained 0.1.2 installer |
| Source and release material | `wardnote-android-0.1.2-preview-source-r1.zip`; r1 revises release material and automated checks, not the Android runtime version |
| Integrity | Verify the matching `.sha256` files and `SHA256SUMS.txt` for the APK and source archive |

Android 8.0 (API 26) is the minimum, with additional WebView requirements for a secure context, Web Crypto, IndexedDB and Web Locks. No universal minimum WebView version has been validated across manufacturers; compatibility with every Android 8+ device is not promised. This APK requests no `INTERNET` permission and provides **no online transcription, offline speech recognition or cloud synchronization**. External recorders and document providers may retain originals or use their own network services; review their settings separately.

### Updating and preserving data

The application ID and signing identity are retained from 0.1.0/0.1.1. Finish recording/import, save work, export and verify a complete encrypted backup, then install over the existing app. **Do not uninstall or clear app data first.** Matching usernames do not synchronize browser and Android records. Independently re-signed builds cannot replace this installer as a same-identity update.

### Evidence and feedback

The runtime passed **15 automated tests, 18 desktop Chromium checks with a simulated native bridge, 3 desktop storage-upgrade simulations**, and host-side APK verification. One of the 15 tests runs 10 document-fault scenarios on a host JVM; these are not 10 additional tests. See the [validation record](VALIDATION.md) and [security review](SECURITY-REVIEW-0.1.2.md). Automated workflow configuration is prepared; actual GitHub execution awaits repository creation.

**No Android physical-device/emulator installation, OEM recorder round trip, full-shift low-resource use, native-language clinical review or clinical validation has been completed.** iOS and other Apple products are outside this phase. After publication, please report synthetic-case feedback with device model, Android/WebView versions, recorder, document provider and installation/update path. Do not upload patient information, recordings, backups or credentials. Report security issues privately under [SECURITY.md](../SECURITY.md).

Copyright Junhui Liu M.D. The [WardNote Personal Noncommercial Source-Available License 1.0](../LICENSE) applies. This is source-available software, **not OSI-approved open source**. Personal permission does not authorize clinical care; institutional/commercial use requires prior written authorization. Prior valid grants and third-party licenses retain their separate effect.
