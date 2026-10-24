# Deployment and interfaces / 部署与接口

**先选择部署路线 / Choose a deployment route first:** 手机和浏览器独立本机记录优先使用[静态 PWA 向导](EASY-DEPLOYMENT.md)。以下服务器、TLS、同步、识别及服务端备份章节仅适用于可选完整后端。For independent phone/browser use, start with the static PWA guide; the backend, TLS, synchronization, transcription and server-backup instructions below apply only to the optional full backend.


Current version: 0.6.15. See [infrastructure choices and limits](INFRASTRUCTURE.md) for local readiness, capacity protection, backup status and regional presentation.

## Local evaluation

The **source package** requires Node.js 24+. From the root, run `node app/server.mjs`; open `http://127.0.0.1:8787`. Windows launchers use the verified bundled runtime when the separate Windows x64 portable package is present. For a source checkout they locate `NOTE_NODE`, the optional local `nodePath`, the standard Node installation or Node on PATH.

### Windows offline portable package / Windows 离线便携包

The separately generated `portable-win-x64` ZIP includes Node.js 24.19.0, its complete original license and third-party notices, official checksum evidence and a portable-file manifest. It contains the same allowlisted WardNote source, offline documentation and templates; it includes no patient database, personal configuration, account, browser profile or development dependency installation. The ordinary source ZIP stays small and excludes the runtime.

1. Copy the **complete ZIP** to a compatible 64-bit Windows computer, including by USB, and extract it to a writable local folder. Do not run directly from inside the ZIP.
2. Open `启动应用.cmd`. The launcher verifies and selects `runtime/node/node.exe`; it does not download Node or run npm. A substituted or incomplete bundled runtime stops startup instead of silently falling back to another executable. Keep the supplied LICENSE and manifests with the package.
3. Use the same browser and `http://127.0.0.1:8787` address each time. The launcher never silently switches ports. If a different WardNote version already occupies that address, startup stops with instructions to save work and stop the old service from its own installation; no other service is terminated automatically. A same-version running service does not bypass bundled-runtime checks. Browser-local records are associated with their browser profile and origin; moving the program folder does not itself move those records. Before changing browser, address or device, make and verify an encrypted device backup.
4. End recordings and wait for saving before using `停止应用.cmd`. Back up and independently verify records/audio before replacing or moving an established installation. Updating program files must preserve private configuration, server `data/` and browser storage.

Windows PowerShell, a compatible supported browser, sufficient free storage and operating-system support for the bundled runtime are still required. This package reduces first-install dependencies; it is not a certification of old Windows versions, low-memory PCs, physical phones or installed PWAs. The 0.6.13 bundled-runtime rehearsal suppressed browser auto-opening and uses isolated fictional data; first-time-user and physical low-resource checks remain in the post-publication feedback plan.

独立 `portable-win-x64` 包附 Node.js 24.19.0、完整原版许可证、第三方声明与校验信息。解压到可写本地目录后运行 `启动应用.cmd`，不需要另装 Node 或在线执行 npm；仍需兼容的 Windows、PowerShell、浏览器及足够空间。固定使用原浏览器与 `http://127.0.0.1:8787`；更换地址/浏览器/设备前先核验加密备份。程序包不是患者备份，移动程序文件不会自动迁移浏览器内的资料。源码包不包含运行时，手机首次 PWA 准备仍须可信 HTTPS。

The complete instructions in this file and [offline backup/account guidance](OFFLINE-AND-ACCOUNTS.md) are included in both packages and can be read without internet. Node.js retains its own license; bundling it does not change the WardNote license.

The default data directory is `data/`. `work/` and `logs/` are runtime/support directories, excluded from source publication. You can start from any working directory because paths are resolved from the application location. Choose a mode, account name and device-workspace password on first launch. The browser starts offline and does not automatically import old server records. See [offline operation, account separation and migration](OFFLINE-AND-ACCOUNTS.md). Never expose an unreviewed test deployment publicly.

## Configuration

### Responsibility of the deployment owner

