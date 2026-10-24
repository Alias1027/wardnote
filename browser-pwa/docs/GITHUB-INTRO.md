# WardNote · 循记临床

## GitHub About · 中文

轻量化、多语言查房记录与单患者持续追踪 PWA。支持初诊、每日查房、待办、来源核对及可选语音辅助；以简洁记录和人工复核为核心。

## GitHub About · English

A lightweight, multilingual PWA for ward-round notes and patient follow-up, with source-linked review, task tracking and optional voice assistance.

## README 简介 · 中文

**WardNote（循记临床）是一款面向住院医师与临床带教的源码可见查房记录工具。** 项目从纸质初诊和住院管理模板出发，将病史采集、每日查房、问题评估、检查趋势和未完成事项组织在同一患者工作区，帮助使用者衔接前次记录与后续计划。

默认脱机，支持本机加密记录与录音、重启解锁恢复和手动选择性同步。登录页支持账号＋密码，个人／机构模式内各账号独立保存，注销后切换，每次联网独立密码授权；授权接收端默认待配置。使用说明见[脱机与账号](OFFLINE-AND-ACCOUNTS.md)。

文字记录是主要工作方式；备忘完整列于患者摘要下方，语音和待办通过可收起的浮窗使用。转写归类和模型整理结果须经人工核对后追加，阶段摘要保留来源与版本，界面语言切换不会改写临床原文。

- **连续记录：** 初诊与背景、每日查房、病程记录、检查与化验。
- **思考与跟进：** 判断依据、替代解释、主要计划、升级条件、待办与可选决策复盘。
- **多语言界面：** 中、英、法、西、俄、阿拉伯、印地和乌尔都语，支持阿拉伯语／乌尔都语从右向左布局。
- **便捷访问：** Windows x64 离线便携包包含已核验 Node 运行时，解压即可启动；轻量源码包需 Node.js 24+。浏览器直接使用，提供 PWA 入口与随包离线说明。手机仍需可信 HTTPS 首次准备，真机安装及独立 PWA 模式待验证。见[八语言开始使用](GETTING-STARTED.md)。
- **更新可控：** 自动与手动检查同源程序文件；有新版先提示，保存成功并结束录音与未完成操作后再切换，不借更新开启资料同步。
- **不同基础设施条件：** 本机设备/脱机自检、录音容量保护、分卷备份与核验状态、手动迁移提示及地区显示/打印设置；不依赖 EMR 或持续网络，不自动同步或改写原文。见[适用边界](INFRASTRUCTURE.md)。
- **可选接口：** 可配置语音与文本模型服务，输出作为待核对候选；接口能力与识别准确率分别验证。

当前为 **v0.6.15 预发布版**，适合使用虚构病例进行许可范围内的流程评估与源码协作。新增译文待母语临床人员复核；医院部署、真实语音识别准确率和教育效果仍需验证。产品范围保持在便携查房记录与持续追踪，不扩展为完整 EMR。

本版在安全更新与分卷加密备份/核验基础上补充不同基础设施条件下的使用支持，保留旧版备份恢复及数据保护边界；实际演练范围见[验证报告](VALIDATION.md)。真实设备和用户体验验证计划在获准发布后，以虚构病例自愿反馈推进，本轮不实际发布。

机构身份授权、访问控制和审计管理由部署医院/机构承接，不新增相应管理模块。化名和最少必要标识可减少身份暴露，但不能仅据此认定完成去标识化。

采用自定义个人非商业源码可见许可。**机构及商业用途须事先取得 Junhui Liu M.D. 的书面授权**；联系 [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com) 或发布后的官方仓库。既有旧许可权利保留。欢迎许可范围内的反馈与贡献，外部贡献纳入前需明确授权。详见[许可政策](../LICENSES/README.md)。

## README introduction · English

