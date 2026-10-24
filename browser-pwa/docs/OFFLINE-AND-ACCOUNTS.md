# Offline operation and account modes / 脱机工作与账号模式

Version **0.6.15**, 2026-10-21 (Asia/Shanghai). This is an evaluated prototype, not a hospital identity platform or a certified medical record system.

## 使用方式

1. 在可信 HTTPS 地址或电脑本机 `localhost` 首次打开，等待应用资源准备完成。登录页选择「个人」或「机构／医院」，创建账号名及本机工作区密码；这个密码只用于解密当前浏览器内该模式、该账号的资料。
2. 默认脱机。记录、文字备忘、检查、待办、原始音频、修改历史及学习复盘加密保存到本机。页面显示「已保存到本机」后再关闭；再次打开须解锁。浏览器清理网站数据会删除此副本，因此需要独立备份。
3. 当前账号登录后不能直接切换用户或模式。先点击「注销」，结束并保存录音、完成待保存修改，再在登录页选择另一种模式。不同账号及模式使用独立本机数据库；同一浏览器的其他页面仍登录不同用户或模式时，也须先注销。同一账号可在多个页面打开，同账号任一页面注销会使其他页面锁定。
4. 设置中选择「切换为联网」，确认当前模式和服务器，输入独立联网授权密码。它不得与本机解锁密码相同。每次重新打开应用均回到脱机；网络恢复不会授权连接或上传资料。
5. 获准联网后，授权事件按当前模式提交到服务器队列。临床资料不会随授权自动上传。需要时选择患者并分别执行下载或上传；上传前再确认范围，音频默认不勾选。模型调用、转写、临床外发保留原有的独立人工确认。
6. 返回脱机或注销立即禁止新的应用数据请求并取消正在进行的请求；已经到达接收端的内容不能撤回。退出事件留在本机队列，在下次授权联网时发送。

「脱机」控制本应用的数据接口，不改变操作系统网络，不是浏览器扩展或其他应用的网络隔离。页面资源初次准备、浏览器自身行为、手动打开外部链接不在此开关的控制范围内。

## 程序更新与回退 / Program update and rollback

0.6.15 在启动、返回前台或恢复网络时检查同一地址的程序文件，并在页面处于前台时每 5 分钟检查；登录页与设置页均可手动「检查更新」。检查只请求程序资源，不上传患者记录或录音，不开启资料同步，也不授予联网处理权限。无法连接或新版未下载完整时继续使用已准备的当前版本；检查失败不代表已经是最新版。

Version 0.6.15 checks same-origin program files at startup, on returning to the foreground or reconnecting, and every five minutes while the page is visible. Manual Check for updates is available before login and in Settings. These requests contain no patient records or audio and do not enable data sync or authorize network processing. An unavailable host or incomplete download leaves the prepared current version usable; a failed check does not establish that the version is current.

待更新的程序缓存不完整时，可选择「重新下载更新」。此操作仅修复候选版本的程序资源，不清除患者资料，也不会自动应用更新；下载完整后仍须由使用者选择保存并更新。

If the pending release's program cache is incomplete, choose Download update again. This repairs only the candidate program resources; it does not clear patient data or automatically apply the update. Once the download is complete, the user still chooses when to save and update.

从 0.6.12 起，新程序资源准备完成后不会主动强制切换仍在工作的已有页面，可选择「保存并更新」或「稍后」。更新前会保存待写入文字；活动录音、未完成表单或其他进行中的操作会阻止更新，保存失败则保留当前草稿。先结束并保存录音、完成或取消当前操作，并关闭其他同地址的 WardNote 浏览器页面/PWA 窗口，再应用更新。也可保存后关闭全部旧页面，浏览器会按正常生命周期启用已准备的新版本，再次打开即可使用。重新打开后联网授权仍回到默认脱机，不自动恢复外部处理权限。

From 0.6.12, prepared application resources do not force a switch in working pages. Choose Save and update or Later. The apply action saves pending text writes first; active recording, unfinished forms and in-progress operations block it, and failed saves leave the draft in the current page. End and save recording, complete or cancel the current operation, and close other WardNote browser/PWA windows at the same address before applying. Alternatively, save and close all old pages; the browser's normal lifecycle can activate the prepared release for the next opening. Reopening defaults to offline and does not restore permission for external processing automatically.

