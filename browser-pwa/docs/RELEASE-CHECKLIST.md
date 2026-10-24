# Release readiness and follow-up / 发布准备与后续验证

Version **0.6.15**, including UI r1, 2026-10-21. Public-source preparation only; no GitHub repository or hosted deployment has been created by this check. See [validation evidence](VALIDATION.md) for completed checks.

## Available now / 当前可执行

- Reconcile current documentation versions and local-account/server-workspace boundaries; preserve historical version labels and earlier license grants.
- Run all core and browser suites configured in `app/package.json` with fictional data, validate the isolated source package, inspect screenshots and scan public content. Keep development profiles, databases, audio and private configuration outside the package. Release-specific counts belong in the validation report, not a second manually maintained list here.
- Exercise update deferral, multiple open pages, failed saves, active recording and rollback with synthetic records. Check source versions, review state, audio and record history before and after; never rehearse by downgrading live patient data.
- Check update discovery without injecting a manual service-worker call: startup, foreground/reconnection and the periodic check, plus user-facing manual checks before login and in Settings. Inspect all-language notices, stale HTTP cache handling and old-page migration. Publish a complete consistent package; never clear site data as an update remedy.
- Exercise segmented local backup/restore and legacy backup compatibility, including missing, altered or mixed parts, incorrect passwords, interrupted restore and existing-account protection. Compare restored records, source links and audio bytes.
- Rehearse extraction and local launch/stop both with installed Node.js and with the verified bundled runtime and no external Node path. A clean operating system remains a post-publication check.
- Provide a fictional demonstration and a short usability protocol. No clinical benefit or speech accuracy is inferred from engineering tests.

工程检查范围包括：安全升级与回退、长期录音分卷备份恢复的合成数据演练、文档校准、完整测试和独立发布包核查。具体通过数量、演练范围和限制以验证报告为准。本次文档定稿沿用注明版本归属的既有全量及 UI r1 验证证据，并重新执行发布相关测试和交付包核查；不声称再次运行全量测试。现有数据和 C 盘纸质模板保留；本轮不实际发布 GitHub。

This documentation-only freeze retains the attributed full-suite and UI r1 evidence, with publication tests and artifact checks repeated for the final files. It does not claim a new full-suite run.

## After authorized publication: voluntary feedback / 获准发布后：自愿体验与综合反馈

The owner has deferred the following work until after an authorized public pre-release, inviting voluntary users to contribute synthetic-case experience. This release prepares the plan only; it does not recruit users, publish a repository or mark these checks complete. Personal evaluation follows the current license; institutional and commercial evaluation still requires prior written permission. The project remains source-available, not OSI open source.

以下“近期验证”按用户决定转为获准公开预发布后，邀请使用者自愿体验并汇总反馈。本轮仅保留计划，不招募、不发布、不视为已完成。个人评估依现有许可；机构和商业评估仍须事先书面授权。使用虚构病例和自录的虚构口述，反馈中不上传患者记录、原始音频、数据库、备份或服务凭据。

| Item / 项目 | Next verification and acceptance / 后续验证与验收 |
| --- | --- |
| Clean Windows installation / 全新电脑 | A first-time user follows README only: choose the Windows x64 offline package (or install Node.js 24+ for the source package), extract, launch, create a fictional note, restart, reopen offline, export backup and restore into an isolated account. Record time, failures and required help; compare restored content and retained audio. / 记录首次完成耗时、报错及帮助次数，核对恢复内容。 |
| Physical Android and iPhone / 真实手机 | Use trusted HTTPS; verify install/add-to-home-screen, standalone launch, keyboard/RTL layout, offline reopen, account switching, backup recovery and interrupted recording. Background/lock-screen recording remains unclaimed. / 未经验证不承诺后台或锁屏连续录音。 |
| Limited infrastructure / 有限基础设施 | On available lower-memory devices and intermittent networks, check initial preparation, offline cold start, long text entry, shared-terminal sign-out and separately stored backup recovery. Record browser/version, storage, power/interruption conditions and help needed. / 记录首次准备、脱机重开、共享终端注销、独立备份恢复及资源限制；不据此推定所有地区或设备均适用。 |
| Native clinical translations / 母语临床审校 | Review field meanings, consent, errors, medication/units and RTL legibility in all supported languages; record reviewer and corrections in the existing review sheet. / 不能以键值完整替代临床语义审校。 |
| Institutional environment / 医院环境 | The institution verifies HTTPS, access arrangements, retention/backup, recording permissions and approved interfaces using synthetic data before any permitted clinical pilot. / 正式权限、医嘱、签署及管理流程仍由机构承接。 |
| Speech and longer recording / 语音与长时录音 | Validate real approved recognizers, 20-minute sessions and cumulative use; measure negation, drug/dose/unit, speaker and wrong-section errors, correction time and interruption recovery. / 脱机识别及生物识别、二维码授权仍未实现。 |
| Clinician usability / 临床人员可用性 | Invite 3–5 clinicians for a formative fictional-case exercise under applicable license permissions. Tasks: locate a patient, retrieve prior findings, update a daily note, review a brief/source, complete a follow-up and resume offline. Record completion, time, errors, help, extra clicks and duplicate EHR entry. This small sample is not efficacy validation. / 小样本仅用于发现可用性问题，不证明临床或教学获益。 |

Collect feedback using the short fields in [EVALUATION.md](EVALUATION.md). Separate reproducible defects, device limitations, translation changes and new-feature requests. Prioritize data preservation and common workflow obstacles; report unsuccessful attempts alongside successful ones. Public user feedback does not replace institutional acceptance or a clinical study.

按[简版反馈字段](EVALUATION.md)记录结果，区分可复现错误、设备限制、翻译修订及功能建议；优先修复资料保存和共同操作障碍，同时记录成功与失败。用户体验反馈不替代医院验收或临床研究。

## Only after publication is authorized / 获准发布后方执行

1. Create the intended repository from the reviewed source package only. Run hosted Windows/Linux/macOS checks and all browser suites; resolve failures before tagging.
2. Enable and check private vulnerability reporting; keep issue examples and attachments fictional. Confirm the maintainer contact and source-available license wording.
3. Publish a pre-release with the source, Windows x64 portable and static PWA ZIPs and their three SHA-256 sidecars (six assets in total), supported environments and known limits. Do not claim OSI open source, clinical certification, validated hospital deployment or automatic cross-device accounts.

实际 GitHub CI、仓库安全设置、标签和 Release 均须在用户授权建仓／发布后执行。本轮只准备文件，不上传、不创建仓库。

## Continuing follow-up from 0.6.13 / 连续查房后续验证

- [ ] Native clinicians review SBAR labels and missing-entry warnings in each language.
- [ ] Observe independent use on physical phones without an EHR connection: compare entry time, omitted information and handoff editing effort.
- [ ] Validate whether original-text previews are concise enough with complex fictional cases; do not silently truncate clinical content.
- [ ] Confirm local clipboard handling and backup practices for the intended deployment.

以上属于母语审校、真实设备或实际部署验证；当前自动测试不代替这些验收。院内接口未接入不妨碍独立核心评估。

## 0.6.15 easy deployment / 便捷部署

See [Easy deployment / 个人与管理员向导](EASY-DEPLOYMENT.md). Windows uses `Start-WardNote.cmd`; mobile/PWA uses the separately packaged static site on a trusted HTTPS origin. The offline administrator wizard prepares configuration only. No public hosting or real-device/clinical validation was performed.

Release assets now comprise source, Windows x64 portable and static PWA ZIPs, each with its `.sha256` sidecar. Only `site/` from the static package is hosted; do not upload personal data or a full working directory.
