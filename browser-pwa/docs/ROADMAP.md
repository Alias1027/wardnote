# Roadmap

Release follow-up / 发布后续验证：[readiness checklist](RELEASE-CHECKLIST.md).

## Product boundary

Keep WardNote a portable ward-round worksheet: easy text entry, continuity for one patient and follow-up of unfinished work. Recording is optional assistance. New work must reduce daily effort or preserve continuity without adding mandatory fields or separate management modules. Full EMR replacement, order entry, billing and scheduling are outside scope.

## Current: 0.6.15 local evaluation

- Program update discovery and safe application: automatic foreground checks, manual checks at login/Settings, an explicit prompt and saved-record/recording/operation guards. Current test results remain scoped to [validation evidence](VALIDATION.md); physical installed-PWA behavior still needs device evaluation.

- One patient workspace: clinical notes, review/handoff and optional reflection.
- Compact daily entry; previous-note comparison, task tracking and cross-patient review queues.
- Preserve existing records, source versions and review behavior; teaching notes are excluded from clinical export.

- Eight interface languages, RTL layout, independent report language and source-preserving review. Current release: **v0.6.15**.

## Next after authorized publication: voluntary usability feedback / 获准发布后的自愿体验

The locally executable upgrade, rollback, backup/recovery and documentation checks are prioritized in 0.6.15. Physical-device, first-time-user, clinician and institution-dependent checks are scheduled for voluntary feedback after the owner separately authorizes public pre-release, not performed in this preparation. The current source-available license remains unchanged; institutional/commercial trials still need written permission. Use fictional cases and never upload patient data or backups as feedback. See the [short feedback form](EVALUATION.md).

0.6.15 优先完成本机可执行的升级、回退、备份恢复及文档检查。首次使用、真实设备、临床人员和医院环境验证，转为作者另行授权公开预发布后邀请用户自愿体验并综合反馈。本轮不实际发布；现有源码可见许可不变，机构及商业试用仍须书面授权。体验使用虚构病例，反馈不提交患者数据或备份，见[简版反馈字段](EVALUATION.md)。

- Obtain native-speaking clinician review of translation drafts; track corrections in the translation review table.
- Observe fictional-case ward rounds on desktop and physical phones: entry time, navigation, readability, note retrieval and unfinished-task follow-up.
- Extend synthetic saving/recovery tests to physical devices and actual ward-network interruptions; keep field guidance optional.
- Test phone HTTPS and foreground audio only as a secondary workflow, including longer sessions and upload recovery.
- Validate the optional configured speech/text adapters with approved services; native vendor speech protocols and clinical accuracy remain deployment work.

### Infrastructure fit / 不同基础设施条件

Text-first, encrypted device-local storage and default offline operation allow core use without an EHR/HIS, cloud model or persistent internet connection after initial resource preparation. They reduce infrastructure dependencies but do not establish universal suitability. Initial setup, a compatible browser with required storage/cryptography/locking capabilities, sufficient memory/storage and reliable enough power remain necessary. Windows launch needs Node.js 24+; phone preparation requires reachable trusted HTTPS and a supported browser/PWA path. Eight UI languages do not establish eight-language ASR, native clinical translation approval or adaptation to every country's rules.

文字优先、本机加密保存及默认脱机，使首次资源准备完成后的核心记录不依赖 EMR/HIS、云模型或持续互联网，有助于降低基础设施门槛，但不表示已普遍适用。首次准备、支持存储/加密/锁机制的浏览器、足够内存与空间及供电仍有要求；Windows 启动需 Node.js 24+，手机首次准备需可访问的可信 HTTPS 及支持的浏览器/PWA 路径。八种界面语言不等于八语种识别、母语临床审校或各国制度适配均已完成。

After publication, include low-resource devices, intermittent networks, shared-terminal sign-out and offline backup recovery in voluntary feedback. Document unsupported environments rather than expanding the worksheet into an infrastructure-management platform.

发布后的反馈纳入低资源设备、弱网、共享终端注销及脱机备份恢复实测，明确不支持或未经验证的环境，不扩展为基础设施管理平台。

## Future portable-terminal adaptation / 未来便携终端适配

**Decision recorded 2026-10-15: documentation only; implementation deferred.** These device-independent directions do not establish PDA compatibility or a delivery commitment. Keep the existing PWA and the portable, patient-centered ward-round workflow; voice remains optional and model candidates require clinician review before insertion.

