# Clinical workflow boundaries / 临床工作边界 — v0.6.15

WardNote is a portable ward-round worksheet and work aide. It helps a clinician record observations, reasoning, follow-up and handoff information. Institutional systems and authorized staff retain responsibility for formal orders, approvals, authentication and clinical governance.

## 身份、权限与审计：机构职责，不属于产品管理模块

**人员身份核验与使用授权、访问权限分配/撤销、操作归属与审计监督，由部署医院或机构负责。本项目不建设人员目录、角色权限管理、排班审批、机构审计平台或正式电子签章，也不以补齐这些模块为开发目标。** WardNote 的定位仍是便携查房记录与工作备忘。

机构可以使用其认可的终端、网络、身份系统和运行管理流程承接上述职责，但须核实这些措施实际覆盖本工具的访问、数据库、原始音频、导出和备份；仅有医院 EMR 或仅把应用放入内网，并不自动覆盖这些路径。本机支持按账号独立加密保存；服务端仍按个人／机构模式划分工作区。同名账号不自动建立跨设备身份，账号名和记录者标识不能确认某位人员的真实身份；本地操作事件和修改历史仅作辅助线索，不能单独承担机构级人员归责与审计要求。本项目保留已有密码、锁定、加密、来源版本和操作记录，不将其描述为医院级身份权限系统。

可根据院方规则使用化名、研究代号或最少必要的就诊标识，省略工作备忘不需要的身份信息。需要重新关联患者时，对照关系由机构在获准位置管理；床旁核对仍按本院患者识别流程进行，不能只凭床号或化名判断身份。本次升级不自动替换既有记录中的姓名，也不改写或剪除原始录音。

**化名化（pseudonymization）不等于完成去标识化（de-identification）。** 日期、住院标识、自由文本中的姓名/事件、录音对话及其他可关联信息仍可能识别患者。机构应按实际资料和用途决定处理方式；不能仅因替换姓名，就认定资料不再受隐私要求约束或可以提交外部模型。HHS 的去标识化指南区分专家判定与安全港两种方法，适用于特定条件；本工具不宣称自动实现其中任何一种。

**Identity verification and user authorization, access provisioning/revocation, attribution of actions and audit oversight belong to the deploying hospital or institution. They are outside WardNote's product-management scope.** The project does not add an identity directory, role-administration console, institutional audit platform or formal signature workflow. The institution must assess how its approved environment covers access to this app, its database, recordings, exports and backups. Existing EHR controls or an internal network alone do not establish that coverage. Local accounts have separate encrypted device stores; server workspaces remain mode-specific. Matching account names do not establish cross-device identity, and account names or recorder labels do not authenticate individuals. Local event history supports troubleshooting and review, not institutional attribution on its own. Existing password, lock, encryption and source-version safeguards remain.

Institutions may use pseudonyms or the minimum necessary encounter identifiers, managing any re-identification mapping through approved channels and retaining their bedside identification procedure. Pseudonymization alone is not de-identification: dates, encounter identifiers, free text and recordings can retain identifying information. No automatic rewriting of clinical text or audio is performed. External services still require approval for the actual data submitted. This worksheet does not certify either HIPAA de-identification method or an institution's security compliance.

## 三种职责

1. **手动记录**：记录实际观察、联系人、已经沟通的内容、采取的措施、复评时间及正式资料的来源。现有自由文本、待办和交接栏即可承载；不要求另建管理模块。
2. **医院正式记录系统**：医院 EMR/EHR 及相关检验、护理、药学、输血系统承载经授权的正式记录、医嘱、签署、报告和归档。是否具备某项功能及是否有效运行，要由医院实际核验，不能从“已有 EMR”直接推定。
3. **院级制度及人员执行**：负责医师、监督、会诊、护理、值班交接、抢救、审批和质量改进等责任由医院指定人员及正式流程落实；可使用医院认可的电子或纸质文件。

手动填写可以覆盖相关信息，不能单独完成制度执行。十八项核心制度及其国外对应机制的正式责任均属于医院及授权人员；没有一个“模板覆盖百分比”可以证明这些制度已经落实。

## 对照与分工

