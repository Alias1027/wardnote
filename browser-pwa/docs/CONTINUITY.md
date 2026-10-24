# Continuity aids / 连续查房辅助

WardNote 0.6.12 · 2026-10-18

本产品首先是可独立使用的便携式查房记录。完成首次离线资源准备后，文字记录、变化对照、SBAR 预览、人工修改、核对和本机备份不依赖 EMR/HIS、云端模型或互联网。医院接口、院内身份认证、外部识别及同步仅为可选扩展；其缺失不应被当作核心产品不成熟的依据。不同国家、语言和基础设施环境应能使用同一套核心记录流程。脱机模式不等于无需首次安装或资源准备，也不自动满足机构使用的安全要求。

WardNote is primarily an independently usable, portable ward-round worksheet. After initial offline preparation, text notes, comparisons, SBAR previews, manual editing, review and local backups do not require an EHR/HIS, cloud model or internet connection. Hospital interfaces, institutional authentication, external recognition and synchronization are optional extensions, not core maturity criteria. Initial installation/resource preparation and deployment-specific safeguards still apply.

## Changes since the previous round / 自上次查房以来的变化

- 在“每日查房”中按需展开；按记录日期、建立时间排序，同一天的前次查房也可以对照。
- 对比两份记录**当前保存的版本**，展示字段前后文字及评估与计划。它不是当时状态的历史快照或自动病情判定；回填或修订历史记录后，对照随之更新，必要时查看修改历史。
- 空白明确为“未录入”，不能据此认定正常、未变化或问题已解决；没有前次记录时不推算。
- 补充资料列表根据录入/更新时间筛选，从前次记录建立时间至当前时点；查看历史查房时，上限为该条记录的更新时间。它不是临床事件发生时间，也不是未读清单。检查的实际采样时间仍在来源内。
- 支持查看同一患者的原始来源、版本和更新时间；修改源记录仍走现有保存机制。

Expand the optional panel in Daily rounds. It compares the currently saved versions of consecutive notes, including same-day rounds. It does not reconstruct the historical state or infer clinical change. Blank fields remain explicitly unrecorded. Associated entries are filtered by entry/update timestamps, not clinical event times; the upper bound for a historical note is its saved update time. Source versions, update times and source contents remain available. Historical corrections may alter the comparison.

## Brief handoff preview / 简版交接预览

在“核对与交接”选择“生成交接预览”。SBAR 分区引用当前患者信息、最近一次初诊/背景、最近一次查房的已记录判断与计划，以及当前未完成待办的负责人、期限及下一步。不会从旧查房自动填补最近空白，也不推断诊断、危急程度或正常结果。独立检查表和备忘不会自动全量复制，交接前需核对是否存在遗漏的关键结果或备忘；可手动补充。原文较长时预览也会较长，可人工精简。

预览作为现有“阶段摘要”记录保存，保留生成语言、来源引用与时间。可编辑、查看历史、核对；修改会清除复核状态，新增/修改相关源记录或完成待办后旧预览需重新生成。重新生成产生一条新摘要，旧摘要及其编辑历史保留。来源变化时不允许将旧预览重新标为已核对或通过专用按钮复制。核对后才启用“复制已核对交接”；复制前再次检查最新源版本。此限制不阻止人工选中文字，不能视为访问控制。

In Review and handoff, choose Generate handoff preview. Local SBAR assembly quotes patient details, the latest initial/background entries, the latest daily assessment/plan, and open tasks with owner, due time and next action. It does not fill a blank current note from older rounds or infer diagnoses. The separate laboratory table and memos are not copied wholesale: review for relevant omissions and add them manually. Long source wording remains long until edited.

The preview uses existing summary storage, generated-label language, source references/times, revisions and review. Editing clears review. Changes or additions to relevant records, including completed tasks, invalidate the snapshot; regenerate to create a new draft while retaining old versions. The dedicated copy action requires review and rechecks current sources. Manual text selection remains possible. Neither review nor copying establishes formal sign-off, acceptance by the receiving team, or EHR entry. No model call or automatic transmission is made.

## What to borrow from comparable products / 同类产品功能取舍

| 功能 / Feature | 判断 / Decision | 理由 / Reason |
|---|---|---|
| 变化对照、SBAR、来源定位、核对 / Comparison, SBAR, provenance, review | 核心适用 / Core fit | 利用本机记录减轻重复抄写，维持独立性 / Reduces repeated work using local records |
| 便携备份、多语言、简洁导航 / Portable backup, languages, simple navigation | 核心优先 / Core priority | 适应不同基础设施 / Useful across infrastructure settings |
| 自定义短语与词汇提示 / Personal phrases and terminology cues | 按需小规模评估 / Evaluate selectively | 不能自动填正常、否定或剂量 / Must not autofill normal findings, negatives or doses |
| EMR/LIS、院内认证、跨设备同步 / EHR/LIS, institutional identity, device sync | 可选扩展 / Optional extension | 不可成为首次使用、核心读写或备份的前提 / Must not gate core use or backup |
| 厂商医疗语音能力 / Vendor medical speech services | 可替换适配器 / Replaceable adapter | 语音为辅助，质量与授权依实际服务验证 / Speech is optional; verify service quality and authorization |
| 医嘱、计费、审批、人员排班 / Orders, billing, approvals, staff scheduling | 不纳入 / Out of scope | 属于正式院内管理职责 / Belongs to institutional systems |

界面翻译和自动测试不等于母语临床审校、真实设备或医院验收；相关验证见 [后续计划](RELEASE-CHECKLIST.md)。

Translation and automated checks do not replace native clinical review, physical-device testing or hospital acceptance; see the [follow-up checklist](RELEASE-CHECKLIST.md).

## Bedside navigation and source follow-up / 床旁导航与来源跟进

0.6.11：患者页提供上一位、下一位及可搜索的在院患者列表，顺序与工作台床位排序一致，当前分区保留但不会带入上一患者的记录。保存失败时阻止切换；录音中须先结束并保存。已出院患者仍从患者管理查看，不进入在院切换队列。

“核对与交接”中的未完成事项为现有待办的折叠视图，包含负责人、期限、下一步及编辑入口。它不是另一份清单或团队平台；完成操作更新原事项并使旧 SBAR 预览需重新生成核对。查看回报不会自动标记已完成，保存失败会还原勾选状态。

来源预览显示版本、更新时间及适用的核对/完成状态，支持打开本患者的原始记录。SBAR 保存时的引用与当前来源继续区分；修订原始记录不会悄悄改写旧交接。临床文本不随界面语言切换而翻译。后续候选能力见 [路线记录](ROADMAP.md#selective-borrowing-deferred-directions--同类产品启发的后续方向)。

Version 0.6.11 adds previous/next inpatient navigation and a searchable list in the same bed order as the census. It preserves the selected section, not the previous patient's note. Failed saves block navigation, and recording must be ended and saved first. Discharged patients remain available through Patient management, outside the inpatient sequence.

The collapsed unfinished-task view in Review and handoff uses the existing tasks, including owner, due time, next action and editing. Completion updates the original task and invalidates the old SBAR preview; viewing a result does not complete it. Failed writes restore the checkbox. Source previews show version, update time and applicable review/completion state, with a link to the current patient's original record. Saved SBAR quotations remain distinct from current sources. No interface change translates authored clinical text. Conditional future features are documented in the [roadmap](ROADMAP.md).