**2026-10-15 决定：仅补充未来开发方向，本轮暂不实施。** 以下规划不依赖具体 PDA 型号，不代表当前已兼容院内 PDA 或承诺交付时间。延续 PWA、单个患者持续管理及便携查房备忘定位；语音仍为辅助，识别候选必须经医生核对后填入。

| Direction / 方向 | Future work / 后续考虑 |
| --- | --- |
| Small-screen use / 小屏操作 | Build on the current single-column layout and bottom panels: larger primary touch targets, one-handed navigation, keyboard/viewport clearance, readable multilingual and RTL content. / 在现有单列和底部面板基础上改善常用按钮点击区、单手导航、软键盘避让及多语言与从右向左布局的可读性。 |
| Saving on unstable networks / 弱网保存 | Build on autosave, retry and version checks: distinguish unsaved from server-confirmed content, validate reconnection and Wi-Fi roaming, prevent duplicate writes and silent overwrites. / 在自动保存、重试及版本校验基础上区分待保存与服务器确认状态，验证重连及网络漫游，防止重复写入和静默覆盖。 |
| Patient continuity / 患者连续管理 | Keep patient context visible; verify draft, recording and candidate binding through patient switches, navigation and session recovery. / 保持患者上下文清晰，核验切换患者、页面导航和会话恢复时草稿、录音及候选内容的归属。 |
| Recording interruptions / 录音中断 | Make microphone loss, background transitions and upload failures visible; distinguish saved audio from unsent segments. Do not promise continuous lock-screen recording. / 明确提示麦克风中断、后台切换和上传失败，区分已保存与未上传片段，不承诺锁屏连续录音。 |
| Institutional deployment / 院内部署 | Verify reachable trusted HTTPS, browser capabilities, permission handling and session lock/exit on shared terminals. Institutional identity, permissions, device policy and audit governance remain institution-owned; verify their integration actually covers this app. / 核验可访问的可信 HTTPS、浏览器能力、权限提示及共用终端的锁定与退出；身份、权限、设备策略和审计管理仍由院方负责，并验证其衔接实际覆盖本工具。 |
| Acceptance criteria / 通用验收 | Define synthetic-case checks for a complete ward round, small screens/keyboards, all eight UI languages including RTL, reconnects, interruptions, patient switching and shared-terminal handover. Later test on selected hardware before claiming support. / 用虚构病例覆盖完整查房流程、小屏与键盘、八种界面语言及 RTL、断网重连、中断、患者切换和终端交接；以后选定硬件实测后再声明支持。 |

### Generic offline support delivered in 0.6.0

Device-local encrypted text/audio, reopen recovery, backup/restore, default offline operation, personal/institution separation, explicit password connection authorization and manual scoped sync are implemented. This does not copy the full server database automatically or certify PDA hardware. See [offline and account details](OFFLINE-AND-ACCOUNTS.md).

### Future work: recognition and additional authorization methods

- Offline ASR: assess model size, distribution, device memory, energy use, clinical vocabulary and language-specific accuracy. No offline recognizer ships in 0.6.0.
- WebAuthn/passkeys: platform biometric verification with challenge validation, enrolment, revocation and recovery. No biometric material is to leave the device authenticator.
- QR authorization: short-lived, one-time sessions through an institution-approved identity provider; account and destination binding and replay resistance are required.
- Real mobile/PWA cold-start and foreground recording validation, full-shift resource measurements, and institution endpoint acceptance tests. Local segmented backup is addressed in 0.6.14; this does not validate device capacity or continuous long recording.


## Before a supervised institutional pilot

The institution must supply or approve access control, recording authorization, retention, backups and any required adapters. These deployment prerequisites are not a plan to build hospital-wide administration into the worksheet.

Individual identity authorization, access provisioning/revocation and attributable audit oversight belong to the deploying institution and remain outside this product's administration scope. Retain current local safeguards and verify external controls cover the app's actual access and data paths. Pseudonymization is a data-minimization option, not a substitute for de-identification assessment or the institution's responsibilities. See [clinical boundaries](CLINICAL-SCOPE.md).

Offline clinical editing is provided in 0.6.0. Native background capture and broad EHR interoperability remain unsupported.


## 0.6.2 decisions and remaining work