首次安装仍会准备离线资源。程序仅保留当前及至多两个既往版本的资源缓存；这些缓存不包含患者数据备份，也不是自动回退按钮。从 0.6.11 或更早版本首次升级，以及回退到这些旧版本时，先保存并关闭全部 App 窗口。程序回退须使用已核验的旧源码包，保留当前数据库、浏览器站点数据及私有配置；不直接用旧数据备份覆盖当前资料。完整步骤和兼容范围见[发布与回退说明](RELEASING.md)，实际演练结果见[验证报告](VALIDATION.md)。

First installation still prepares offline resources. The app retains current and at most two previous program caches; they are not patient-data backups or an automatic rollback control. For the initial upgrade from 0.6.11 or earlier, and rollback to those versions, save work and close all app windows first. Roll back only with a verified earlier source package while preserving current databases, browser site data and private configuration; do not overwrite current data with an older backup. See [release/rollback steps](RELEASING.md) and [actual rehearsal evidence](VALIDATION.md).

很旧的已打开页面可能尚未包含更新提示组件，不能在原地显示后来新增的按钮。此时一次性结束并保存录音、确认记录保存成功，关闭同地址的全部旧浏览器页面和 PWA 窗口，再打开原地址。不要通过清除站点数据、删除账号或重建工作区解决旧缓存，否则可能丢失本机资料。正常更新不清理临床数据。

Very old open pages may not contain the update controls and cannot display a button added in a later release. For that one-time transition, finish and save recording, confirm records are saved, close all old browser pages and PWA windows at the same address, and reopen the original address. Do not clear site data, delete accounts or recreate a workspace to resolve stale program caching; this can remove local records. Normal program updates do not clear clinical data.

## 原有 v0.5.3 资料

原有 `data/wardnote.db` 保留为个人服务器工作区，原密码不变。v0.6.0 不自动把整套患者资料复制到浏览器：先创建个人本机工作区，设置一个不同的本机解锁密码；在设置中使用原服务器密码授权联网，再选择需要的患者下载。原有录音需另外勾选下载。原有纸质模板、私有配置、记录内容不被此升级改写。

机构服务器工作区使用独立的 `data/institution/wardnote.db`，需要独立建立和配置。管理员在服务器本机打开登录页选择机构模式，创建本机工作区后，在联网确认窗口展开「首次配置本机服务器」，勾选建立该模式的服务器工作区并设置独立密码。远程浏览器不能执行服务器初始化。已建立的工作区不能重复初始化。

本机每种模式支持多个账号，各账号独立加密；服务端仍按个人、机构模式分别配置工作区，不提供机构成员目录、角色矩阵、员工入离职管理或正式身份核验。新工作区以账号名作为记录者标识，既有记录者标识和历史署名保留，授权事件中的随机账号标识也不是医院实名身份。本机账号隔离与两种使用模式，不表示已完成院方 SSO、正式权限控制或审计归责。使用机构模式也不代替项目的机构使用书面许可。

## 本地录音、恢复和存储

- 使用原有语音辅助入口及录音告知确认。本机录音约每 2 秒请求一批数据，并将批次拆为不超过 1 MiB 的存储片段；时间间隔由浏览器决定，不是严格实时保证。
- 保存失败后暂停采集，保留可重试的内存片段，并显示失败。不能把「已开始录音」当作「已经保存」。恢复后只保证保留已成功写入的片段；异常退出时最后尚未写入的声音可能丢失。
- 中断后可在备忘中选择「恢复已保存片段」，恢复的录音默认暂停清理，时长按保存时间估算，须回听核对。来自服务器但未下载的原声会明确显示本机不可用。
- 手机锁屏、切换应用、系统回收页面可能影响录音。首版以已验证的前台使用为基础，不承诺持续后台或锁屏录音；真实手机和完整班次录音仍待验证。
- 单段录音上限 256 MiB；单次包含音频的同步总量上限 256 MiB。浏览器还可能施加更低的实际配额，界面提供空间估计及持久化申请。持久化申请不替代备份。
- 本机备份采用加密分卷与清单，恢复到相同模式的新账号，已有账号不会覆盖；也保留旧版单份 JSON（最多 600 MiB）恢复兼容。分卷流程与限制见下节。原服务器加密 SQLite 备份仍由原恢复工具管理，不能将两种备份互换。
- 本机存储位置由浏览器配置文件决定。Windows 默认浏览器配置可能位于 C 盘；应用交付位于 D 盘并不自动迁移浏览器存储。可由使用者／机构选择受支持的独立浏览器配置位置，应用不擅自移动用户浏览器资料。重要资料保存和备份确认后再手动清理，不自动删除到期音频。
- 浏览器、安装版 PWA、桌面浏览器共用应用能力，但不同浏览器、配置文件、设备及站点地址通常有不同的本机副本。不能把安装 PWA 理解为自动跨设备同步。

