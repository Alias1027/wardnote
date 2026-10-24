# Changelog

## 0.6.15 — 2026-10-21

- Freeze the first-preview candidate including UI r1; align launcher/download instructions and preserve version-specific test attribution. Documentation-only closeout; no runtime behavior or dependency change.

- UI patch r1: reorder memo actions to Text memo, Start recording, Import audio across all eight interfaces; preserve existing recording and import behavior.

- Check for program updates at startup, on returning to the foreground or reconnecting, and every five minutes while visible; expose manual checks before login and in Settings in all eight languages.
- Keep an available update pending until the user chooses to save and apply it. Preserve the current page when recording, pending operations, dialogs, another app window or a failed save prevents a safe switch.
- Download program resources without reusing stale HTTP cache entries; keep update coordination separate from patient data and connection authorization.
- Offer a separate retry for incomplete candidate program downloads without clearing patient data or automatically applying the update.
- Document complete-package deployment and the one-time close-and-reopen procedure for very old pages without update controls. Never clear site data to resolve an update.
- Keep existing encrypted records, recordings and historical validation evidence; current verification results and remaining device checks are reported separately in the validation report.


## 0.6.14 — 2026-10-21

- UI patch r2: memo recording entry now reads Start recording in all eight languages, matching the voice panel. Existing patient confirmation, local recording and reviewed transcription remain shared.

- Friendly Windows launcher with fixed-address ownership checks and explicit stop confirmation.
- Eight-language device setup, trusted link sharing, browser/PWA guidance and offline readiness checks.
- Separate device-local static PWA package and offline administrator HTTPS setup wizard; deployment remains opt-in.
- Existing encrypted records and recordings are preserved; real-device and clinical validation remain pending.

## 0.6.13 — 2026-10-21

- Added local device/offline readiness checks, explicit persistent-storage requests, advisory capacity warnings and audio capture/import protection while preserving original recordings.
- Separated backup download offers, folder writes and verified-current-snapshot status; added offline migration guidance without automatic synchronization.
- Added independent region/date/time-zone/digit preferences and A4/Letter printing; clinical source values remain unchanged. Updated all eight interface catalogs.
- Added a Windows x64 offline distribution with a verified official Node runtime, original third-party license and provenance manifest; source distribution remains runtime-free.
- Kept real low-end devices, recording quality, installed PWAs, native clinical review and hospital validation in the post-publication feedback plan. No GitHub publication or live-data migration.

## 0.6.12 — 2026-10-18

- Prepare application updates without forcing a switch in working pages; offer a safe apply step that checks saved work, recording and other app windows. Normal activation also occurs after all old pages close. Keep program caches separate from clinical data and document scoped rollback limits.
- Add encrypted segmented device backup and checked restore for larger audio collections while retaining legacy single-file restore; existing accounts are not overwritten.
- Reconcile current documentation, account/language boundaries and the release-checklist suite wording. Preserve previous evidence and license grants; the current source-available license is unchanged.
- Move physical-device, first-use, clinician/native-language and hospital-dependent evaluation to voluntary synthetic-case feedback after separately authorized publication. Record infrastructure prerequisites and unsupported/unvalidated limits.
- See the release validation report for actual completed upgrade/rollback/backup checks and their boundaries. No GitHub publication, patient-data upload or C-drive template change is part of this release preparation.

## 0.6.11 — 2026-10-18

- Add bed-ordered inpatients navigation and searchable switching with existing save/recording guards.
- Reuse the same unfinished tasks in a collapsible handoff section; completion updates the original task and invalidates prior SBAR previews.
- Show source review/task state and open the original patient-scoped record from the source preview.
- Keep all eight interfaces aligned. Record optional speech, phrases and hospital adapters as future work, not implemented dependencies.

## 0.6.10 — 2026-10-18

- Added an optional saved-record comparison, including same-day rounds, missing-entry warnings and source timestamps.
- Added local SBAR handoff drafts using existing summary storage, edit/review history and source checks. Copy requires review and current sources.
- Kept eight-language UI parity, original clinical wording and offline-first independent use; hospital integration remains optional.


## 0.6.9 — 2026-10-18

- Pre-publication documentation reconciliation: current versions, recorder labels, local-account isolation versus shared mode-specific server scope; final full-suite validation and explicit follow-up checklist. No runtime, data schema or license permission changes.