| 制度分组 | 本产品可手动记录的内容 | 正式责任与记录由何处承担 |
| --- | --- | --- |
| 首诊负责、三级查房、会诊 | 病史、评估、联络人、会诊意见和落实事项 | 医院负责医师安排、监督及会诊流程；正式记录、时限和签署 |
| 分级护理、急危重患者抢救 | 实际生命体征、意识、氧疗、观察频率、应变预案及已实施措施 | 护理评估/医嘱、监护、快速响应和抢救体系；不由 App 病情标签替代 |
| 值班和交接班 | 当前问题、待办、负责人、期限、升级条件及接收确认 | 排班、交接责任、接班人实际确认及医院正式交接制度 |
| 查对、危急值报告 | 患者标识、原报告来源、通知对象/时间、行动和复评时间 | 床旁查对、危急值即时通知和接收/处置追踪；App 待办不能成为唯一报警渠道 |
| 病历管理、信息安全 | 工作摘要、来源索引、修正经过 | 正式病历、签章、法定归档、身份权限、访问审计和安全管理；这些控制无法靠自由文本实现 |
| 抗菌药物分级管理、临床用血审核 | 用药必要性/疗效复评、相关审批结论、输血后观察摘要 | 授权处方和药学管理；用血申请、批准、配血、床旁核对及反应处理流程 |
| 疑难病例讨论、死亡病例讨论 | 讨论问题、意见摘要、后续行动及个人学习复盘 | 正式病例讨论、死亡审查及质量改进；个人复盘不替代上述会议和记录 |
| 术前讨论、手术安全核查、手术分级、新技术准入 | 与查房相关的结论、注意事项和正式文件位置 | 术前评估/同意、手术核查、人员资质和技术准入审批；不在本产品建设范围 |

## 本产品的具体做法

- 身份信息和联系人可以在现有患者、背景、交接及待办栏填写。遵循本院患者识别办法，床位只用于定位；不新增人员权限或身份认证管理模块。
- 每日查房的可展开提示包括意识状态、按本院要求的监测频率及升级条件。仅记录实际观察和既定计划，不自动计算分数、生成医嘱或定义院级病重/病危标准。
- 危急结果可在现有结果或待办详情中按“通知对象与时间 → 已采取行动 → 复评时间”记录。待办继续使用“待跟进／已完成”；原报告已核对不代表已经完成通知或临床处置。
- 复苏医嘱及照护限制以医院有效记录核实；界面标签仅帮助定位信息。
- 本产品内容与医院正式资料不一致时，应核查来源并按院内流程纠正。避免为同一正式审批或医嘱维护两套互相竞争的状态。
- 语音/模型输出仍需人工核对，不自动填入正式病历或驱动医院审批。
- 新阶段摘要分开显示选定日期范围内的资料与“当前未完成事项快照”（注明 UTC 时间）。快照保留所有当前未完成待办/待回报，包括范围外建立的事项、负责人、期限及下一步/联系方式。新增未完成事项或来源变化后需重新生成并核对；既有摘要不自动改写。快照不是对历史某日待办状态的重建。
- 填写出院日期且仍有未完成事项时，提示注明后续负责人、联系方式及期限；可以继续保存，不自动完成任务。出院患者的未完成事项继续留在原有队列。

## 如何与医院流程互补

本产品可作为医院质量安全和培训体系中的工作辅助环节：医生在床旁记录事实和判断，按本院流程完成联系、医嘱或正式记录，再通过已有待办、交接及复评栏追踪执行结果。它有助于支持相关制度落实；仅把 App 与 EMR 一起使用，不能证明所有制度已满足。

| 工作环节 | 本产品提供的辅助 | 医院保留的执行与核实 |
| --- | --- | --- |
| 查房、会诊、异常变化 | 纵向病程、问题评估、意见摘要及后续事项 | 负责人员实际查房/会诊、及时处置、上级监督及正式记录 |
| 危急结果、病情恶化 | 记录来源、通知对象与时间、行动、升级条件和复评 | 依院规即时通知、确认接收、开立/执行医嘱及抢救响应；不能等待 App 提示 |
| 交接与连续照护 | 当前问题、未完成任务、联系人和应变计划 | 接班人员确认接管并有机会询问；医院正式交接责任及记录 |
| 住院医师培养 | 展示推理、替代解释和复盘，供带教讨论 | 带教者实际监督、反馈和能力评价；不能以填表代替培训考核 |
| 用药、输血、手术及技术准入 | 记录与本次查房有关的结论和需跟进事项 | 处方资质、审核批准、床旁核查、手术安全流程及机构准入 |
| 质量与信息管理 | 在获准范围内提供经过核对的工作摘要 | 正式病历、签署/归档、权限审计、质控分析和安全事件管理 |