## 分卷备份、核验与恢复 / Segmented backup, verification and restore

**本机操作，不要求联网授权。** 在「设置与帮助」或「数据管理」选择「下载本机加密备份」。当前账号的文字记录、修改历史、来源关系、核对状态及已保存到本机的原声一起备份；服务器上尚未下载的音频不会凭空加入。备份保留录音当时的完成/中断状态，不把未保存的声音变成已保存。

1. 支持文件夹选择的浏览器可直接选择备份文件夹；否则按提示逐个「下载此文件」。每个 `.wnpart` 分卷最多 **16 MiB**，最后生成一份 `.wnmanifest` 清单。保留清单及同一备份的全部分卷，勿改名或与其他备份混放后混选。
2. 备份期间保持页面打开，等待结果显示。取消或失败可能留下部分文件；缺少完整清单与分卷的集合不能恢复。下载按钮只能证明文件已提供给浏览器，不能确认磁盘已经保存成功。
3. 使用「核验备份文件」，重新选择实际保存的清单及全部分卷，输入原备份密码。它会检查清单认证、各卷散列、记录结构及解密后音频的长度与散列，不更改当前工作区；核对显示的文件、记录、录音数量与数据量。
4. 恢复时先注销，在登录页选择匹配的个人／机构模式，点击「恢复本机加密备份」，输入**新账号名**、原备份密码并选择完整文件集合。全部核验通过后才建立账号；恢复后再次抽查记录、来源、修改历史和原声。原账号不覆盖。

分卷避免把全部音频同时拼成一个大 JSON 文件；录音按卷处理，临床文字状态仍按当前应用方式整体载入内存。每组最多 10,000 个分卷，实际容量还受设备内存、磁盘、浏览器配额和文件选择能力约束，不能将格式上限当作已验证的设备容量。单段录音和单次含音频同步的 256 MiB 限制不变，长期备份通过也不等于完整班次连续录音已验证。

恢复失败会清理尚未发布的暂存音频；强制关闭页面留下的未完成恢复暂存，在同一目标账号下次恢复/建立时清理。现有账号数据不受影响。新分卷格式需要 0.6.12 或支持该格式的后续版本；0.6.11 及更早版本不能直接读取它。旧版单份 JSON 可在恢复入口继续使用；当前「核验备份文件」入口核验的是分卷格式。备份与密码分开保存，重要资料核验并独立保存后才考虑清理原文件。

若在最终资料提交后、界面显示完成前关闭页面，完整恢复数据可能已存在；请先用所选恢复账号名及备份密码尝试「已有账号登录」，不要以再次恢复覆盖该账号。

**These are local operations; connection authorization is not required.** Choose Download encrypted device backup in Settings & Help or Data management. The current account's records, revision history, source links, review state and audio already stored on the device are included. Audio that exists only on the server is not added. Recording completion/interruption state is preserved; unsaved sound cannot be recovered by a backup.

1. Save into a selected folder when supported, or download each file explicitly. Each `.wnpart` is at most **16 MiB**; one `.wnmanifest` is written last. Keep the complete set with its original filenames; do not mix separate backups.
2. Keep the page open until the result. Cancelled or failed exports may leave partial files that cannot be restored without the complete set. Offering a browser download is not proof that the file reached disk.
3. Use Verify backup files to select the saved manifest and all its parts again, with the original password. Verification checks manifest authentication, part hashes, record structure and decrypted audio lengths/hashes without changing the workspace. Compare the reported file, record, recording and byte counts.
4. To restore, sign out, select the matching personal/institutional mode and choose Restore encrypted device backup. Supply a **new account name**, original backup password and all files. The account is published only after full verification; inspect restored records, source relationships, history and audio. Existing accounts are never overwritten.

