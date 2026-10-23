# Android 实现依据 / Android implementation references

核对日期 / Checked: **2026-10-23**. 以下为平台机制依据，并非对本软件的认证或运行验证。 / These sources describe platform behavior; they do not certify or validate this application.

- [Android MediaStore.Audio.Media — RECORD_SOUND_ACTION](https://developer.android.com/reference/android/provider/MediaStore.Audio.Media#RECORD_SOUND_ACTION)：系统录音请求的标准动作；不能据此假定所有设备都有兼容录音应用。 / Standard sound-recording intent, not a guarantee that every device has a compatible recorder.
- [Get a result from an activity](https://developer.android.com/training/basics/intents/result)：接收外部活动结果，并考虑应用在此期间被回收或重建。 / Receiving external activity results while accounting for activity/process recreation.
- [Load in-app content](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content)：将网页资源随应用打包并通过安全的本地资源路径加载；无需首次访问远程网页。 / Bundled web content through a secure local resource path without an initial remote website visit.
- [Access documents and other files from shared storage](https://developer.android.com/training/data-storage/shared/documents-files)：使用系统文件选择器授权访问；其提供程序可来自本地或云端。 / User-selected document access through providers that may be local or cloud based.
- [Back up user data with Auto Backup](https://developer.android.com/identity/data/autobackup)：应用自动备份与排除设置；不能将系统备份当成本项目已核验的加密备份。 / Auto-backup configuration and exclusions; system backup is not a verified WardNote encrypted backup.

现有临床与管理参考说明继续随原应用保留。新增 Android 外壳不扩大原产品的用途边界、临床验证范围或授权范围。 / Existing clinical and management references remain with the original application. The Android shell does not expand intended use, clinical validation or licensing rights.