院内应用应先明确三个衔接问题：哪些内容必须进入正式系统；谁接收并负责执行；在哪份正式记录中确认完成。原始事实、时间、来源和执行结果可在现有自由文本中注明，不因此增加强制表格、审批模块或平行状态系统。用户只勾选“已完成”不能替代相应的实际行动和院内证据。

当前版本的医院系统接入尚未经过真实院内验证。需回填正式系统的内容仍由有权限的人员按院规人工核对和录入；JSON/打印导出不等于已完成医院接收、签署或归档。工作备忘也可能受本院记录管理与隐私要求约束，不能因命名为“备忘”就自行豁免。

十八项核心制度可以按上表划分协作职责，但本项目尚未核查任何一家医院的实际制度执行，不能给出“18/18 已完成”的结论。美国 CMS 的医院参与条件、Joint Commission 的机构认证要求和 ACGME 的培训要求各有适用对象；除了床旁记录，还涉及治理、人员、设施、感染预防及培训管理等更广范围。本项目仅支持其中与查房、交接、跟进和学习相关的部分，不能成为整套标准的合规证明。

## English summary

Free text can capture contacts, consultation conclusions, notification details, actions and reassessment plans. The hospital's authorized systems and procedures own orders, signatures, nursing assignments, emergency response, blood-product checks, clinical privileges and quality governance. An EMR's presence alone does not establish that these processes are configured or followed.

Daily prompts include consciousness, locally specified monitoring frequency and escalation criteria. Critical-result follow-up uses the existing result/task text: who was notified and when, action taken, and reassessment time. Tasks retain two states. These are documentation aids, not automated alerts, formal clinical orders or a substitute for hospital critical-result communication.

WardNote does not seek to implement all institutional processes. Additional work should reduce bedside recording effort or support continuity without duplicating formal institutional authority. This document is a functional scope assessment, not a claim of regulatory compliance or clinical certification.

Complementarity requires an explicit handoff into the hospital workflow: identify what belongs in the formal system, who must receive and act on it, and where completion is verified. Existing free text can capture these references without new approval modules. A completed task is not proof of an order, notification, sign-off or completed clinical action. Hospital integration is not yet validated; authorized clinicians must review and enter required content through approved channels. Notes called work aides may still be subject to institutional records and privacy policies.

CMS hospital participation, Joint Commission accreditation and ACGME training requirements apply to different organizations and processes. WardNote supports selected bedside, continuity and teaching activities; it does not certify all 18 Chinese core systems or all US institutional/training requirements. No hospital-specific compliance audit has been performed.

## Reference frameworks

The frameworks below have different legal and institutional scopes; the UK and Germany are examples, not a single European rulebook.