**WardNote is a source-available ward-round documentation tool for resident physicians and clinical educators.** Built from structured initial-history and inpatient-management worksheets, it brings patient history, daily reviews, problem-based assessment, result trends and unfinished tasks into one patient workspace, connecting previous observations with follow-up plans.

Offline by default, with encrypted device records/audio, reopen recovery and manual selective sync. Personal and institutional modes are selected at sign-in; changing mode requires sign-out, and each connection needs separate password authorization. Event recipients are unconfigured by default.

Text entry is the primary workflow. Complete memo tools sit below the patient brief; Voice and Tasks use collapsible floating panels. Transcript classification and model-assisted drafts require human review before insertion. Summaries retain source versions, and interface changes never rewrite clinical source text.

- **Continuity:** initial history and background, daily review, clinical course, and tests/results.
- **Reasoning and follow-up:** evidence, alternatives, primary plans, escalation conditions, tasks and optional decision reflection.
- **Eight interface languages:** Chinese, English, French, Spanish, Russian, Arabic, Hindi and Urdu, with right-to-left Arabic/Urdu layouts.
- **Easy access:** the separate Windows x64 offline package includes a verified Node runtime; extract and launch. The small source package requires Node.js 24+. Direct browser access, a PWA entry point and offline instructions are included. Phones still need trusted HTTPS for initial preparation; physical-device installation and standalone PWA validation remain pending. See [getting started in eight languages](GETTING-STARTED.md).
- **Controlled updates:** automatic and manual checks request same-origin program files; an update is offered before switching, with successful saving and completed recording/operations required. Updating does not enable data sync.
- **Infrastructure choices:** local device/offline checks, recording-capacity protection, multipart backup and verification status, manual-migration guidance and regional display/print preferences. No EHR or continuous network is required; data do not synchronize automatically and source text stays unchanged. See [scope and limits](INFRASTRUCTURE.md).
- **Optional integrations:** configurable speech and text-model services produce reviewable candidates; adapter availability does not establish recognition accuracy.

The current **v0.6.15 pre-release** is intended for synthetic-case workflow evaluation and source collaboration within the license terms. New translations await native clinical review. Hospital deployment, real speech accuracy and educational outcomes require further validation. The product scope remains portable ward-round notes and patient follow-up rather than a full EMR.

This release builds on safe updates and encrypted segmented backup/verification with support for differing infrastructure conditions, retaining legacy restore and data-preservation boundaries; see the [actual rehearsal scope](VALIDATION.md). Physical-device and user-experience checks are planned as voluntary synthetic-case feedback after authorized publication. No publication occurs in this preparation.

The deploying institution owns individual identity authorization, access control and audit governance; these are outside the product's administration scope. Pseudonyms and minimum necessary identifiers can reduce exposure but do not alone establish de-identification.

A custom personal noncommercial source-available license applies. **Institutional and commercial uses require prior written permission from Junhui Liu M.D.** Contact [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com) or the official repository once published. Earlier granted rights remain unaffected. Feedback and contributions within the permitted scope are welcome; contribution rights must be agreed before inclusion. See the [licensing policy](../LICENSES/README.md).

## Suggested repository topics

`ward-rounds` · `clinical-documentation` · `patient-follow-up` · `medical-education` · `pwa` · `multilingual` · `self-hosted` · `nodejs`

Use the short descriptions in the About field and choose the appropriate introduction for the README. Do not add CI-passing, clinical-validation or compliance badges without corresponding evidence. See [validation](VALIDATION.md), [localization](LOCALIZATION.md) and [release preparation](RELEASING.md).


## 参考来源、用途与版权 · Reference sources, purpose and copyright

本工具参考相关框架中的部分原则，用于辅助初诊评估和住院患者管理，并支持临床思维与患者管理能力的培养和教学；不能替代医院／机构的正式病历、医嘱、管理系统或管理职责。

