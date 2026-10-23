# Android native shell / Android 原生容器

This preview packages the WardNote web assets inside an Android application. It does not require a deployed website for first use. The fixed origin `https://appassets.androidplatform.net/` is intercepted locally; it is not a remote server. Web assets are updated only by installing a compatible APK. The existing browser/PWA distribution is separate.

本预览版将网页资源封装到 Android 安装包，首次使用无需部署网站。固定地址由应用本地拦截，并非远程服务器；资源更新通过兼容的 APK 完成。现有浏览器与 PWA 交付保留独立。

## Recorder and file boundaries / 录音与文件边界

- `MediaStore.Audio.Media.RECORD_SOUND_ACTION` asks an installed recorder app to record and return a `content:` URI. Availability and return behavior vary by manufacturer. No custom microphone recording engine is included. If unavailable, use the phone recorder separately and import its audio.
- The recorder receives no patient name, record ID, password or other patient metadata from WardNote. Its own audio storage, permissions, cloud synchronization and retention remain under that recorder's control. WardNote does not delete the original. Review the recorder's settings before using sensitive material.
- Returned files are streamed through a maximum 256 KiB bridge chunk into WardNote's existing encrypted storage. Import is limited to 256 MiB per recording; there is no automatic format conversion or local speech recognition.
- If Android kills/recreates WardNote while the recorder is open, no previous target is guessed. The audio must be imported manually after patient/account confirmation. No patient-target mapping is persisted in native plaintext.
- System document pickers grant access only to chosen files/folders. App-wide storage, microphone and Internet permissions are absent. A separate recorder or document-provider app may still use its own network permissions.

- 优先调用手机已有录音应用。不同厂商是否支持录完返回文件仍待真机验证；不支持时使用手机录音后导入。
- 不向录音应用传递患者姓名、记录编号、密码等信息，但录音应用可能自行保存或云备份原始音频，应先核对其设置。本应用不删除外部原件。
- 音频分块导入本项目既有加密存储，单次桥接不超过 256 KiB，单条录音不超过 256 MiB；不自动转换音频格式，也不包含离线语音识别。
- 外部录音期间若本应用被系统重启，将要求手动导入并重新核对患者，防止录音误归属。
- 仅通过系统文件选择器访问用户指定文件。本应用无广泛存储、麦克风或联网权限；外部录音/文件管理应用仍按自身权限运行。

## Bridge / 桥接接口

`WardNoteNative.postMessage(JSON.stringify({id,method,args}))` returns through `window.__wardnoteNativeResult({id,ok,result,error})`. Errors are `{code,message}`; web UI translates the code. Pass `args.locale` for native notices. Native notices support `zh,en,es,fr,ru,ar,hi,ur`; system picker/recorder language is controlled by Android and the selected app.

| Method | Result or purpose |
|---|---|
| `info` | `{platform,version,assets,recorderAvailable}` |
| `setLanguage` | Set `args.locale` for subsequent native notices |
| `record` | `{token,name,type,size}` after external recorder returns |
| `readChunk` | With `token,offset,length`, returns `{base64,eof}`; length ≤ 256 KiB |
| `releaseFile` | Close the original-file read stream; original remains untouched |
| `chooseBackupFolder` | System tree picker returns `{token}` |
| `beginFile` | `folder,name,type` creates a new file only and returns `{token}` |
| `chooseSaveFile` | `name,type` opens system create-file dialog and returns `{token}` |
| `writeChunk` | Append `base64` chunk to output token; returns accumulated `{size}` |
| `finishFile` | Close and independently read back output; returns `{size,sha256}`. Optional expected `sha256` mismatch deletes this newly created file. |
| `abortFile` | Close and delete only the new file owned by this output token |
| `releaseFolder` | Release the in-memory folder handle |
| `background` | Move the task into the background after web-side save/busy checks |

Hardware back calls `window.__wardnoteNativeBack()`. The web layer must resolve unsaved or busy states before requesting `background`. The native shell never force-reloads or logs out the workspace on Back.

## Backup boundaries / 备份边界

Native output writes new documents only, and validates persisted bytes by SHA-256 readback. The shared web backup module owns format compatibility, encryption, parts and manifest ordering. Write the manifest last. Graceful abort removes incomplete files created by that operation. Sudden process termination or device failure may leave incomplete files; these must not be treated as a successful backup. The original encrypted workspace remains untouched by export.

For an individual system save dialog, the returned document must report a size of exactly zero before WardNote opens an output stream. An unknown size is refused instead of risking truncation of an existing file. Some document providers may therefore require a different local destination. Folder backups create named new documents and reject existing names.

备份使用系统选定目录，逐文件写入并回读校验，不覆盖既有文件。加密、分段与清单格式由既有网页模块负责；最后写入清单。正常取消会清理本次未完成文件，系统强制终止或设备故障仍可能留下不完整文件，不能据此认定备份成功。导出不会更改原工作区。

单文件系统保存对话框返回的文件须能证明大小为零后才会打开写入；大小未知时拒绝写入，以避免误截断既有文件。部分文件提供器因此可能需要改选本地目录。文件夹备份仅新建文件，拒绝既有同名文件。

Android system auto-backup is disabled, and cloud/device-transfer extraction rules exclude application storage. This supplements the encrypted workspace; it does not claim verified behavior for all manufacturers. Export destination providers have their own policies.

## Build and verification / 构建与核查

Use the parent project `scripts/build-android.ps1`; it uses pinned Android API 35/build-tools 35 and Java 17, compiles to Java 8 bytecode and desugars with D8. The source has no AndroidX or third-party native runtime dependency. The package is `org.wardnote.offline.preview`, min SDK 26 and target SDK 35. A current Android System WebView with secure storage, Web Crypto and Web Locks is required; unsupported implementations must be refused by the web readiness checks, never bypassed with a no-op lock.

Native compilation and APK signing are build checks only. Recorder-return behavior, process interruption, file-provider readback, backup round-trip, eight-language display/RTL, long recordings and device performance still require Android device testing. Clinical validation remains separate and pending.

The native FrameLayout host applies system-bar, navigation-bar and display-cutout insets before sizing the WebView. Android API 30+ also applies keyboard insets; API 26–29 uses legacy window insets with `adjustResize`. Padding is replaced on each inset dispatch, so rotation and navigation-mode changes do not accumulate padding. This supports target-35 edge-to-edge layouts without relying on an opt-out theme flag. Cutout devices, gesture/three-button navigation, keyboards and rotation still require real-device layout verification; source and compilation checks do not establish that verification.

原生容器先为状态栏、导航栏及屏幕挖孔保留安全区域，再确定网页可用范围；API 30 以上同时处理键盘区域，API 26–29 使用旧版窗口边距与 `adjustResize`。每次窗口边距变化均重新设置，不累加留白。适配目标版本 35 的边到边显示，不依赖主题退出开关。挖孔屏、手势／三键导航、键盘与旋转布局仍须真机核验，源码检查和编译不代表已完成该验证。
