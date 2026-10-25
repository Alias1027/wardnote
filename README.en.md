# WardNote

[简体中文](README.md#简体中文) · [English on project homepage](README.md#english) · [Combined pre-release](https://github.com/Alias1027/wardnote/releases/tag/v0.6.15-preview.1) · [Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)

## About the Project

WardNote is a portable clinical note-taking and work memo tool designed to support initial assessment, inpatient ward rounds, and longitudinal patient follow-up. With particular attention to the learning and practical needs of medical students on clinical rotations, residents, and other early-career physicians, it aims to support the development of clinical reasoning and patient management skills, as well as reflection on and learning from clinical decisions.

The project prioritizes independent use, text-based documentation, and offline operation by default. Once installation and offline preparation for the relevant platform are complete, core note-taking functions do not require integration with hospital electronic medical record or hospital information systems (EMR/HIS), cloud models, or a continuous internet connection. Through multilingual interfaces, encrypted local storage, and portable backups, WardNote aims to reduce barriers to use and deployment across countries and regions, with particular consideration for settings with unreliable connectivity, limited health information infrastructure, or constrained healthcare resources. Device compatibility, performance on devices with limited computing resources, and suitability for clinical use require further evaluation.

Its design draws on relevant principles from the following policies, standards, and guidelines: China’s Key Provisions of the Core Systems for Medical Quality and Safety (the 18 core systems); the US Centers for Medicare & Medicaid Services (CMS) Conditions of Participation for Hospitals (CoPs), Joint Commission National Patient Safety Goals (NPSGs) and their successor framework for the Hospital and Critical Access Hospital accreditation programs from 2026—the National Performance Goals (NPGs)—and the ACGME Common Program Requirements for Residency; the UK’s NICE guideline CG50, the original National Safety Standards for Invasive Procedures (NatSSIPs) published by NHS England, and the revised NatSSIPs 2 published by the Centre for Perioperative Care (CPOC); and Germany’s Federal Joint Committee (G-BA) Quality Management Directive (Qualitätsmanagement-Richtlinie, QM-RL).

**The published combined pre-release includes the main project v0.6.15 (UI r1) and Android 0.1.2-preview.** The current `Alias1027/wardnote` repository includes Windows, browser/PWA and Android resources. Each runtime keeps its own version. The [original Android r1 release](https://github.com/Alias1027/wardnote/releases/tag/android-v0.1.2-preview) and all five assets are preserved.

**2026-10-25 copy update:** main includes the introduction/help update for main-project 0.6.15 UI r2 and Android 0.1.3-preview; this task creates no new Release. Published downloads below remain UI r1 / Android 0.1.2-preview, with original assets preserved. See the [copy-update guide](docs/INTRODUCTION-UPDATE-20261025.md) for delivery and validation scope.

## Downloads and getting started

| Use | Download | Start and scope |
| --- | --- | --- |
| Windows x64 | [One-click portable package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-portable-win-x64.zip) | Extract fully and double-click `Start-WardNote.cmd`; Node is bundled. Local access and offline notes are supported. |
| Phone/desktop browser and PWA | [Static PWA deployment package](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-static-pwa.zip) | An administrator hosts only `site/` at a dedicated trusted HTTPS origin using the included guide. Users prepare offline resources and may install via browser prompts. No public demonstration site is hosted. |
| Android, offline first launch | [APK installer](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-android-0.1.2-preview.apk) | Android 8.0+ plus the required WebView capability checks. First launch can be offline; no self-hosted HTTPS site is needed. |
| Main-project development | [Frozen v0.6.15 source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15.zip) | Requires Node.js 24+; read the included instructions. |
| Whole-project development | [Combined browser/PWA and Android source](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/wardnote-0.6.15-ui-r1-android-0.1.2-preview-source.zip) | Both product lines, unified guidance and hosted workflows. The APK is a separate download. |
| Integrity | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.1/SHA256SUMS.txt) | Individual `.sha256` sidecars are also available; hashes verify download integrity. |

**Windows:** download and fully extract the portable package, launch it, and use fictional cases to check saving, reopening and verified backup. Closing a browser tab does not stop the local server; use the launch panel to stop it. [Deployment guide](browser-pwa/docs/EASY-DEPLOYMENT.md)

**Phone browser/PWA:** a trusted HTTPS app address is required for initial preparation. This is a deployment package, not a public online service. After preparation, offline reopening is available. Static deployment has no server synchronization or cloud-ASR API. [Eight-language getting-started guide](browser-pwa/docs/GETTING-STARTED.md)

**Android:** install the APK using a trusted file manager; downloading on a computer and transferring by USB is also possible. Allow the installation source temporarily only as required by Android, then disable it if desired. WardNote invokes an existing recorder, then asks the user to verify the patient and import its output; manual audio import is the fallback. [Android user guide](docs/ANDROID-USER-GUIDE.md)

## Shared features and platform boundaries

- Eight UI languages: Simplified Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu; Arabic/Urdu use right-to-left layouts. Changing UI language preserves clinical source text. Native clinical language review remains pending.
- Offline by default, with encrypted workspaces isolated by account and personal/institutional mode. Matching usernames do not share data across devices. Transfer compatible encrypted backups into a new account; changes from separate copies are not automatically merged.
- The main project offers optional interfaces requiring explicit authorization and configuration; static PWA deployment has no server features. Android has no `INTERNET` permission, cloud synchronization, model calls or transcription. Eight UI languages do not establish eight-language offline ASR.
- The main project includes local recording, source review, safe update prompts and encrypted multipart backup. Android uses external recording/document applications; those apps may retain or synchronize their own copies. Encrypting an imported copy does not control external originals.
- Finish recording, save and independently verify backups before updating. Browser/PWA updates wait for a safe user-confirmed transition; Android upgrades require the same application ID and signature. Do not uninstall or clear site/app data to fix an old-version display.

## Acknowledgments

I am grateful to Shaanxi Provincial People’s Hospital, where I am currently undertaking residency training, and to my mentor, Dr. Qi Lei (MD, PhD), for their support of this project.

I sincerely thank Dr. June Chunqiu Hou (MD), Dr. Andrew Fagelman (MD), and Dr. Laszlo Mechtler (MD) for their thoughtful teaching and guidance during my clinical experiences in the United States.

The design of the clinical decision reflection worksheet was also inspired by the published columns of Dr. Charles Jiang (MD).

## Scope and Copyright

WardNote supports clinical note-taking, work memos, and education. It does not replace official medical records, medical orders, institutional management systems or responsibilities, or the professional judgment of healthcare practitioners. Clinical care, signatures, approvals, and implementation of institutional policies must continue to follow applicable local requirements and formal institutional procedures.

© Junhui Liu M.D. All rights reserved. Use and redistribution are subject to the accompanying project license.

Feedback and support: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)