- Added shared, collapsible eight-language getting-started guidance on sign-in and Settings & Help: Windows launch, direct browser use and PWA entry points, with explicit Node.js/HTTPS prerequisites and pending physical-phone/standalone-PWA validation.
- Updated Chinese/English READMEs, GitHub introductions, deployment documentation and delivery quick start. Basic notes remain offline by default; no new synchronization, installation engine or clinical feature is introduced.


## 0.6.8 — 2026-10-18

- Settings & Help now includes an eight-language reference, purpose and copyright notice with collapsible public source addresses, NPSG/NPG edition context and unchanged licensing boundaries. Available offline; no external resources load automatically.
- GitHub introductions and Chinese/English READMEs share the same notice, with a full eight-language document.
- V007 Chinese/English paper footer annotations were reduced to 7 pt with more writing space restored; paper files remain external to the public V006 package.


## 0.6.7 — 2026-10-18

- Fix recording confirmation: supplemental details are explicitly optional; the checked patient/recording confirmation is retained when no extra text is entered. Explain microphone denial, missing devices and device availability errors.
- Recognize explicit dictation headings across clinical worksheets, memos, tasks, pending results, laboratory fields and learning reflections. Suggest destinations in all eight interface languages; preserve original quotes and audio.
- Require manual review before atomic append. Unknown destinations, incomplete laboratory fields, changed source/target versions and duplicate submissions cannot silently write records. No inferred clinical values, automatic orders or new offline ASR.

## 0.6.6 — 2026-10-18

- Add Voice input beside text memos and audio import. Recording remains local by default and returns to the patient memo section after saving.
- Save reviewed transcripts or manually transcribed text as separate memos with recording ID, version and transcript provenance; keep the original audio. Edits clear the memo review marker.
- Transcription still requires explicit connection authorization and a configured service. No offline ASR or automatic external submission is added.

## 0.6.5 — 2026-10-18

- Registration follow-up: use one account field and derive the new workspace recorder label from the account; retain existing record attribution.

- Move all memo tools below the patient brief: text create/edit, audio import/playback, review flags, excerpts, transcription actions and download. Remove the duplicate floating memo entry.
- Keep memo collapse state per encounter, pause playback on collapse, and preserve playback during unrelated autosaves. Existing records and audio are unchanged.
- Add username/password sign-in with independent encrypted local accounts, logout-before-switch, original-password legacy binding and restore-to-new-account. Hospital SSO, roles and mode-specific server authorization remain separate.

## 0.6.4 — 2026-10-17

- Add the collapsible four-item patient brief with local source extraction, timestamps, versioned source excerpts and explicit clinician review.
- Allow manual editing without changing original notes. Edits clear review; stale sources block review, and confirmed regeneration retains earlier revisions.
- Show existing patient memos below the brief as an independently collapsed index. Keep memo/audio review and audio-retention rules separate.
- Localize new controls in all eight UI languages, preserve authored text, and cover offline use, source changes, failed saves and patient isolation with synthetic checks.

## 0.6.3 — 2026-10-17

- Clarify the patient task shortcut as an unfinished-item count in all eight languages; preserve the existing encounter-scoped counting logic.

- Refine the daily worksheet heading to “评估与计划” / “Assessment and Plan” and the equivalent concise labels in all eight interfaces; retain the problem-oriented fields.

- Remove the duplicate voice shortcut from the record toolbar; retain the patient voice panel entry.
- Put teaching prompts, save retry, draft export and selected-record history in an accessible edge drawer with keyboard/backdrop dismissal and RTL/mobile layouts.
- Keep recovery actions reachable after a failed save and preserve current fields when toggling teaching prompts.
- Ignore stale background permission reads after cross-page logout, and remove the drawer on session or record changes.

## 0.6.2 — 2026-10-16

- Link reviewed voice candidates to exact transcript passages; retain evidence after insertion and reset selection when edited.
- Accept optional timestamped transcript segments and replay source audio with context; preserve encrypted originals and fall back to full audio when positions are unavailable.
- Add optional pre-round source review and task outcome/completion metadata without adding workflow states or new main pages.
- Update all eight UI catalogs and document named clinical reference frameworks and deployment boundaries.

## 0.6.1 — 2026-10-16