The segmented path avoids assembling all audio into one large JSON object; it processes bounded parts while clinical state is still held in memory as in normal use. A set allows up to 10,000 parts, but actual capacity depends on memory, disk, browser quota and file-selection support. This format ceiling is not a tested device-capacity claim. The 256 MiB per-recording and audio-sync limits are unchanged, and large-backup checks do not validate continuous full-shift recording.

Failed restore removes unpublished audio staging. If the page is forcibly closed, unfinished staging is cleared on the next restore/setup for the same target account. Existing accounts remain unchanged. The new format requires 0.6.12 or a later supporting reader; 0.6.11 and earlier cannot read it. The restore entry still accepts one legacy JSON backup up to 600 MiB; the current verify-only entry is for segmented sets. Keep backups separate from passwords, and verify an independent copy before considering deletion of originals.

If the page closes after the final data commit but before the completion screen, the complete restored data may already exist. Try Existing account login with the selected restore account name and backup password before retrying; do not overwrite that account.

## 授权事件接收端配置

用户已选择接收地址暂留「待配置」。交付示例中的两个列表均为空，不会向任何真实邮箱或外部接口试发。

每个模式可在服务器私有 `config.local.json` 中独立配置 `accountModes.personal.authorizationDestinations` 或 `accountModes.institution.authorizationDestinations`。支持：

| kind | 用途 | 需要部署方提供 |
| --- | --- | --- |
| `email` | 由邮件网关发送到指定邮箱 | HTTPS 网关 `url`、`recipient`，可选令牌环境变量 |
| `api` | IP 地址或域名上的接收接口 | 带路径的 HTTPS URL；IP 证书须有效 |
| `database` | 由受控服务写入数据库 | HTTPS 数据库写入适配器；数据库密码留在适配器端 |

裸 IP 不是完整接口，邮箱地址也不是可直接发送邮件的服务器。应用通过配置好的 HTTPS 接收端发送 JSON；不在浏览器保存 SMTP 或数据库凭据，不直接执行远程 SQL。本机回环地址允许 HTTP，仅用于本地部署或合成测试。远程地址必须 HTTPS，禁止 URL 内嵌账号密码以及重定向。

以下仅为配置结构，地址均为保留示例；不要照搬到实际部署：

```json
{
  "accountModes": {
    "personal": {
      "authorizationDestinations": [
        {"id":"personal-mail","kind":"email","url":"https://relay.example.invalid/authorization","recipient":"owner@example.invalid","tokenEnv":"WARDNOTE_PERSONAL_AUDIT_TOKEN"}
      ]
    },
    "institution": {
      "authorizationDestinations": [
        {"id":"hospital-audit","kind":"database","url":"https://audit.example.invalid/wardnote/events","tokenEnv":"WARDNOTE_INSTITUTION_AUDIT_TOKEN"}
      ],
      "llm":{"enabled":false},
      "transcribeUrl":"",
      "exportUrl":""
    }
  }
}
```

机构模式默认不继承个人模式的语音、文本模型或临床导出地址；需要管理员单独配置。账号类型决定授权接收端，客户端请求不能自行指定任意目的地址。机构配置的身份可信度和审批仍由部署方验证。

授权事件固定包含 `id`、随机 `accountId`、`mode`、`method: password`、`outcome` 和 UTC `time`。结果包括允许、密码拒绝、取消、连接失败和撤销。不会包含临床记录、音频、转写、密码、密钥或生物特征。用户输入网络密码前取消不会发送接口请求，取消事件在之后获准联网时提交。浏览器报告的时间和事件属于工作记录，不构成不可抵赖的机构身份认证证据。

服务端先加密持久保存再尝试投递。HTTP 接收端 2xx 表示「接收端接受」，不等于邮箱已入箱或数据库业务已完成；失败、超时或未配置均保留待发送。客户端每次联网及「授权发送状态」手动重试会提交待处理批次，每批最多 100 条。已接受的事件不重复发送到同一配置目标。超时后的重试可能重复到达接收端，接收端必须用 `Idempotency-Key` 去重；不声称端到端 exactly-once。没有常驻的后台外发定时任务。

