# V007 内容对齐 / V007 content alignment

Web 0.6.16 UI r1 / Android 0.1.5-preview · 2026-11-05

本轮依据 V007 中文、英文初诊、住院、续页与临床决策复盘模板进行核对。目标是临床信息和教学提示的对应，不要求电子界面逐页复制纸表。保留现有患者数据、字段名称、默认脱机模式及按患者持续管理的结构。

| 纸表内容 | App 对应位置及本轮调整 |
| --- | --- |
| 初诊关键检查结果 | 补齐采样日期、单位、来源、原报告核对；重要异常的通知、处理与复评；缺失资料的负责人与下一步 |
| 每日查房 | 生命体征、氧疗、出入量移至病程之后、数据趋势之前；安全复核不重复同一组提示 |
| 评估与计划 | 保留简洁标题，隐藏式提示包含支持／反对证据、不确定性、监测复评、应变预案及待办责任 |
| 出院计划、交接 | 补充患者理解、用药随访、出院后未完成事项的负责人／联系／时限，以及交接接收人／时间 |
| 住院背景更新 | 补充患者或照护者对事实、理解及更正意见的核对提示 |
| 决策复盘 | 四项折叠教学提示；可选复盘日期；旧记录不自动填入日期，学习内容继续排除在临床导出和交接之外 |
| 临床记录续页 | 保留可扩展的补充记录、任务和备忘；无需复制固定空白纸页 |
| 打印 | 默认当前记录；可选择附加住院背景和教学提示，打印前保存；包含简明参考框架、用途边界及作者说明 |

八种语言同步界面文案与提示，切换语言不翻译已录入的临床内容。旧 V006／V006b Word 文件只作历史参考；当前纸表为项目中的 V007 PDF 原件。已发布历史安装包及纸表原件不改写。

本轮增加针对内容、日期兼容、临床导出边界及打印选择的自动检查。计算机端的虚构资料检查不代表真机、母语临床审校或临床适用性验证。

## English

This revision aligns clinical coverage and teaching prompts with the Chinese and English V007 initial assessment, inpatient management, continuation and decision-reflection worksheets. It does not reproduce fixed paper pages on screen. Existing field identifiers, saved records, offline defaults and patient-centred follow-up remain compatible.

- Initial results: specimen date, units, provenance and original-report verification; notification, action and reassessment of important findings; ownership of missing or pending information.
- Daily review: vital signs, oxygen and fluid balance appear before trends; safety prompts avoid repeating them. Assessment and plan retains its short title and optional prompts for evidence, uncertainty, monitoring, contingency plans and responsibility.
- Discharge and handover: medication and follow-up understanding, ownership/contact/deadlines after discharge, and the receiving clinician and handover time.
- Background updates: patient/caregiver fact checks, understanding and corrections.
- Reflection: four optional teaching prompts and an optional review date. No dates are inferred for old entries; learning reflections remain excluded from clinical exports and handover summaries.
- Printing: save first, then print the current note with optional background and teaching prompts, plus concise source, scope and author notices. Continuation remains expandable electronic text.

All eight interfaces are updated while entered clinical text stays unchanged. V006/V006b Word files are historical references; V007 PDFs remain the current paper originals. Existing releases are preserved. Automated checks use synthetic records and do not establish device, native clinical-language or clinical validation.
