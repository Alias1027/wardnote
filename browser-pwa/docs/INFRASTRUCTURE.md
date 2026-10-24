# Infrastructure choices / 不同基础设施条件下的使用

Version 0.6.15 · 2026-10-21

## 中文

本工具优先支持独立、便携的查房记录。完成程序与当前浏览器的首次准备后，文字记录、患者持续追踪、本机录音及加密备份不要求接入医院 EMR/HIS、互联网或云模型。0.6.15 降低首次安装和日常维护的门槛，并明确设备条件不足时的提示；这不代表已经证明所有低配置设备、地区或医院环境均可使用。

### 部署与首次准备

- **Windows x64 离线便携包**：独立 ZIP 内含已核验的 Node.js 24.19.0、完整原版许可证、第三方声明和 SHA-256 清单。完整解压后双击 `启动应用.cmd`；不需要另装 Node 或在线运行 npm。包内运行时缺失或被替换时停止启动，不自动联网下载。普通源码 ZIP 保持轻量，仍需 Node.js 24+。
- **浏览器与手机**：兼容浏览器、可写存储、内存和供电仍是必要条件。电脑默认访问 `http://127.0.0.1:8787`；手机首次准备需可访问的可信 HTTPS。手机上的 `127.0.0.1` 指手机自身。PWA 安装方式取决于平台；原生手机 App、旧版 Windows、具体 PDA 型号及后台录音并未因此获得支持认证。
- **离线说明**：两类包均附本文件、[开始使用](GETTING-STARTED.md)、[部署](DEPLOYMENT.md)及[脱机与账号](OFFLINE-AND-ACCOUNTS.md)说明。程序包不包含患者数据、账号或私有配置，也不是患者资料备份。

### 设备、存储与录音

设置中的“设备与脱机状态”只检查本机：安全访问环境、加密和账号锁、本机临时读写、当前版本完整离线资源是否就绪，以及可选录音接口。检查不会读取患者工作区、上传资料或主动打开麦克风；临时读写探针完成后删除。检查通过不等于已备份、获得麦克风授权或通过真实设备性能验证。缺少必要能力时显示暂不支持，不降级为明文保存。

浏览器容量只能估计。读不到容量时显示“未知”，不会假设有无限空间。当前保守策略：估计余量低于 64 MiB 或使用率达到 90% 时提醒；余量低于 16 MiB 或使用率达到 98% 时进入临界状态。导入录音会额外考虑文件大小与加密开销。阈值是保护余量，不是可保证的录音时长或设备最低配置。

本机模式在开始录音、导入音频前检查容量，录音期间定期复查。临界时阻止新增录音或停止当前采集，保留已保存的加密原声片段；不自动删除既有录音，不改为“只保留文字”，也不强行继续采集。仍需确认最后片段保存完成；出现保存失败时按界面重试，未持久保存的内存内容不能保证在关闭页面后恢复。容量预警不会自动压缩或改写原音，未知容量仍要求留意保存状态并及时备份。

### 备份与手动迁移

分卷加密备份每卷最多 16 MiB，须保留全部 `.wnpart` 及最后的 `.wnmanifest`。设置分别显示当前账号的三类状态：

| 状态 | 能证明什么 |
| --- | --- |
| 提供下载 | 程序已将全部文件交给浏览器下载；不能证明用户实际保存到磁盘 |
| 文件夹写入完成 | 浏览器文件接口已完成全部写入；仍建议重新选取文件核验 |
| 核验通过 | 重新选取的备份文件经密码与完整性检查；只对应所核验账号和资料版本 |

资料之后有修改会提示再次备份核验。核验其他备份不能把当前账号标记为已备份；备份状态标记失败也不等于已生成文件失效。未完成的分卷集合不能恢复。备份密码与文件分别妥善保存，核验不替代对实际恢复内容的检查。