## Authentication roadmap / 后续认证接入

本轮完整实现独立密码方式。生物识别与扫码没有显示为可用按钮：

- 生物识别方向使用平台验证器／通行密钥（WebAuthn / passkeys），生物特征应留在设备安全组件内；需另行实现挑战验证、凭据注册、撤销和恢复。
- 扫码方向使用院方身份服务提供的短时、一次性授权会话，须核对目标账号和服务器，防止重放、替换和跨模式授权。
- 离线语音识别（offline ASR）仅列开发路线：需选定模型、模型分发、运行资源、医学术语与多语言评估，再决定是否接入。当前本地录音不等于本地语音识别。
- PDA 型号、扫描驱动、厂商 SDK 和原生端适配继续按既有决定延后。

## English operational summary

WardNote 0.6.15 defaults to an encrypted device workspace and offline data operation. Personal and institution/hospital modes are chosen at sign-in. Sign out before switching; browser-local stores are separate for each account and mode, while server workspaces remain mode-specific. Every connection session needs a separate server password and explicit confirmation. Reopening the app resets connection permission. Connectivity alone does not enable transfer, ASR or model processing.

Selected patient transfers require manual action and upload-scope confirmation. Audio is excluded by default. Conflicts preserve earlier versions; server commits recheck versions and audio integrity. Source-only sync does not mean the recipient has the original audio. Backups and storage limits above apply equally across interface languages.

Authorization events queue locally, then in an encrypted server outbox. Each account mode has its own optional HTTPS email/API/database-adapter destinations. Defaults are unconfigured. Events contain no credentials, clinical text or recordings. Receiver acknowledgement is not proof of final email delivery; retries require receiver-side idempotency. This is a supporting workflow record, not hospital identity attestation. Passkeys, QR authorization, offline ASR and hardware-specific PDA validation remain future work.

