# Evaluation plan / 验证计划

Release follow-up / 发布后续验证：[readiness checklist](RELEASE-CHECKLIST.md).

This plan records work still needed. It is not a report of completed clinical validation.

**Timing decision, 2026-10-18:** first complete locally executable upgrade, rollback and recovery checks. After the owner separately authorizes public pre-release, invite voluntary users to try synthetic cases and combine their feedback. No users are recruited or repository published in this preparation. Institutional or commercial evaluation remains subject to prior written permission under the source-available license.

**2026-10-18 安排：** 本轮先完成本机可执行的升级、回退和恢复检查。待作者另行授权公开预发布后，再邀请用户以虚构病例自愿体验，汇总首次使用、真实设备、临床人员和多语言反馈。本轮不招募、不发布；机构及商业评估继续依源码可见许可取得事先书面授权，用户体验反馈不代替医院验收或临床效果研究。

## Reproducibility

Have a contributor start an extracted source package on a clean Node.js 24 environment without access to the development machine. Record OS, Node/browser versions, exact commands, failures and time to first fictional note. Check export, backup and restore with synthetic records.

Include lower-memory devices, interrupted power/network access and shared terminals when available. Establish first-load preparation and storage requirements separately from routine offline use. A successful desktop browser run does not demonstrate universal suitability across countries or resource settings.

## Recording reliability

The target scenario is 10–20 patients at roughly 20 minutes per patient (about 3 h 20 min–6 h 40 min of recording daily). This is a workload assumption to test, not a verified average clinical practice statistic.

Test real elapsed 20-minute sessions and cumulative shift-length use on intended devices. Record chunk counts, durations, server bytes, memory, playback continuity and battery behavior. Include temporary Wi-Fi loss, session expiry, permission revocation, device changes, server restart, page closure and insufficient disk space. Verify that failures cannot silently mark incomplete recordings as complete. Do not infer elapsed-time reliability from a short fake-microphone test or from uploading a large synthetic file quickly.

## Speech and classification

After an approved service is connected, use permitted synthetic/scripted or institutionally approved evaluation material. Separate speaker attribution, negation, drug/dose/unit, temporal and uncertainty errors. Measure omission, unsupported insertion and wrong-section rates before and after physician correction. Record correction time and disagreements. No real patient recordings should be deposited in this repository.

## Workflow and education

Begin with simulated cases and clinician feedback. Agree the evaluation design with local supervisors before an institutional pilot. Compare documentation time, important omissions, task completion, source traceability and review workload against an appropriate baseline. For training, use a pre-specified rubric for problem representation, evidence, alternatives, monitoring and escalation, with supervisor assessment and preferably blinded scoring where feasible.

Track unintended burdens: extra clicks, duplicated EHR entry, over-documentation, delayed care, consent discomfort and summary review time. Report unfavorable results alongside improvements. Do not infer causality from uncontrolled usage or claim a fixed number of days guarantees improved clinical ability.

## Release evidence

Use dated validation reports with environment, sample composition, denominators, failures and unresolved issues. Share aggregate or synthetic outputs. Keep institution-specific approvals and identifiable source data outside the public repository.

## Short feedback form / 简版体验反馈

Use only fictional cases. Report an issue through the published project's channel after publication; no destination has been provisioned in this preparation. Do not attach patient records, recordings, screenshots with identifiable information, backups, account passwords or service keys.

公开发布后，通过届时正式项目渠道提交虚构病例反馈；本轮不创建接收端。不上传患者记录、患者录音、可识别患者的截图、备份、账号密码或服务密钥。

| Field / 字段 | What to record / 记录内容 |
| --- | --- |
| Environment / 环境 | App version, OS/device, browser/version, UI language, browser or installed PWA; approximate free storage if relevant. / 版本、设备系统、浏览器、语言、浏览器或独立 PWA；必要时注明可用空间。 |
| Task / 操作 | Fictional-case task and short repeatable steps; first use or returning use. / 虚构病例任务、可重复步骤及首次或再次使用。 |
| Outcome / 结果 | Expected and observed behavior, completion/time/help needed; whether saved data and audio survived reopen or restore. / 预期与实际、完成情况、耗时和求助次数；重开或恢复后资料是否完整。 |
| Conditions / 条件 | Offline/online, interruption, shared terminal, keyboard, reading direction or resource limit relevant to the issue. / 与问题有关的脱机联网、中断、共享终端、键盘、阅读方向或资源限制。 |
| Suggestion / 建议 | One concrete correction, plus whether the same issue recurs. / 一条具体修改建议及是否可重复出现。 |

Maintainers summarize findings by reproducibility, severity and affected environments, publish known limits and retest changes. Voluntary feedback does not establish a representative sample, clinical effectiveness, speech accuracy or hospital acceptance.

维护者按可复现性、影响和涉及环境汇总，公开已知限制并对修正进行复测。自愿反馈不代表人群抽样，也不能直接证明临床效果、语音准确率或医院验收通过。