- Delivered: optional pre-round information review in the existing daily note, task outcome/completion metadata, exact-source candidate evidence, optional adapter timestamp support and source replay. Originals remain encrypted and retained; “audio never persists” is not adopted.
- Prefer brief clinician dictation or patient-scoped conversation recording according to need. Compare existing recognizers before considering fine-tuning. Local VAD/denoising and speaker separation remain future adapter work; retain original timing and unknown speaker roles.
- Passkeys are not a front-end unlock flag. Existing password-wrapped data keys require a reviewed key wrapping/recovery design before passwordless unlock; investigate WebAuthn PRF/device key stores where supported. Maintain password recovery alternatives only if cryptographically designed, not plaintext password storage.
- Institutional QR authorization awaits an approved identity service and test environment. Bind one-time, expiring requests to account, mode, session and destination. A minimal authorization-only network transition must precede broader approved connections; it must not upload clinical data.
- Institutional FHIR/EHR integration remains a separately authorized adapter, with patient matching, supported resource/version checks, scope controls and hospital signing. No autonomous order entry, coding or contraindication recommendation is added.

## Proposed cross-device accounts / 跨设备账号方案（2026-10-18）

This is a design assessment, not an implemented capability in 0.6.15. The current username directory is browser-local and server workspaces remain mode-specific. Identical names on two devices do not establish the same server identity.

- Establish one stable server account ID within an institution/mode; bind each device explicitly. Enforce ownership on every server record, audio, history, export and sync endpoint; never trust a client-supplied username as authorization.
- Retain encrypted per-account device stores and default offline operation at startup. A new device requires a separately confirmed minimal online sign-in/enrolment before it can recognize an existing server account; afterwards it can unlock its downloaded local copy offline. Offline revocation cannot be instantaneous.
- Keep login and connection permission separate. Each device authorizes its own connection session; connectivity restoration and another device granting permission must not enable uploads. Authorizing sync does not authorize ASR/model submission or external sending.
- First delivery should use an explicit sync action, selected patient scope, text first and optional audio. Show the target account/server, last successful sync, pending local changes and conflicts. Preserve both versions and require a decision when desktop and phone edit the same record; do not silently apply last-write-wins.
- Use a reachable institution-approved HTTPS endpoint. Phone localhost refers to the phone, not the desktop server. No address, account service or public exposure has been provisioned by this follow-up.
- Accept only after two independent browser/device stores demonstrate account identity binding, wrong-account rejection, cross-account direct endpoint denial, offline reopen, independent consent/revocation, conflict handling and audio ownership checks; then validate physical phones and institutional deployment.

建议保留轻量页面，只增加“同步此账号资料”入口及同步状态。首次在新设备使用同一账号，需要明确同意联网核验及绑定；日后可脱机解锁已下载资料。跨设备同步服务器必须逐账号隔离记录、音频、版本和导出，不能仅依赖界面隐藏。两端修改冲突由用户核对；联网和同步均不自动授权外部模型调用。该方案不扩展为医院EMR、人员管理或医嘱系统。

## Independence first / 独立性优先

核心使用不以院内 EMR/HIS、云模型、统一身份服务或跨设备同步为前提。上述能力保留为可选、可替换适配方向。当前版本已提供本地变化对照及人工核对的 SBAR；后续优先验证便携输入、离线保存/恢复、多语言和连续追踪，不扩展正式医嘱、计费、审批及医院人员管理。

Core use must not depend on hospital EHR/HIS, cloud models, identity providers or cross-device synchronization. These remain optional, replaceable integration paths. Local comparison and reviewed SBAR are now available; prioritize portable entry, offline saving/recovery, languages and continuity. [Details](CONTINUITY.md).

## Selective borrowing: deferred directions / 同类产品启发的后续方向

**2026-10-18：本节仅记录未来方向，不表示已实现、已接通厂商服务或承诺实施。** 0.6.11 完善了患者快速查阅、交接待办及来源核查。继续使用本机存储、现有记录和人工核对；未选入本轮的建议按下表评估，不作为首次使用门槛。

**Recorded 2026-10-18; future work only, with no vendor connection or delivery commitment implied.** Version 0.6.11 improved patient navigation, existing-task handoff and source inspection. Remaining ideas are conditional candidates, not prerequisites for starting or using WardNote.