Technical references: [MDN browser storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [MDN recording delivery](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event), [MDN connection hints](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine).

## 0.6.1 session and transfer safeguards / 会话与传输修正

注销使该登录会话发起的未完成写入、下载和同步预览失效，包括随后重新登录同一账号的情况。其他页面注销时，当前页的患者对话框、工具窗口与显示缓存会清空；麦克风和屏幕唤醒请求会停止。已落盘录音片段仍保留，可重新登录后恢复并回听；尚未落盘的末尾片段可能丢失，不能把中断录音标为完整。

纯文字及含录音同步均会在传输前和提交前重新核对所选患者的记录范围。预览后的新增或修改需重新预览。提交请求发出后若又有本机编辑，保留本机新版本并提示重新预览；已经提交的预览版本不能撤回。下载录音在落盘前校验预期字节数；上传另校验片段散列。长度一致不等于完整的端到端来源认证。

服务重启后清除已无法恢复的同步暂存片段，不清除已完成录音、病程或备忘。SQLite 可重用释放的页，不保证数据库文件立即缩小；不自动压缩临床数据库。

Sign-out invalidates pending writes and transfer previews from that session, including same-account re-login. Cross-page sign-out clears clinical dialogs and stops microphone capture. Persisted fragments remain recoverable; the unsaved tail may be lost. Text-only and audio uploads recheck the selected scope before transfer and before commit. Edits made while a commit is already in flight remain local and trigger a new-preview notice. Downloaded audio must match its expected byte count before persistence. Restart removes only unresumable sync staging; completed records/audio remain intact. Freed SQLite pages can be reused without shrinking the database file.

## Username sign-in / 账号名登录（0.6.5）

- **现有本机资料**：选择原来的个人／机构模式，在登录页输入拟绑定的新账号名和原密码。只有原密码验证成功才能绑定。原患者记录、录音、历史和加密密钥保留在原工作区；绑定后须用该账号名及原密码登录。此操作不改变服务器密码或服务器数据库。
- **新用户**：点击「新建账号」，填写账号名和密码，注册页只保留一个账号栏。账号名按 Unicode NFKC 规范化并忽略大小写，允许3–64位字母、数字、点、下划线或连字符；同一模式内不能重复注册。新建工作区默认以规范化后的账号名作为记录者标识；已有工作区与历史记录中的原署名保留，不因本次界面简化而改写。
- **切换用户**：先结束并保存录音及文字，点击「注销」，再填写另一组账号和密码。页面重载或重新登录均默认脱机，联网仍须原独立授权流程。
- **资料归属**：账号与数据属于当前浏览器站点存储，不是跨设备云账号。另一浏览器、设备或站点地址不会自动得到相同资料。可用加密备份恢复到新账号，或经独立授权后手动同步所选患者。账号名和存储路由为本地目录信息，患者正文与音频保持加密，密码不写入账号目录。
- **服务端边界**：本次增加本机多账号，不将院内服务端改成多用户权限系统。不同本机账号如被授权使用同一个服务端工作区，仍可访问该服务端所授权的资料；本机账号名本身不会建立服务器角色、机构成员资格或临床签名身份。
- **备份和恢复**：恢复需要原备份密码及目标新账号名；不能用新建空账号覆盖原账号来“重置”遗失密码。错误密码或重复目标账号不会覆盖已有资料。

Local usernames route to independent encrypted vaults within the selected mode. Registration asks for one account name, password and password confirmation; the normalized account name supplies the new workspace recorder label. Existing workspace and historical attribution are preserved. Sign-out is required before switching users, including across tabs; a failed password attempt does not sign out an already active session in another tab. Existing unnamed device vaults are linked in place only after successful original-password verification. Names do not create cross-device accounts or hospital roles. The existing mode-specific server authorization and manual selected-patient sync remain separate; users authorized to the same server workspace share that server scope.


### Interrupted account registration / 恢复后的账号登记中断

如果页面在资料最终保存后、账号目录登记前关闭，先在相同账号模式下选择已有账号登录，输入恢复时填写的账号和备份密码。已存在的同名本机工作区优先于未绑定的旧版工作区；两者资料均保留。若仍无法访问，请保留浏览器资料进行排查，不清除数据或覆盖已有工作区。

If the page closes after the restored data is committed but before the local account directory is updated, select Existing account in the same mode and use the restore account name and backup password. An existing named local vault takes priority over an unbound legacy vault; both stores are preserved. If access still fails, retain browser data for investigation rather than clearing or overwriting it.

## Local readiness, storage and migration / 本机就绪、存储及迁移（0.6.15）

登录页和设置页提供手动本机检查：安全地址、加密、跨页面写入锁、独立微量数据库写读测试、当前版本完整离线资源及可选录音接口。检查不打开患者内容、不调用外部服务。麦克风接口存在不等于已获得权限或保证连续录音。若必要浏览器能力缺失，继续使用安全的受支持设备或纸表，不退回明文存储。

浏览器估计容量缺失时显示未知。剩余空间低于64 MiB或使用率达到90%提示关注；低于16 MiB或达到98%阻止开始录音，并在录音期间约每10秒复查。临界状态结束新增采集、尝试保存已有片段；真实写入失败仍保留重试提示。导入预留额外空间；这些阈值是保守提示，不保证磁盘或浏览器配额。不会自动删除原声、降低音质或修改现有资料。持久存储只能主动申请，浏览器可能拒绝，也不等于备份。

备份状态分别记录已提供下载、文件夹写入成功和重新选文件核验时间。下载动作不保证文件已经落盘；核验其他账号的备份不会标记当前账号已保护。快照变化后旧核验记录不代表当前资料已备份。更换设备、浏览器或地址前，结束录音、确认保存、导出并核验整套加密备份；在目标新账号中恢复并逐项核对记录和音频，再考虑处理原副本。原密码仍必须保管；相同账号名不建立云身份或自动同步。地址包含协议、主机及端口，随意更改会进入另一浏览器存储空间。

Readiness checks stay local and do not inspect clinical content. Storage estimates are advisory and may be unavailable; thresholds do not certify available recording duration. No automatic deletion or quality reduction is introduced. Persistent storage is an explicit browser request, not a backup guarantee. Backup status distinguishes a download offer, a successful folder write and independent file verification; another account's backup never marks this workspace protected. Migration requires a verified complete backup and restoration into a separate destination account; preserve the original until records and audio are checked. Matching usernames alone do not synchronize devices.
