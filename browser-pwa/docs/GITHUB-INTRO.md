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

## Complete approved introduction / 完整项目简介

2026-10-25 · UI r2

## 项目简介

WardNote 是一款便携式临床记录与工作备忘工具，旨在为初诊评估、住院查房及患者的持续追踪提供便利。本项目尤其关注临床实习生、住院医师及其他低年资医生的学习与工作需要，支持临床思维和患者管理能力的培养，并可辅助临床决策的复盘与学习。

本项目强调独立使用、文字优先与默认脱机。完成相应平台的安装及脱机准备后，核心记录功能无需接入医院电子病历系统（EMR/HIS）、云端模型或持续联网。结合多语言界面、本机加密保存及可迁移备份，本项目旨在降低使用与部署门槛，兼顾不同国家和地区，尤其是网络不稳定、医疗信息化基础薄弱及医疗资源有限环境的使用需求。具体设备兼容性、低配置运行表现及实际临床适用性仍待进一步验证。

本项目在设计过程中，参考了以下制度、标准与指南中的相关原则：中国《医疗质量安全核心制度要点》（十八项核心制度）；美国 CMS 医院参与条件（CoPs）、Joint Commission 国家患者安全目标（NPSGs）及其自 2026 年起适用于医院和关键可及医院认证项目的后续框架——国家绩效目标（NPGs），以及 ACGME 住院医师培训通用要求（Common Program Requirements, CPR）；英国 NICE CG50、NHS England 发布的 NatSSIPs 及 CPOC 发布的修订版 NatSSIPs 2；德国联邦联合委员会（G-BA）的质量管理指令（QM-RL）。

## 特别鸣谢

衷心感谢我目前的住院医师规范化培训单位——陕西省人民医院，以及我的导师 Dr. 雷琦（MD, PhD）对本项目的支持。

感谢 Dr. June Chunqiu Hou（MD）、Dr. Andrew Fagelman（MD）和 Dr. Laszlo Mechtler（MD）等师长在我赴美临床学习期间给予的悉心指导。

同时，感谢 Dr. Charles Jiang（MD）的专栏文章为本项目临床决策复盘学习页的设计提供启发。

## 用途边界与版权

本项目用于辅助临床记录、工作备忘与教学，不能替代医院或机构的正式病历、医嘱、管理系统及其管理职责，也不能替代医务人员的专业判断。相关诊疗、签署、审批及制度执行，仍须遵循当地要求与所在机构的正式流程。

© Junhui Liu M.D. 版权所有。 使用及再分发须遵循项目随附的许可条款。

反馈与支持： [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)

---

## About the Project

WardNote is a portable clinical note-taking and work memo tool designed to support initial assessment, inpatient ward rounds, and longitudinal patient follow-up. With particular attention to the learning and practical needs of medical students on clinical rotations, residents, and other early-career physicians, it aims to support the development of clinical reasoning and patient management skills, as well as reflection on and learning from clinical decisions.

The project prioritizes independent use, text-based documentation, and offline operation by default. Once installation and offline preparation for the relevant platform are complete, core note-taking functions do not require integration with hospital electronic medical record or hospital information systems (EMR/HIS), cloud models, or a continuous internet connection. Through multilingual interfaces, encrypted local storage, and portable backups, WardNote aims to reduce barriers to use and deployment across countries and regions, with particular consideration for settings with unreliable connectivity, limited health information infrastructure, or constrained healthcare resources. Device compatibility, performance on devices with limited computing resources, and suitability for clinical use require further evaluation.

Its design draws on relevant principles from the following policies, standards, and guidelines: China’s Key Provisions of the Core Systems for Medical Quality and Safety (the 18 core systems); the US Centers for Medicare & Medicaid Services (CMS) Conditions of Participation for Hospitals (CoPs), Joint Commission National Patient Safety Goals (NPSGs) and their successor framework for the Hospital and Critical Access Hospital accreditation programs from 2026—the National Performance Goals (NPGs)—and the ACGME Common Program Requirements for Residency; the UK’s NICE guideline CG50, the original National Safety Standards for Invasive Procedures (NatSSIPs) published by NHS England, and the revised NatSSIPs 2 published by the Centre for Perioperative Care (CPOC); and Germany’s Federal Joint Committee (G-BA) Quality Management Directive (Qualitätsmanagement-Richtlinie, QM-RL).

## Acknowledgments

I am grateful to Shaanxi Provincial People’s Hospital, where I am currently undertaking residency training, and to my mentor, Dr. Qi Lei (MD, PhD), for their support of this project.

I sincerely thank Dr. June Chunqiu Hou (MD), Dr. Andrew Fagelman (MD), and Dr. Laszlo Mechtler (MD) for their thoughtful teaching and guidance during my clinical experiences in the United States.

The design of the clinical decision reflection worksheet was also inspired by the published columns of Dr. Charles Jiang (MD).

## Scope and Copyright

WardNote supports clinical note-taking, work memos, and education. It does not replace official medical records, medical orders, institutional management systems or responsibilities, or the professional judgment of healthcare practitioners. Clinical care, signatures, approvals, and implementation of institutional policies must continue to follow applicable local requirements and formal institutional procedures.

© Junhui Liu M.D. All rights reserved. Use and redistribution are subject to the accompanying project license.

Feedback and support: [junhuiliu1025@gmail.com](mailto:junhuiliu1025@gmail.com)
