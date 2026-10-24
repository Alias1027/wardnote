# Android 脱机预览版使用说明 / Android offline preview guide

Android **0.1.2-preview / r1** · Web **0.6.15 UI r1** · 发布 / Published 2026-10-24

[下载 APK / Download APK](https://github.com/Alias1027/wardnote/releases/download/android-v0.1.2-preview/wardnote-android-0.1.2-preview.apk) · [发布说明 / Published release](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview) · [校验文件 / Checksums](https://github.com/Alias1027/wardnote/releases/download/android-v0.1.2-preview/SHA256SUMS.txt)

[问题与建议 / Issues and suggestions](https://github.com/Alias1027/wardnote/issues/new/choose) · [私密安全报告 / Private security reporting](https://github.com/Alias1027/wardnote/security/advisories/new)

反馈需 GitHub 登录，只提交虚构病例和非敏感信息。八语界面已提供；真机及临床验证仍未完成。原始 r1 附件不因本说明更新而替换。 / Sign in to GitHub and use synthetic, non-sensitive feedback only. Eight interface languages are included; physical-device and clinical validation remain incomplete. This documentation update does not replace the original r1 attachments.

## 1. 安装与首次使用 / Install and first launch

程序资源随 APK 提供，首次启动无需访问 HTTPS 站点。Android 安装版内的安全网址用于读取包内文件，不表示向该网址上传资料。最低 Android **8.0（API 26）**；System WebView 必须具备安全上下文、Web Crypto、IndexedDB 和 Web Locks，并通过启动检查。建议更新 WebView，尚未确认跨厂商统一的最低 WebView 版本。若设备缺少必要组件，可能需要先在允许联网的环境更新系统组件，之后才可脱机使用；不保证任意旧设备首次即用。实际构建结果以交付清单与[验证记录](VALIDATION.md)为准。

The APK includes application resources. First launch does not require visiting an HTTPS website. Its internal secure origin serves packaged files and does not imply uploading data to that origin. Minimum Android is **8.0 (API 26)**. System WebView must provide a secure context, Web Crypto, IndexedDB and Web Locks and pass startup checks. Use an updated WebView; a universal minimum version across manufacturers has not been verified. A device missing required components may need a system-component update in an authorized connected environment before offline use; arbitrary old devices are not guaranteed to work immediately. Actual build results are recorded in the delivery manifest and [validation record](VALIDATION.md).

安装后选择语言、个人或机构／医院模式，创建账号及本机密码。保存记录后等待“已保存到本机”，再退出。切换账号和模式前先注销。账号名不是医院实名身份；机构模式不代替机构使用书面许可。本机密码遗失不能由作者代为解密，应把密码与备份分开妥善保存。

After installation choose a language, personal or institution/hospital mode, and create a local account and password. Wait for Saved on this device before leaving after an edit. Sign out before switching accounts or modes. Account names are not verified hospital identities, and institutional mode does not replace written institutional-use authorization. The author cannot decrypt records for a lost local password. Keep the password safely and separately from backups.

## 2. 系统录音与导入 / System recording and import

1. 打开正确患者的“备忘”，选择“开始录音”，核对患者、账号、录音标题及本次告知安排。不要将真实患者信息写进外部录音应用的文件名或不必要的标题。
2. 设备有兼容录音应用时，由系统打开该应用。录制、暂停、停止、锁屏行为和麦克风权限均由该应用管理。
3. 停止后返回 WardNote，核对当前患者和接收位置，确认导入。等待导入完成并回听；只有成功导入的副本才属于 WardNote 已保存音频。
4. 若没有可调用的录音应用，或应用录完未返回音频，先在允许使用的录音应用中保存，再回到 WardNote 选择“导入录音”。取消操作不会生成完成录音。
5. 切换应用期间如果 Android 回收 WardNote、账号被锁定或患者上下文改变，不应把音频自动写入另一位患者。重新登录并核对目标后手动导入原文件；不要反复尝试并产生多份不明归属的记录。

1. Open Memos for the intended patient, choose Start recording, and check patient, account, title and the recording arrangement. Avoid patient identifiers in external recorder filenames or unnecessary titles.
2. If a compatible recorder exists, Android opens it. That app owns recording, pause/stop controls, lock-screen behavior and microphone permission.
3. Return to WardNote after stopping. Check the patient and destination, confirm import, wait for completion and listen back. Only a successfully imported copy is saved WardNote audio.
4. If no compatible recorder is available, or it does not return audio, save with an approved recorder and use Import recording in WardNote. Cancellation does not create a completed recording.
5. If Android reclaims WardNote while the recorder is open, the account locks or patient context changes, audio must not be silently assigned to a different patient. Sign in again, check the destination and import the original manually; avoid repeated attempts that create copies with uncertain ownership.

**外部副本边界 / External-copy boundary:** WardNote 仅对导入本机工作区的副本应用自身加密。系统录音应用可能另外保留原文件，也可能有云备份；Android 文件选择器也可能展示云盘。WardNote 的脱机状态及不申请网络权限不能控制这些应用。真正需要脱机时，使用本地文件位置，并检查录音工具、输入法和系统自身的设置。原文件不由 WardNote 自动删除；仅在导入回听、独立备份及使用要求均确认后，由使用者决定是否清理。

WardNote encrypts the copy imported into its local workspace. The recorder may retain an original or use cloud backup, and Android's document picker may expose cloud providers. WardNote's offline state and lack of network permission do not control those apps. Use local destinations and check recorder, keyboard and system settings when fully offline operation is required. WardNote does not delete the original automatically. Decide whether to remove it only after checking imported playback, an independent backup and applicable requirements.

本版不提供实时或离线语音转写。可以手工输入已有转写文本；已有本地归类能力提供候选内容，仍须人工核对才填入对应分区。转写文本不能被当作原声内容已经准确验证。

This preview does not provide live or offline speech transcription. Existing transcription text may be entered manually; local routing produces candidates that require human review before insertion. A transcript is not evidence that its accuracy against the original audio has been verified.

本版单次原生录音导入上限为 **100 MiB**。导入覆盖常见录音类型（包括 AMR、3GPP 和 AAC），保留原文件格式，不自动转码。能否播放由设备 WebView／浏览器的编解码能力决定。备份格式互通表示可保留、恢复同一音频字节，不保证所有桌面浏览器都可直接播放每一种手机录音格式；转移后须实际回听。

This preview limits each native recording import to **100 MiB**. It accepts common recording types, including AMR, 3GPP and AAC, and preserves the original format without automatic transcoding. Playback depends on the device WebView/browser codecs. Backup compatibility preserves and restores the same audio bytes; it does not guarantee that every desktop browser can play every phone-recording format. Check playback after transfer.

## 3. 加密备份、核验与恢复 / Encrypted backup, verification and restore

当前账号已保存的文字、来源关系、修改历史、核对状态及本机原声沿用现有加密备份格式。浏览器、PWA 和 Android 不能通过相同账号名自动共享资料。

The current account's saved text, source links, revision history, review state and locally available audio use the existing encrypted backup format. Browser, PWA and Android data are not shared merely by matching account names.

1. 先保存记录并结束导入。在“设置与帮助”或“数据管理”导出本机加密备份，选择**本地**可写位置。保存全部 `.wnpart` 和最后的 `.wnmanifest`，保留原始文件名。
2. 等待全部文件保存完成。取消、中断或存储空间不足可能只留下部分文件；仅有清单或部分分卷不能恢复。选择系统文件提供程序并不代表文件必然写到手机本地。
3. 使用“核验备份文件”，重新选择实际保存的清单和同组全部分卷，输入原备份密码，核对文件、记录、录音数量。重要备份另存到独立介质。
4. 恢复前注销；选择与备份相同的个人／机构模式，输入**新账号名**、原备份密码，并选完整文件集合。已有账号不会被覆盖。恢复后抽查文字、来源、修改历史及原声。

1. Save work and finish imports. Export the encrypted device backup in Settings & Help or Data management, choosing a writable **local** destination. Keep all `.wnpart` files and the final `.wnmanifest` with their original names.
2. Wait for all writes to finish. Cancellation, interruption or insufficient space may leave an incomplete set. A manifest alone or only some parts cannot restore the backup. Selecting a document provider does not establish that files are stored locally.
3. Use Verify backup files, select the actual saved manifest and all matching parts again, and enter the original backup password. Check file, record and recording counts. Keep important backups on independent media as well.
4. Sign out before restoring. Select the same personal/institutional mode, supply a **new account name**, the original backup password and the complete file set. Existing accounts are not overwritten. Inspect restored text, provenance, revisions and audio afterwards.

备份格式限制保持一致：每个分卷最多 **16 MiB**，既有格式的单段录音最多 **256 MiB**；本版新的原生录音导入另受 **100 MiB** 上限约束。旧版单份 JSON 备份恢复上限 **600 MiB**，当前独立核验入口用于分卷格式。格式上限不是已验证手机容量。旧版 0.6.11 及更早版本不能读取新分卷格式；使用支持该格式的浏览器版本进行往返转移。

Backup format limits remain **16 MiB per part**, **256 MiB per recording in the existing format**, and **600 MiB for legacy single-JSON restore**. New native recording imports in this preview have a separate **100 MiB** limit. The standalone verification entry is for segmented backups. These format limits are not validated phone capacities. Version 0.6.11 and earlier cannot read the segmented format; use a compatible browser version for round-trip transfers.

卸载、清除应用数据、设备故障或丢失可能使本机资料不可恢复。系统自动备份不能替代经过核验的 WardNote 加密备份；本预览版不把系统云备份当作恢复方案。

Uninstalling, clearing app data, device failure or loss may make local data unrecoverable. System auto-backup does not replace a verified WardNote encrypted backup and is not this preview's recovery strategy.

## 4. 语言与更新 / Languages and updates

| 界面 / Interface | 代码 / Code | 排版 / Direction |
| --- | --- | --- |
| 简体中文 | zh | 从左向右 / LTR |
| English | en | LTR |
| Español | es | LTR |
| Français | fr | LTR |
| Русский | ru | LTR |
| العربية | ar | 从右向左 / RTL |
| हिन्दी | hi | LTR |
| اردو | ur | RTL |

切换语言只影响界面和提示，不自动翻译既往病历文本，也不修改已生成摘要的语言、药物名称、剂量或单位。系统录音、文件选择和系统授权窗口的语言由 Android 或相应应用决定，不一定随 WardNote 切换。八语覆盖和排版检查不能代替母语临床使用者对译文的核对。

Language changes affect interface labels and prompts; they do not automatically translate existing clinical text, change previously generated summaries' language or alter medicines, doses or units. Recorder, picker and permission-dialog languages are controlled by Android or the owning app and may not follow WardNote's selection. Coverage and layout checks do not replace review by native-speaking clinical users.

本版通过受信任的 APK 更新，不使用浏览器缓存更新。应用标识为 `org.wardnote.offline.preview`。更新前结束录音／导入，保存记录，导出并核验独立备份。后续安装包应使用相同应用标识与签名。不要卸载或清除数据来尝试升级；也不要直接安装旧版本覆盖新数据。若升级签名不同或系统拒绝更新，保留当前安装和资料，先核对交付说明。

This version updates through a trusted APK rather than browser caches. Its application ID is `org.wardnote.offline.preview`. Finish recording/imports, save work and verify an independent backup first. An upgrade must retain the application identity and signing key. Do not uninstall or clear data to attempt an upgrade, and do not install older code over newer data without a verified compatibility path. If the signature differs or Android rejects an update, preserve the current installation and data while checking delivery instructions.

## 导出中断与文件检查 / Interrupted exports

录音或文件传输期间请等待完成后再切换账号/患者。账号独立失效会中止后续导出。若提示无法确认清理，请在文件选择器所选目录检查未完成文件；不要把残缺备份当成成功备份。只有完成并重新核验的完整清单及所有分卷才可用于恢复。应用无法撤回已经交给外部文件提供程序的字节，也不会删除原始录音或已有目标文件。

Wait for recording/file operations before changing accounts or patients. Independent session invalidation aborts subsequent export. If cleanup cannot be confirmed, inspect the selected folder; incomplete output is not a successful backup. Retain and verify the manifest and every part. Bytes already handed to an external provider cannot be recalled; original recordings and existing destination files are not deleted.

## 安装渠道与地区 / Installation channel and region

Android 开发者验证及安装保护正按地区、渠道分阶段实施；GitHub 提供 APK 不意味着所有地区或设备均可直接安装。本预览尚未验证各厂商/渠道的安装体验。请按设备正常安装指引操作，遇到限制时记录非敏感错误与设备版本，不关闭系统安全保护来绕过限制。当前规则见 [Android 官方开发者验证说明](https://developer.android.com/developer-verification)。

Android developer verification and installation protections are being introduced by region and distribution channel. An APK hosted on GitHub is not a promise of direct installation on every device. OEM/channel installation behavior is not validated by this preview. Follow normal device instructions; report non-sensitive errors and versions instead of bypassing system protections. See the linked current Android guidance.
