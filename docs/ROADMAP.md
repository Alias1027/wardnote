# Android 后续方向 / Android roadmap

Android **0.1.2-preview** · 2026-10-23

本轮聚焦独立、便携的脱机查房记录；原浏览器/PWA继续保留。不扩大为医院EMR、团队管理平台或正式医嘱系统。以下属于后续方向，**未因出现在文档中而成为当前可用功能**。

This phase focuses on independent, portable offline ward-round notes while preserving browser/PWA delivery. It does not expand into an institutional EMR, team-management platform or formal order system. Items below are future work, **not currently available capabilities**.

| 方向 / Direction | 实施前提 / Prerequisites |
| --- | --- |
| 明确授权后的跨设备同步 / Explicitly authorized cross-device sync | 设备与账号身份、个人／机构模式隔离、服务地址绑定、每次连接确认、可撤销授权与接收方配置；断网重试不可被视为再次同意上传。 / Account/device identities, mode isolation, endpoint binding, per-session consent and revocation. Network reconnection is not renewed upload consent. |
| 冲突与音频续传 / Conflicts and resumable audio | 记录版本与来源保留；冲突预览由用户选择，不能静默覆盖；音频默认不外传，分块校验、幂等重试和断点续传须可审计。 / Preserve revisions/provenance; review conflicts rather than silently overwrite. Exclude audio by default and validate chunked, idempotent resume. |
| 云端隐私模型 / Cloud privacy model | 明确服务端是否能看到明文，评估端到端加密、设备密钥撤销及恢复；不得将“加密传输”称为“服务端看不到数据”。 / Define server plaintext access; evaluate end-to-end encryption, key revocation and recovery. TLS alone is not end-to-end confidentiality. |
| 语音转写 / Transcription | 系统录音工具继续优先复用；本地 ASR 的模型体积、资源、语言和医学术语需独立评估。未来外部转写须单独授权，保留原文、来源与人工核对。 / Continue reusing existing recorders; independently evaluate local ASR resources/languages. External transcription needs separate consent, provenance and human review. |
| 院内接口 / Institutional integration | 作为可选适配，不成为日常记录的前提；账号、权限、正式签署和医嘱仍由院方系统负责。 / Optional adapters must not become prerequisites for note-taking; formal identity, permissions, signatures and orders remain institutional responsibilities. |
| 设备与易用性 / Device usability | 发布后收集低配置、弱网／无网、厂商录音、文件选择和八语使用反馈，再按证据确定改进。 / Use later feedback on low-resource devices, offline operation, OEM recorders, file pickers and languages. |

本阶段不开展 iOS 或其他苹果全系产品适配。真实设备、临床人员及医院环境验证保留为后续反馈工作；本轮不实际公开发布或自动招募使用者。

iOS and other Apple products are outside this phase. Physical-device, clinician and hospital-environment validation remain later feedback activities. This development round does not publicly publish the project or automatically recruit users.