- Bind asynchronous device operations and transfer previews to the originating login session. Reject stale work after logout or account switching.
- Close clinical dialogs and stop microphone capture on cross-page sign-out; retain already-saved fragments for recovery.
- Recheck text-only and audio upload scopes, reject truncated audio downloads, and clear unresumable sync staging on service restart.
- Clarify the offline network-loss notice; add deterministic synthetic regressions for account boundaries, media interruption and full audio round trips.

## 0.6.0 — 2026-10-16

- Default offline device workspaces: encrypted text/audio persistence, reopen unlock, saved-segment recovery and encrypted backup/restore.
- Personal and institution/hospital modes at sign-in, sign-out-before-switching, independent browser/server stores and credentials.
- Explicit password authorization per connection session; no automatic clinical transfer or cloud processing when connectivity returns.
- Manual selected-patient sync with audio off by default, conflict review, version rechecks and atomic audio integrity verification.
- Credential-free authorization outbox with independently configured email/API/database-adapter destinations per mode; empty by default, failed delivery retained.
- Eight-language account/offline UI; regression tests exercise the new local storage workflow and mock-only integration paths.
- Offline ASR, passkeys, QR authorization and device-specific PDA work remain future directions. Prior clinical records, paper templates and license grants are preserved.

## Documentation supplement — 2026-10-15 (application remains 0.5.3)

- Record device-independent portable-terminal usability, weak-network saving, patient-context, recording-interruption and institutional-deployment directions in the bilingual roadmap. Implementation is explicitly deferred.
- Keep offline drafts conditional and device-specific scanner/native/background work for later evaluation. No application, schema, configuration, license or clinical workflow change; no additional device compatibility claimed.
- 仅补充未来便携终端方向及部署说明，本轮暂不实施；应用仍为 0.5.3。

## 0.5.3 — 2026-10-13

- Preserve task next-step/contact details in summaries. Add a separately dated current outstanding-task snapshot, including work outside the narrative date range; source changes and new pending tasks require regeneration before review.
- Show a nonblocking reminder when a discharge date is entered while tasks remain open. Discharge does not complete tasks or remove them from follow-up.
- Refine optional supervising-clinician/contact/receiver-confirmation hints in all eight interfaces.
- Clarify institution-owned identity authorization, access control and audit governance, pseudonymization limits and retained local safeguards; no new hospital administration module.
- Keep existing records, summary language and prior license grants unchanged.

## 0.5.2 — 2026-10-13 — pre-release

- At the owner's request, aligned with Headache Diary's personal noncommercial source-available policy. Institutional/commercial use requires prior written permission; older grants and third-party rights remain intact. Updated source headers, metadata, bilingual introductions and contribution terms.
- Refined existing daily-review hints for consciousness, hospital-defined monitoring frequency and escalation criteria.
- Added concise critical-result follow-up guidance to daily results and the existing task-details field: notification, action taken and reassessment time. No extra fields, task states or automatic alerts.
- Updated all eight interface languages and the translation review sheet; native clinical review remains pending.
- Documented the boundary between a portable ward-round aide, hospital EMR/EHR and institutional procedures. No clinical schema or application access-control change.

## 0.5.1 — 2026-10-13 — pre-release

- Unified current release metadata, documentation, licensing examples and validation evidence; historical release results retain their original versions.
- CI runs all five core/API/publication test suites on Windows, Linux and macOS, then builds and tests the allowlisted source package; Linux browser checks cover all three workflow suites.
- Added publication regression checks for current documentation versions, complete CI coverage and packaged test availability. CSV review assets now participate in the public-source secret/path scan.
- Added Chinese/English GitHub About text and README introduction; refreshed the synthetic dashboard illustration.
- No clinical schema or workflow change. GitHub-hosted CI and native clinician translation review remain pending.

## 0.5.0 — 2026-10-13 — pre-release

- Added a shared eight-language registry and persistent native-name selector for Chinese, English, Spanish, French, Russian, Arabic, Hindi and Urdu. Complete catalogs cover form labels, teaching prompts, states, dialogs and errors.
- Added Arabic/Urdu right-to-left layout, connected-script fonts, responsive controls and print support, with original clinical text preserved during language changes.
- Report choices and saved report direction are independent of the UI. Local summaries retain their label language; model-generated candidates remain subject to manual review. Speech support remains a separately validated integration contract.
- Added translation review CSV, draft glossary metadata, locale/markup coverage tests and eight-language desktop/mobile workflow checks. New translations require native clinical review before clinical reliance.

