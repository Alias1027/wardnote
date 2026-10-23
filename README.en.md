# WardNote · Android Offline Preview

[简体中文](README.md)

**Android 0.1.2-preview, based on WardNote 0.6.15 UI r1.** A separately signed evaluation APK and Android source delivery have been generated. The existing browser application, PWA, frozen packages, account data and C-drive paper templates remain unchanged. The project has not been publicly released.

This **release-material revision r1** adds release notes, support scope, automated checks and feedback templates. APK bytes and the Android runtime version are unchanged. See the [bilingual release draft](docs/RELEASE-0.1.2-preview.md), [release procedure](docs/RELEASING.md), [security policy](SECURITY.md) and [contribution guide](CONTRIBUTING.md).

Minimum Android **8.0 (API 26)**. The installed WebView must also pass checks for a secure context, Web Crypto, IndexedDB and Web Locks. An updated Android System WebView is recommended. A universal minimum WebView version has not been verified across manufacturers; Android version alone does not establish compatibility.

WardNote is a portable ward-round notebook and work aid for longitudinal patient follow-up: initial history, daily changes, assessment and plan, results, memos and handover. It supports clinical reasoning education and patient-management practice. It does not replace institutional medical records, orders, signatures, identity management or official processes.

## Scope

| Area | Android preview scope |
| --- | --- |
| Offline first launch | Application resources are bundled in the APK; no initial HTTPS website visit or server deployment is required. The device must already have a usable Android System WebView and the web capabilities required by this version. |
| Eight interface languages | Simplified Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu; Arabic and Urdu use right-to-left layout. |
| Local accounts | Reuses encrypted workspaces separated by account and personal/institutional mode; sign out before switching. This is not hospital identity verification. |
| Recording | Prefer the device's existing recorder app; review the destination and import the returned recording. If no compatible recorder is available, use Import recording. No new recording engine is developed. |
| Backup and restore | Preserves the encrypted `.wnmanifest` + `.wnpart` format and legacy single-JSON restore. Restore into a new account in the same mode, never over an existing account. |
| Networking | This Android package does not request `INTERNET` permission. Cloud sync, model calls and online transcription are not offered in this preview and remain future work. |
| Platforms | Android only in this phase. iOS and other Apple platforms are outside scope. Physical-device, full-shift and clinical validation await later feedback. |

**The system recorder and document picker are separate apps or system services.** They may retain original recordings in shared storage or use their own cloud services. WardNote encrypts its imported copy; this does not encrypt, delete or prevent uploading of the external original. Use an approved recorder and its offline settings. This preview does not automatically delete external originals. Eight interface languages do not imply offline speech recognition in eight languages.

## Start

1. Check the delivery checksums and [validation record](docs/VALIDATION.md). The release-candidate folder is `Android-offline-preview-0.1.2-release-ready`, the APK is `wardnote-android-0.1.2-preview.apk`, and the source package is `wardnote-android-0.1.2-preview-source-r1.zip`. The original `Android-offline-preview-0.1.2` delivery is retained unchanged.
2. Install the preview APK on Android. Temporarily allow Install unknown apps only for the trusted file manager used for this installation; the permission can be disabled afterwards.
3. Open the app, choose a language and personal/institutional mode, and create an account and password. First launch can take place in airplane mode. Start with synthetic cases to check saving, reopening, returning from the recorder, and backup/restore.
4. Choose Start recording in Memos and confirm the current patient and recording arrangement. Record in the device's recorder app. On return, check the destination, confirm import and listen back. Use Import recording if the recorder does not return its file.
5. Export and verify independent encrypted backups regularly. **Uninstalling or clearing app data removes this installation's local copy.** Before updating, save work and verify a separate backup; use an upgrade APK with the same application identity and signing key.

See the [user guide](docs/ANDROID-USER-GUIDE.md), [build and verification instructions](docs/BUILD-TOOLCHAIN.md), [validation record](docs/VALIDATION.md) and [roadmap](docs/ROADMAP.md).

Existing 0.1.2 runtime evidence records 15 automated tests (one contains 10 native document fault scenarios), 18 desktop Chromium checks with a native-bridge test double, 3 desktop storage/asset upgrade checks, APK signature/checksum checks and byte-for-byte verification of 57 resources. Local checks for release-material r1 are recorded separately; hosted GitHub checks await repository creation and execution. **Android emulator/physical-device installation, real recorder round trips and clinical validation have not been performed.**

## Browser and PWA coexistence

Each entry point has its own local data. Matching account names do not synchronize records. Installing the Android package does not remove browser/PWA accounts. Transfer a complete compatible encrypted backup, using its original password and a new destination account name. This preview does not automatically merge changes made on different devices.

Android program updates use a trusted replacement APK, not the browser Service Worker update mechanism. Do not uninstall or clear app data to fix a stale version display. Save, back up and check the package version, application identity and signature first.

## License and validation

Copyright **Junhui Liu M.D.** The existing [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE) also applies to the new project-owned Android code and documentation in this preview. It permits qualifying private noncommercial learning, research, experimentation and testing. Commercial or institutional use requires prior written authorization. This is source-available software, **not OSI-approved open source**. Previously granted rights and third-party licenses retain their separate effect. Authorization contact: junhuiliu1025@gmail.com.

Source checks, compilation and simulated tests do not establish physical-device or clinical validation. Read the [validation record](docs/VALIDATION.md) item by item; unverified capabilities are not described as ready for real-patient use.

## Previous self-check fixes (0.1.1)

0.1.1 blocks dismissal while audio is being imported and encrypted. Manual import and system recording both show the patient and require confirmation; extra notes are optional. Failed saves retain input and prevent Back from backgrounding the app. The package keeps the 0.1.0 application ID and signing certificate and raises versionCode from 1 to 2. Finish recording and saving, export and verify a backup, then install over the existing app. WardNote cannot prevent a forced system-installer update or OS process termination. See the [self-check report](docs/SELF-CHECK-0.1.1.md).

## Security repairs in 0.1.2

The two selected security skills were installed and applied. Exports now retain account/patient checks across asynchronous steps and block switching during transfer. Picker-policy failures are handled; existing/unverifiable provider files are never opened or deleted by the new-file guard, and cleanup failures are reported honestly. See the [security review](docs/SECURITY-REVIEW-0.1.2.md). The update retains its package/signature and increases versionCode from 2 to 3. Physical-device and clinical verification remain pending.