[中国国家卫生健康委员会：医疗质量安全核心制度要点（十八项核心制度）](https://www.nhc.gov.cn/zwgk/jdjd/201804/5dfb30387c74412194c7f05b878d4f87.shtml)；[美国 CMS：医院参与条件](https://www.cms.gov/medicare/health-safety-standards/conditions-coverage-participation/hospitals)；[美国 Joint Commission：国家患者安全目标／国家绩效目标](https://www.jointcommission.org/en-us/standards/national-performance-goals)；[美国 ACGME：住院医师培训通用项目要求](https://www.acgme.org/programs-and-institutions/programs/common-program-requirements/)；[英国 NICE：住院急性病成人患者病情恶化的识别与响应](https://www.nice.org.uk/guidance/CG50/chapter/recommendations)；[英国 NHS England：侵入性操作国家安全标准（原版）](https://www.england.nhs.uk/patient-safety/natssips/)；[英国 CPOC：侵入性操作国家安全标准（第二版）](https://www.cpoc.org.uk/guidelines-and-resources/guidelines/national-safety-standards-invasive-procedures-natssips)；[德国 G-BA：质量管理指令](https://www.g-ba.de/richtlinien/87/)。

版本说明：Joint Commission 医院及关键准入医院项目的 NPSG 章节自2026年1月1日起由 NPG 取代；NHS England 于2015年发布 NatSSIPs，CPOC 于2023年发布 NatSSIPs 2。 参考这些框架不代表获得相关机构认可、认证或满足全部要求。

© Junhui Liu M.D.

版权署名不改变现有许可：个人非商业使用依项目许可；机构及商业用途须事先取得作者书面授权。既有合法授权及第三方权利保留。

Drawing on selected principles from the referenced frameworks, this tool supports initial assessment, inpatient care, and the learning and teaching of clinical reasoning and patient management. It does not replace official hospital or institutional records, orders, management systems or governance responsibilities.

[China’s National Health Commission: 18 core medical quality and safety systems](https://www.nhc.gov.cn/zwgk/jdjd/201804/5dfb30387c74412194c7f05b878d4f87.shtml); [US CMS: Conditions of Participation for Hospitals](https://www.cms.gov/medicare/health-safety-standards/conditions-coverage-participation/hospitals); [US Joint Commission: National Patient Safety Goals / National Performance Goals](https://www.jointcommission.org/en-us/standards/national-performance-goals); [US ACGME: Common Program Requirements for Residency](https://www.acgme.org/programs-and-institutions/programs/common-program-requirements/); [UK NICE: Acutely ill adults in hospital — recognising and responding to deterioration](https://www.nice.org.uk/guidance/CG50/chapter/recommendations); [UK NHS England: National Safety Standards for Invasive Procedures (original edition)](https://www.england.nhs.uk/patient-safety/natssips/); [UK CPOC: National Safety Standards for Invasive Procedures (second edition)](https://www.cpoc.org.uk/guidelines-and-resources/guidelines/national-safety-standards-invasive-procedures-natssips); [Germany’s G-BA: Quality Management Directive](https://www.g-ba.de/richtlinien/87/).

Edition note: the NPG chapter replaced NPSGs for Joint Commission hospital and critical access hospital programs on 1 January 2026. NHS England published NatSSIPs in 2015; CPOC published NatSSIPs 2 in 2023. Referencing these frameworks does not imply institutional endorsement, accreditation or compliance with all requirements.

© Junhui Liu M.D.

Copyright attribution does not change the existing license: personal noncommercial use is subject to the project license; institutional and commercial uses require the author’s prior written permission. Earlier lawful grants and third-party rights remain unaffected.

[八语言一致声明 / Eight-language notice](PROJECT-NOTICE.md) · [详细职责范围 / Detailed clinical scope](CLINICAL-SCOPE.md)

独立使用优先、外部连接可选；本地变化对照与经人工核对的 SBAR 交接预览减轻重复记录。

Independent use first, optional integrations: local record comparison and clinician-reviewed SBAR previews reduce repeated documentation.