## 0.4.1 — 2026-10-11 — pre-release

- Initial history now places contacts/source after family/social history, and reproductive/function history after review of systems/examination, in both UI languages and A4 output. Field keys and saved values are unchanged.
- Expanding inpatient background directly reveals its fields, without a separate creation button. Initialization is idempotent per encounter, with a retryable loading state and normal autosave afterward.

## 0.4.0 — 2026-10-11 — pre-release

- Added patient-scoped Voice, Memos and Tasks floating panels with collapse/reopen, desktop drag/dock/reset, and a single mobile bottom panel. Renamed Course to Clinical course.
- Encrypted voice drafts preserve transcript, target note, report language and candidates across navigation/reload. Only explicitly selected candidates append after version and encounter checks, in an atomic transaction.
- Moved memo operations into a panel while retaining important source references on the course timeline. Pending results share a simple To follow up / Done task workflow.
- Added Seriously ill / Critically ill states; legacy attention flags remain pending clinician reassessment. Expanded English interface coverage without rewriting clinical values.
- Added disabled-by-default compatible text-model profiles for OpenAI, DeepSeek, Doubao, Qwen and institutional gateways. Kept audio transcription separate and documented native speech adapter limits. Translated summaries retain generation language and original source compilation.
- Same-patient navigation and UI language switching can continue during recording; cross-patient navigation remains blocked.

## 0.3.0 — 2026-10-11 — pre-release

- Reordered clinical sections to History/background, Daily review, Course/memos and Tests/results; moved tasks into daily review and kept memo controls with the course timeline.
- Added a bed-sorted, searchable inpatient table showing hospital day, latest problems, today's review status and open tasks.
- Aligned initial, daily and background field prompts and paired layouts with the Chinese b and English V006b paper templates, including prominent initial results, selected data trends, task tables and handoff.
- Added Chinese/English UI switching, remembered non-clinical language preference, English prompts and service messages. Clinical content and exported values remain in their original language.
- Preserved existing field keys; added initial vitals without moving old content. Language switching honors recording and unsaved-draft guards.
- Updated A4 printing to include worksheet grouping, trend verification and task tables; removed a blank page caused by the hidden application shell.

## 0.2.0 — 2026-10-11 — pre-release

- Consolidated patient notes, review/handoff and optional decision reflection into one patient workspace with four sidebar entries.
- Made text-based daily notes the default, with compact prior-note comparison and cross-patient task/review queues. Folded voice tools, detailed reasoning prompts and secondary record operations.
- Kept handoff editing linked to the same daily record, patient identity visible while scrolling, and save/recording navigation guards.
- Added explicit legacy reflection linking with revision checks; excluded teaching reflections from clinical exports, receiver payloads and summaries.
- Defined a lightweight ward-round product boundary and prioritized usability over EMR feature expansion. Existing clinical records and database format are preserved.

## 0.1.1 — 2026-10-11 — pre-release

- Moved Data management below Decision reflection in the sidebar.
- Added Chinese and English project introductions, deployment/interface documentation, a validation plan and contributor/security guidance.
- Adopted Apache-2.0 for software and CC BY 4.0 for templates and narrative documentation, as selected by the project owner.
- Removed the machine-specific default Playwright path; locked browser-test dependencies and added a standard installation route.
- Added CI definitions, synthetic issue templates, a publication allowlist, release integrity checks and an isolated source-package workflow.
- Standardized version reporting and changed the application-shell cache version. Clinical record and database formats are unchanged.
- Added browser verification of interrupted audio upload and explicit retry. These short synthetic checks do not validate a full clinical shift.
- Made process identity checks compatible with PowerShell 5 and 7 timestamp parsing; launch output now honors the configured data directory.

## 0.1.0 — 2026-10-11 — local prototype

- Implemented initial and inpatient worksheets derived from V006/V006b, problems, labs and tasks.
- Added audio capture, encrypted chunks, playback, important clips and a configurable transcription adapter.
- Added human-confirmed classification, source-linked summaries, clinician review and scoped patient participation.
- Added manual retention evaluation, export, encrypted backup and protected restore.
- Recorded 25 core/API checks and 17 browser workflow checks on the development machine using synthetic data.

Dates use Asia/Shanghai. Pre-release status describes current maturity; it is not a claim of clinical approval or GitHub publication.