Individual identity verification/authorization, granting and revoking access, and attributable audit oversight are hospital/institution management responsibilities, outside the worksheet's development scope. Supply and verify appropriate controls in the approved deployment environment; do not assume the hospital EHR's controls also protect this app. Browser accounts have separate encrypted stores, while server workspaces remain mode-specific. These boundaries do not authenticate hospital staff or establish cross-device account identity. A typed account/recorder label or local event history does not solve that limitation. Institutional gateway/identity integration has not been validated by this release.

Institutional arrangements must cover the app and its database, recordings, exports and backups. Pseudonyms and minimum necessary identifiers can reduce exposure; manage linkage separately in approved institutional systems and retain bedside patient identification. Name replacement alone is not formal de-identification, and does not authorize external speech/model processing. See [scope and responsibilities](CLINICAL-SCOPE.md). Keep the existing app password, lock, encryption and revision protections enabled.

人员身份授权、访问控制及可追溯操作的管理由医院/机构承接，本产品不新增相应管理平台。院方须核实部署措施实际覆盖本工具、录音、导出和备份；内网或既有 EMR 不能自动替代此核实。可按院规使用化名和最少必要标识，但可关联患者的内容仍按相应规则管理；本版本未完成机构身份系统对接验证。

Copy `config.example.json` to `config.local.json`. This file is ignored and excluded from release output. Keep service tokens in server environment variables.

| Variable | Purpose |
| --- | --- |
| `NOTE_NODE` | Windows launcher's Node executable |
| `NOTE_HOST`, `NOTE_PORT` | Listen address and port; default `127.0.0.1:8787` |
| `NOTE_DATA_DIR` | Server data directory |
| `NOTE_TRANSCRIBE_URL`, `NOTE_TRANSCRIBE_TOKEN`, `NOTE_TRANSCRIBE_MODEL` | Speech endpoint, optional Bearer token and model |
| `NOTE_LLM_TOKEN` | Server-side token for the optional text model; see [model interfaces](MODEL-INTERFACES.md) |
| `NOTE_EXPORT_URL`, `NOTE_EXPORT_TOKEN` | Approved JSON receiver and optional Bearer token |
| `NOTE_BROWSER` | Browser executable for development tests |
| `NOTE_PLAYWRIGHT_MODULE` | Optional managed development module; ordinary tests use `npm ci` |

Example for a site-provided HTTPS deployment (the example hosts do not exist):

```json
{
  "host": "0.0.0.0",
  "port": 8787,
  "publicOrigin": "https://wardnote.hospital.example:8787",
  "tls": {
    "key": "/srv/certs/wardnote.key",
    "cert": "/srv/certs/wardnote-chain.pem"
  },
  "transcribeUrl": "https://speech.hospital.example/audio/transcriptions",
  "exportUrl": "https://ehr.hospital.example/approved-note-intake"
}
```

Windows accepts absolute paths such as `D:/certs/wardnote.key`. Certificates, DNS, firewall rules and endpoint authorization must be supplied by the deployment owner. First create the workspace locally, then configure LAN listening. Non-loopback startup requires TLS and `publicOrigin`. This version terminates TLS directly; a reverse proxy needs separate configuration and testing. Arbitrary forwarded-host headers are not trusted.

## Phone and PWA behavior

A phone needs a reachable trusted HTTPS origin. Its `127.0.0.1` addresses the phone itself. Install-to-home-screen availability depends on the browser and platform. Keep the recording page foregrounded and the screen active. Neither continuous background recording nor lock-screen capture is guaranteed. After initial preparation, encrypted device storage supports offline clinical records and audio. Network permission resets on reopening. No clinical data are uploaded when connectivity returns; explicit connection and selected-data transfer are required.

Audio in a device workspace is saved incrementally to encrypted local storage. Save failure pauses capture and supports retry while the page remains open. Saved segments survive a page closure and can be recovered; unsaved memory buffers may be lost. Recovery does not resume the microphone automatically. Server audio is transferred only when selected. The older server recording API remains available for controlled integration tests.