| Direction / 方向 | Priority and conditions / 优先级与适用条件 | Boundary and acceptance / 边界与验收 |
|---|---|---|
| Personal phrases / 个人常用短语（前次 Nabla 等产品讨论的启发） | Small optional usability trial after observation / 观察实际使用后小范围评估 | Explicit insertion, editable and patient-scoped; no automatic negatives, normal findings, medication doses or carried-forward diagnoses. Must demonstrably reduce typing without obscuring patient-specific reasoning. / 主动选择后填入并允许修改，不自动生成阴性、正常、剂量或沿用旧诊断，需验证确实减少输入负担。 |
| Medical speech adapters / 医疗语音适配（前次 Dragon 等产品讨论的启发） | Optional and replaceable; validate approved services first / 可选可替换，先验证获准服务 | Separate authorization for external processing; preserve original audio and exact transcript evidence, reviewed candidates only. Verify medical terms, mixed languages, accents, noise, corrections and failure recovery; never assume vendor/Epic compatibility. / 外部处理独立授权，保留原声与准确转写证据，候选经核对才填入；验证术语、中英混说、口音、噪声及失败恢复，不据此声称厂商或 Epic 接口兼容。 |
| Local speech processing / 本地语音增强与脱机识别 | Research after device/storage measurements / 设备与存储测量后再研究 | Compare local VAD, denoising and optional speaker separation before fine-tuning. Preserve originals and timing; uncertain speaker roles remain unknown. Assess model footprint, energy use and language-specific accuracy; text editing must work without the model. / 先评估 VAD、降噪及按需说话人分离，再考虑微调；保留原声和时间，对不确定说话人不强行归属；评估模型体积、能耗和各语言准确度，文字功能不依赖模型。 |
| Optional EHR/LIS adapters / 可选 EMR/HIS/LIS 接口（包括此前卫宁等讨论） | Only on an authorized deployment request / 仅在获授权的部署需求下实施 | Start with explicit read/import and source preview: patient/encounter matching, original time/unit/source, conflict review and mapping of the agreed data standard. No automatic overwrite, formal order/signature or hospital administration. / 先做明确选择的读取/导入及来源预览，核对患者与住院标识、原始时间/单位/来源、冲突及约定标准映射；不自动覆盖、下正式医嘱、签署或接管院内管理。 |
| Institutional identity and device sync / 院内身份及跨设备同步 | Optional deployment paths described above / 按前文方案单独部署验证 | Core offline reading, editing and backup remain independently usable. Validate actual account isolation, device-specific permission and conflict handling before claiming support. / 核心脱机读写及备份持续独立可用，逐账号隔离、逐设备授权与冲突处理实测后才声明支持。 |

Vendor names identify the earlier comparison context only; this roadmap is not a current feature audit, partnership or endorsement. Selection should depend on observed ward-round usefulness, added screen/maintenance burden, local availability, permission and independent operation. Full order entry, billing, approval, workforce scheduling and a team-management platform remain outside scope rather than a future backlog.

厂商名称仅用于对应前次讨论，不构成其当前功能核查、合作关系或背书。是否实施以查房实际收益、界面与维护负担、本地可用性、授权条件和独立使用为判断标准。完整医嘱、计费、审批、排班和团队管理平台不纳入未来待开发清单。

## Implemented engineering baseline / 已实现工程基础（0.6.15）

本轮完成本机能力与完整离线缓存检查、容量未知/预警/临界录音保护、备份状态与迁移向导、地区显示/A4与Letter，以及含官方运行时的Windows x64离线包。核心仍是独立脱机文字记录；没有增加EMR依赖或自动云上传。实现及测试范围见[有限基础设施说明](INFRASTRUCTURE.md)。

After separately authorized publication, collect voluntary fictional-case feedback on low-memory devices, interrupted power/connectivity, font readability, installed PWAs, backup recovery and clinical workflow. Use measured results before optimizing large-record memory, streaming playback, audio compression or model sizes. Do not infer low-end suitability, listening quality or clinical effectiveness from simulated browser checks. Offline speech recognition, optional institution adapters and other previous roadmap items remain optional future work.

真实低配内存/耗电、20分钟与整班录音、音质压缩、手机锁屏、字体排版及临床可用性均待发布后反馈。反馈不得包含患者数据或真实音频；先修复资料保存和可复现操作问题，再根据共性需求决定后续开发，不为覆盖所有地区扩建成EMR。

## 0.6.15 deployment follow-up

Physical Android/iPhone browser and installed-PWA workflows, launcher usability with clinicians, hospital-owned HTTPS certificates and networks, constrained hardware and clinical language review remain post-publication voluntary evaluation items. The local wizard and synthetic checks do not establish production deployment readiness.
