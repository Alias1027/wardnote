# 临床推理与持续追踪优化 / Reasoning and follow-up update

Web/PWA 0.6.17 UI r1 · Android 0.1.6-preview · 2026-11-06

本轮以 [v0.6.17-preview.1](https://github.com/Alias1027/wardnote/releases/tag/v0.6.17-preview.1) 整体预发布。0.6.16 UI r1／Android 0.1.5-preview 等历史附件和 V007 PDF 原件保持不变。此文说明工程行为，不宣称临床或教学效果已经得到验证。

This iteration is distributed as the [v0.6.17-preview.1](https://github.com/Alias1027/wardnote/releases/tag/v0.6.17-preview.1) combined pre-release. Historical assets, including 0.6.16 UI r1 / Android 0.1.5-preview, and original V007 PDFs remain unchanged. This document describes software behavior, not demonstrated clinical or educational benefit.

## 优化前后对照

| 方面 | 0.6.16 UI r1 | 0.6.17 UI r1 |
| --- | --- | --- |
| 检查时间 | 新建检查曾预填当天 08:00，可能被误当真实采样时间 | 不再预填；明确选择时间不详后可留空，单独显示，不纳入日期趋势；核实后再补齐 |
| 判断与结果 | 前后记录可比较，待办结果需另行查找 | 复用前次查房对照，显示此前计划、预期反应及手动关联的待办结果 |
| 来源关联 | 待办没有对应临床问题的明确引用 | 可选手动关联同一患者的问题；保存当时的来源版本与文字，变化或缺失时提示核对 |
| 四项速览 | 当前重点主要汇集计划与待办；可能选取更早的非空记录 | 纳入未决问题、下一复核和应变条件；最新记录为空时不拿旧记录补空 |
| 教学提示 | 已有评估、证据、计划、反思栏目 | 提示区分当时已知与后来获知、支持与反对证据、预期与实际结果，以及经验适用边界；默认收起 |

## 使用方式与边界

1. 检查时间依原报告填写。未知时间不是录入时间，也不是当天时间；未知时间记录不能标记为已完成原报告全面核对。新增检查应重新生成相关阶段摘要；既有摘要不会自动重写。新建表单目前支持完整时间或时间不详；若原报告仅有日期，可先选择时间不详并在来源／备注保留已知日期，不补造钟点。已有纯日期记录保持原精度。
2. 如需要追踪某个问题的行动结果，在待办中选择“关联临床问题”。任务结果仍由医生记录，不会自动写入当前评估，也不会把“任务完成”解释为疾病已经解决。
3. 来源关联保留关联时的原文。来源后来修改、排序调整或移除，需要重新核对；不会按问题名称自动寻找替代记录。不同患者之间不能互相关联。
4. 摘要仍为四项速览。生成和手动修改后仍需医生核对。核对确认的是记录内容，不代表诊断确证；旧摘要保留原文和生成语言。
5. 评估与计划及决策复盘复用原有字段。展开教学提示时显示简短指导；熟练使用者可保持收起，打印时可选择是否包含提示。

本轮没有新增自动诊断、强制鉴别诊断数量、诊疗评分或医院审批模块。既有记录不作批量改写，已记录时间也不自动纠正。加密备份格式沿用原机制；升级前仍建议保存并备份，完成录音后再更新。

## Before and after

| Area | 0.6.16 UI r1 | 0.6.17 UI r1 |
| --- | --- | --- |
| Examination times | New results defaulted to 08:00 on the current date | No inferred time; explicitly unknown times remain blank, separate from dated trends, until verified |
| Assessment and outcomes | Comparing notes and consulting task outcomes were separate steps | The existing previous-round panel also shows prior plans, expected responses and manually linked task outcomes |
| Provenance | Tasks had no explicit problem reference | Optional links to a problem in the same encounter retain the source version and text; changed or missing sources require review |
| Four-part brief | Focus mainly included plans and tasks; older nonempty records could be selected | Unresolved issues, next reassessment and contingency criteria are included; blank latest records are not filled from older ones |
| Teaching | Existing assessment, evidence, plan and reflection fields | Optional prompts distinguish contemporaneous evidence from hindsight, expectations from outcomes, and learning from overgeneralization |

## Use and limitations

Use the original report for sample times. An unknown sample time is neither the entry time nor today's date; leave it unverified until checked. Regenerate relevant stage summaries when new results arrive; saved summaries are never rewritten automatically. The new-result form currently accepts a full time or an explicitly unknown time. If the report gives only a date, select unknown time and preserve the known date in the source or notes rather than invent a clock time. Existing date-only records retain their original precision.

Link tasks manually when useful. Links retain a snapshot of the original problem, and changed, reordered or missing sources need review. They never match by title or cross patient boundaries. Completing a task does not establish resolution of a clinical problem, and its outcome is not automatically written into the current assessment.

The brief retains four sections and requires human review after generation or editing. Review confirms recorded content, not diagnostic certainty. Saved briefs retain their text and generation language. Teaching prompts are optional and use existing fields; they may also be included or omitted when printing.

No automated diagnoses, mandatory differential counts, clinical scores or institutional approval modules are added. Existing records and their dates are not batch-rewritten. Encrypted backup formats are retained. Save and back up before upgrading, and finish recordings before updating.

## 验证与后续 / Validation and follow-up

本轮检查结果见 [VALIDATION-RESULTS.json](VALIDATION-RESULTS.json)。自动检查采用虚构资料，包括时间校验、来源归属、备份恢复、脱机工作流、八语言、窄屏与 RTL 布局。真实 Android 设备、录音应用差异、低配置性能、母语临床译文和临床使用效果仍需后续反馈。

See [VALIDATION-RESULTS.json](VALIDATION-RESULTS.json) for this iteration's checks. Automated checks use synthetic data and cover time validation, source ownership, backup and restore, offline workflows, eight languages, narrow layouts and RTL. Physical Android devices, recorder-app differences, low-resource performance, native clinical language review and clinical outcomes remain to be evaluated.