“换设备或地址”提示当前资料所在地址及账号：先在原浏览器生成并核验备份，在目标设备准备程序，选相同个人/机构模式，恢复到新账号，再检查记录、修改历史及原声，最后决定是否清理旧副本。默认保持原浏览器与固定来源地址（origin，包括协议、主机及端口）；启动器不自动换端口。不同浏览器或地址的资料不会自动共享，同名账号也不会自动同步。清除浏览器数据可能移除本机工作区，复制程序文件夹并不能搬走浏览器里的资料。

### 地区与显示

“地区与显示”提供年-月-日、日-月-年、月-日-年顺序；跟随设备或选择列表中的显示时区；拉丁数字 0–9 或界面语言数字；A4 或 Letter 打印纸张。设置保存在当前浏览器，不是临床资料或跨设备身份设置。

仅已有明确时区的时间点转换显示时区并注明偏移；仅日期记录及无时区的本地时间不推定时区、不移动日期。DMY/MDY 显示带顺序标识以减少歧义。临床日期输入仍按浏览器原生控件处理，数据保存格式不变。数字偏好用于程序计数和容量等展示，不改写化验结果、剂量、单位或原始文字。换纸张不修改 C 盘纸质模板；实际打印机分页仍待验证。

### 获准公开预发布后的体验验证

当前可执行的代码与合成数据检查见[验证报告](VALIDATION.md)。以下工作在作者另行批准发布后邀请用户自愿反馈，使用虚构病例，不提交患者资料或录音：

- 真实低配置电脑/手机的启动、内存、长时间使用、弱网恢复与耗电；没有给出未经实测的最低内存承诺。
- 首次无 Node 电脑安装体验、真实手机 PWA 安装/重开、浏览器回收存储、实际文件下载及分卷恢复。
- 原音质量、噪声与口音、录音格式和未来压缩参数的影响；目前不为减小容量自动舍弃原音或降低音质。
- 各语言临床人员的术语、从右向左布局、时间/数字阅读、查房流程及实际打印反馈。
- 医院环境的权限、录音授权、设备管理和可选接口验证；产品继续保留便携记录定位。

默认脱机及每次联网单独授权保持不变；自检、地区显示和备份状态不会开启同步、调用模型、上传音频或改写临床原文。

## English

WardNote prioritizes independent, portable ward-round notes. After the program and current browser are prepared, text notes, patient follow-up, local recording and encrypted backups do not require an EHR/HIS, internet access or cloud model. Version 0.6.15 reduces setup and maintenance dependencies and reports missing device capabilities. It does not establish suitability for every low-resource device, region or hospital.

### Deployment and initial preparation

- **Windows x64 offline portable package:** the separate ZIP includes verified Node.js 24.19.0, its complete original license and third-party notices, and SHA-256 evidence. Extract the complete package and open `启动应用.cmd`; no separate Node installation or online npm run is needed. An incomplete or substituted bundled runtime stops startup without downloading a replacement. The small source ZIP still requires Node.js 24+.
- **Browsers and phones:** a compatible browser, writable storage, memory and power remain necessary. The default computer address is `http://127.0.0.1:8787`; a phone needs reachable, trusted HTTPS for initial preparation. A phone's `127.0.0.1` refers to that phone. PWA installation depends on the platform. This does not certify native phone apps, old Windows releases, specific PDA models or background recording.
- **Offline instructions:** both packages include this file, [getting started](GETTING-STARTED.md), [deployment](DEPLOYMENT.md) and [offline/account guidance](OFFLINE-AND-ACCOUNTS.md). A program package contains no patient data, accounts or private configuration and is not a patient-data backup.

### Device, storage and recording

Device and offline status in Settings checks only local capabilities: a secure context, encryption/account locks, temporary local read/write, completeness of the current version's offline resources and optional recording APIs. It does not read the patient workspace, upload data or activate the microphone; its temporary storage probe is deleted. Passing does not establish a backup, microphone permission or physical-device performance. Missing essential capabilities produce an unsupported state, without falling back to plaintext storage.

Browser storage capacity is an estimate. Unavailable estimates appear as unknown, not unlimited. The current conservative policy warns below 64 MiB estimated free space or at 90% usage; below 16 MiB or at 98% usage it is critical. Audio import additionally allows for file size and encryption overhead. These reserves are not guaranteed recording durations or minimum hardware specifications.