### Future portable-terminal work / 未来便携终端方向

Device-independent improvements are recorded in the [roadmap](ROADMAP.md). PDA-specific implementation remains deferred. Version 0.6.0 separately adds generic device-local clinical storage and saved-audio recovery; neither establishes PDA certification or continuous background recording.

不依赖具体型号的便携终端改进方向已纳入[路线图](ROADMAP.md)。PDA 专项适配继续暂缓；0.6.0 单独实现通用本机脱机记录和已保存音频恢复，不代表 PDA 型号认证或后台连续录音能力。

## Speech adapter

Nothing is transcribed until the administrator configures a service and the user requests transcription. The server POSTs `multipart/form-data` with `file`, `language` (default `zh`) and optional `model`. A configured token is sent as `Authorization: Bearer …`. Expected response:

```json
{"text":"患者诉：昨夜咳嗽。\n查体：待实际核查。"}
```

The service must accept the actual WebM/Opus, MP4/AAC or WAV input, or the institutional gateway must transcode it. HTTPS is required except for an explicit loopback service. Redirects are rejected; transcription timeout is 180 seconds. Clinical accuracy, speaker separation and mixed-language behavior require evaluation. No automatic prescribing or diagnostic inference is implemented.

## Institutional receiver

After preview and explicit confirmation, the server POSTs JSON to the configured endpoint:

```json
{
  "format": "wardnote/1",
  "exportedAt": "ISO-8601 timestamp",
  "includesAudio": false,
  "records": [{"id":"record-id","type":"note","encounterId":"episode-id","version":2,"data":{}}]
}
```

The server verifies that previewed record versions have not changed. The receiver must implement institutional identity, episode mapping, authorization, idempotency and field validation. HTTP 2xx means transport acceptance, not successful EHR filing or signature. There is no native FHIR mapping or direct database connection. An IP address must expose an approved authenticated protocol endpoint; an arbitrary IP is not a destination for clinical data.

JSON/CSV exports and email drafts contain selected encounter text, not audio files. Email drafts have no preset recipient and are not automatically sent. Handle exported plaintext according to the institution's rules.

## Backup and restore

The device-workspace backup button offers an encrypted segmented set: a `.wnmanifest` and all `.wnpart` files, each part at most 16 MiB. Save to a folder where supported or download each file, then independently select the saved files with Verify backup files. Restore into a new account through the matching mode on the sign-in page; legacy single-file JSON restore remains available. See [device backup steps and limits](OFFLINE-AND-ACCOUNTS.md). A server's authenticated `/api/backup` endpoint (institution: `/api/institution/backup`) still returns a consistent encrypted SQLite snapshot. These formats are not interchangeable. For a server backup: retain the original password. To restore, stop the target service and run:

```sh
node app/restore.mjs /path/to/backup.db /path/to/new-data-directory
```

The restore tool validates the SQLite file and refuses an existing destination database. Set `NOTE_DATA_DIR` to the new directory before starting. Confirm content and retention decisions before using restored data. Old backups can contain audio deleted later; this version does not synchronize deletion across backup copies.

## 中文要点

默认仅本机运行。医院语音服务、接收接口和手机HTTPS访问均需显式配置。所有文字保存成功、录音结束后再停止服务。本机多账号隔离、医生记录的患者核对和本地事件记录均不能替代机构身份认证、正式电子签章及院方制度；获准连接同一服务端工作区的用户共享其授权范围，不等于已实现逐账号隔离的跨设备同步。

References: [MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder), [microphone secure contexts](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), [Node SQLite](https://nodejs.org/api/sqlite.html).

## 0.6.15 easy deployment / 便捷部署

See [Easy deployment / 个人与管理员向导](EASY-DEPLOYMENT.md). Windows uses `Start-WardNote.cmd`; mobile/PWA uses the separately packaged static site on a trusted HTTPS origin. The offline administrator wizard prepares configuration only. No public hosting or real-device/clinical validation was performed.