## Repository and validation

| Path | Contents |
| --- | --- |
| [browser-pwa/](browser-pwa/README.en.md) | v0.6.15 main-project source with the UI r2 copy update, Windows launchers, static deployment tools, tests and [public paper templates](browser-pwa/templates/README.md) |
| `android/`, `web/` | Android container and bundled web resources; `web/` is not the standalone main product |
| [docs/PROJECT-VALIDATION.md](docs/PROJECT-VALIDATION.md) | Combined version/check scope and pending validation |
| [docs/COMBINED-RELEASE.md](docs/COMBINED-RELEASE.md) | Unified installation, updates, source and historical assets |

[Main-project hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/main-project-ci.yml) · [Android hosted checks](https://github.com/Alias1027/wardnote/actions/workflows/android-ci.yml)

Existing main-project local evidence covers 167 core/API/publication checks, 320 browser checks and 29 final publication-specific checks. Existing Android evidence covers 15 core, 18 desktop bridge simulations, 3 desktop upgrade simulations and 12 public-package boundary checks. Hosted checks also run against the combined tree; see the validation guide and Release for actual results and scope. All cases are fictional. Physical devices, recorder round trips, low-resource operation, full shifts, native clinical review and hospital/clinical validation remain future feedback work. Engineering checks do not establish clinical benefit.

The 2026-10-24 integration adjusted `.gitattributes` for exact checkout bytes and made the account-mode browser test wait for form replacement, updating its manifest; 180 original files and all runtime code remain byte-identical. All three original download archives are unchanged. The 2026-10-25 UI r2 update changes introduction/help copy and associated resources, cache and test manifests without changing record formats or account encryption.

Frozen `browser-pwa/` documentation retains the preparation-stage record dated 2026-10-21. Statements there about publication or hosted CI being pending describe that historical snapshot. This README, the combined guide and Release describe current downloads and publication/CI status.

## Feedback, design references and license

- [Report an issue or suggestion](https://github.com/Alias1027/wardnote/issues/new/choose): identify Windows/browser/PWA/Android, version and reproducible steps. Use fictional data only; do not attach clinical records, audio, backups, passwords or keys.
- [Report a vulnerability privately](https://github.com/Alias1027/wardnote/security/advisories/new): private reporting is enabled. Contact and licensing: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com).
- Design references include China's 18 Core Medical Quality and Safety Systems, US CMS-CoPs, Joint Commission NPSG, ACGME CPR, UK NICE CG50, NHS England/CPOC NatSSIPs and Germany's G-BA QM-RL. [Sources and scope](browser-pwa/docs/CLINICAL-SCOPE.md) identify the documents. Reference does not imply certification or complete fulfillment of regional requirements.

Copyright **Junhui Liu M.D.** The [WardNote Personal Noncommercial Source-Available License 1.0](LICENSE) permits independent personal noncommercial learning, self-directed research, experimentation and testing within its terms. **All institutional and commercial uses require prior written authorization.** This is source-available, not OSI-approved open source. Valid earlier Apache-2.0/CC BY 4.0 grants and third-party licenses retain their own effect. [Licensing policy](LICENSES/README.md)