Device mode checks before recording/import and periodically during recording. Critical capacity blocks new recording or stops capture, preserving encrypted audio segments already saved. It does not automatically delete existing audio, retain only text or force capture to continue. Check that the final segment was saved; follow retry prompts after a save failure. Unsaved memory content is not guaranteed to survive page closure. Capacity warnings do not recompress or rewrite original audio. Unknown estimates still require attention to saving and timely backups.

### Backup and manual migration

Encrypted backup parts are at most 16 MiB. Keep every `.wnpart` and the final `.wnmanifest`. Settings separates three states for the current account:

| State | What it establishes |
| --- | --- |
| Download offered | All files were offered to the browser; this does not prove they reached disk |
| Folder write completed | Browser file writes completed; reselect the saved files for verification |
| Backup verified | Reselected files passed password and integrity checks for that account and data revision |

Later changes prompt another backup/verification. Checking another backup cannot mark the current account as backed up. A failed status marker does not invalidate successfully written files. Incomplete sets cannot restore. Store passwords and files separately and inspect the actual restored contents as well as verifying backup integrity.

Move device or address displays the current origin and account. Create and verify a backup in the old browser; prepare the target device, select the same personal/institution mode and restore into a new account. Check records, revisions and original audio before deciding whether to remove the old copy. Keep the same browser and origin (scheme, host and port); the launcher never silently changes ports. Different browsers/addresses do not share data automatically, and matching account names do not synchronize them. Clearing browser data can remove a local workspace; copying the program directory does not move browser-held records.

### Regional presentation

Region and display supports YMD, DMY or MDY order; device or listed display time zones; Latin 0–9 or interface-language digits; and A4 or Letter printing. Preferences are local to the browser, not clinical data or cross-device identity settings.

Only instants with an explicit time zone are converted, with an offset shown. Date-only values and local wall-clock times without a zone are not assigned one or shifted to another date. DMY/MDY display includes its order label. Clinical date entry still uses the browser's native controls and stored formats remain unchanged. Digit preferences apply to application-owned counts/sizes, not lab values, doses, units or source text. Paper selection does not modify the C-drive worksheets; real-printer pagination remains to be checked.

### Feedback after authorized public pre-release

Current code and synthetic-data checks are documented in [validation](VALIDATION.md). Following separate author approval to publish, volunteers may evaluate the following using fictional cases and without submitting patient data or recordings:

- Startup, memory, sustained use, weak-network recovery and battery impact on physical low-resource computers/phones. No unmeasured minimum-memory promise is made.
- First use on a computer without Node, physical-phone PWA installation/reopening, storage eviction, actual downloads and multipart restore.
- Original-audio quality, noise/accent handling, formats and future compression choices. Current capacity protection does not automatically discard or degrade original audio.
- Native clinical terminology, right-to-left layouts, date/digit comprehension, ward workflow and real printing in each supported language.
- Hospital permissions, recording authorization, device management and optional interfaces, while retaining the portable worksheet scope.

Offline remains the default and each connection requires separate authorization. Device checks, regional preferences and backup status do not enable synchronization, call a model, upload audio or rewrite clinical source text.

## 0.6.15 easy deployment / 便捷部署

See [Easy deployment / 个人与管理员向导](EASY-DEPLOYMENT.md). Windows uses `Start-WardNote.cmd`; mobile/PWA uses the separately packaged static site on a trusted HTTPS origin. The offline administrator wizard prepares configuration only. No public hosting or real-device/clinical validation was performed.

**Third distribution: static PWA.** The separately generated `static-pwa.zip` contains public application assets plus an offline administrator wizard. Serve only `site/` at a dedicated trusted HTTPS origin. Encrypted records/audio stay in each device workspace; optional backend APIs and connection authorization are unavailable in this edition.

**第三类发行包：静态 PWA。** 仅将包内 `site/` 部署至专用可信 HTTPS，公开程序资源与管理员向导随包提供。记录和录音保存于各设备工作区；联网授权、同步及云端服务说明只适用于完整后端版。