- [China: explanation of the 18 core quality and safety systems](https://www.nhc.gov.cn/zwgk/jdjd/201804/5dfb30387c74412194c7f05b878d4f87.shtml)
- [US: CMS hospital Conditions of Participation](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482)
- [US: Joint Commission — Right Patient, Right Care](https://www.jointcommission.org/en-us/standards/national-performance-goals/right-patient-right-care)
- [US: ACGME Common Program Requirements](https://www.acgme.org/programs-and-institutions/programs/common-program-requirements/)
- [US HHS: methods and limits of de-identification](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html)
- [US HHS: Security Rule summary and organizational responsibilities](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [England: NICE CG50 — recognising and responding to deterioration](https://www.nice.org.uk/guidance/CG50/chapter/recommendations)
- [England: NHS invasive-procedure safety standards](https://www.england.nhs.uk/patient-safety/natssips/)
- [Germany: G-BA quality-management directive](https://www.g-ba.de/richtlinien/87/)


## Named design references / 可用于项目简介的参考来源

Checked 2026-10-16. These are selected public reference frameworks, not endorsements, certification, a complete compliance mapping, or evidence that a named hospital has adopted WardNote. They are not all the same type of instrument. The European examples documented here are the UK and Germany; no unified European hospital rulebook is claimed.

核对日期：2026-10-16。下列文件用于理解床旁记录、沟通、持续照护及医院职责边界，并不表示获得相关机构认可、完成全面合规评估或获某家医院采用。项目简介宜写“参考相关原则”，不写“全面符合中美欧制度”。现有项目文档可追溯的欧洲制度示例是英国和德国，不应补写未经核实的法国、北欧或具体医院名称。

| 地区 / Region | 发布或维护机构 / Body | 名称与官方来源 / Official title and source | 与本项目的关系 / Use and boundary |
| --- | --- | --- | --- |
| 中国 / China | 国家卫生健康委员会 / National Health Commission | [《关于印发医疗质量安全核心制度要点的通知》及《医疗质量安全核心制度要点》](https://www.nhc.gov.cn/yzygj/c100068/201804/42ab2552298047679cd6ec733f233862.shtml)，国卫医发〔2018〕8号，2018-04-18；另见上列官方解读 | 参考查房、交接、查对、危急结果及病历记录等原则；手术、用血、审批、抢救组织等正式制度仍由院方执行。 / Selected ward-round, handoff, checking, critical-result and documentation principles; institutional execution remains external. |
| 美国 / US | Centers for Medicare & Medicaid Services (CMS) | [Conditions of Participation for Hospitals，42 CFR Part 482](https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-482)（医院参与条件） | 联邦医院参与条件，涵盖医院治理和服务等；并非某家医院的内部模板。 / Federal participation conditions, not a hospital-specific note template. |
| 美国 / US | Joint Commission | [National Performance Goal #1: Right Patient, Right Care](https://www.jointcommission.org/en-us/standards/national-performance-goals/right-patient-right-care)（国家绩效目标第1项：正确的患者、正确的照护） | 参考患者核对、交接、危急结果沟通和病情变化识别等；本项目并未获得 Joint Commission 认证。 / Selected patient identification, handoff and deterioration principles; no accreditation claimed. |
| 美国 / US | Accreditation Council for Graduate Medical Education (ACGME) | [Common Program Requirements (Residency), including FAQs](https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/cprresidency_2026.pdf)（住院医师培训通用项目要求；当前官方入口列明2026-07-01生效文件） | 培训项目要求，支持沟通、监督、交接和反思学习的设计讨论；不能将模板使用等同培训达标。 / Residency-program requirements; template use does not establish training compliance. |
| 英国 / UK | National Institute for Health and Care Excellence (NICE) | [CG50: Acutely ill adults in hospital: recognising and responding to deterioration](https://www.nice.org.uk/guidance/CG50/chapter/recommendations)（住院急性病成人患者：病情恶化的识别与响应） | 参考生命体征复核和升级响应；不能自动诊断病情或替代院方恶化响应系统。 / Monitoring and escalation reference, not an automated deterioration system. |
| 英国 / UK | NHS England（原版）；Centre for Perioperative Care, CPOC（第二版） | [National Safety Standards for Invasive Procedures (NatSSIPs)](https://www.england.nhs.uk/patient-safety/natssips/)；[NatSSIPs 2](https://cpoc.org.uk/natssips-2)，2023 | 围操作团队核查和安全沟通的比较参考；本项目没有替代手术安全核查表。 / Procedural safety comparison; WardNote does not replace a surgical checklist. |
| 德国 / Germany | Gemeinsamer Bundesausschuss (G-BA，联邦联合委员会) | [Qualitätsmanagement-Richtlinie (QM-RL)](https://www.g-ba.de/richtlinien/87/)（机构内部质量管理指令） | 质量管理框架和责任边界的比较参考；不能据此声称实现德国医院全部质量管理要求。 / Quality-management context, not a complete implementation. |

The original project reference list above is retained. This table clarifies titles, publishers and the distinction between US regulation, accreditation and training requirements. The China primary notice and CPOC second-edition page supplement the earlier interpretation/NHS links. Some government pages restrict automated full-page retrieval; the NHC notice title, document number and date were also checked against the official indexed text. Standards change: deploying institutions must select applicable editions and local rules.

本轮另参考 [AHRQ TeamSTEPPS：I-PASS](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/ipass.html) 中的交接、待办负责人和时间、应变计划及接收方确认。它是交接工具参考，不是额外的一套医院强制制度。上列 HHS 去标识化及 Security Rule 文件属于数据管理边界参考，不作为床旁模板已合规的证明。

## Independent core / 独立核心

Independent portable notes are the primary product. Hospital interfaces and institutional identity are optional deployment extensions; formal clinical records, orders and governance remain with the institution. Local SBAR review is not recipient acceptance or formal handoff completion.

核心为独立便携查房记录；医院接口和机构身份服务只作为可选部署扩展。正式病历、医嘱与管理职责仍属院方。SBAR 的本机核对不等于接收者确认或正式交接完成。[连续追踪说明](CONTINUITY.md)。
