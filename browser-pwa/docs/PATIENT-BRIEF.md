# Patient brief / 患者摘要

The patient banner contains an optional four-item brief: **reason for admission, key background, latest status and current priorities**. It can be collapsed. Resuscitation status, allergies and precautions stay in the separate safety strip. Memos below the brief are independently collapsible and link to the existing memo/audio records.

点击“生成摘要”后，应用在本机提取当前住院的初诊、背景、最近有内容的查房记录及尚未完成的待办。不会调用模型、上传资料、推断诊断或改变病情等级。未填写内容保持空白。长文字可展开全文；四项内容可由医生精简或补充。

The brief is a local extraction, not an automatic clinical synthesis. It retains negations, uncertainty, doses and source wording. Conflicting entries may coexist and require clinician judgment. The newest meaningful initial/daily record is selected by its record date; an older vital sign is not silently copied into an otherwise newer daily record. Source-record update time is explicitly labeled and is **not the time a symptom or measurement occurred**; those times must remain in the original text.

## Review and manual editing

- Generation creates a **pending-review** brief. Use **Edit summary** to revise any of the four fields, save, then use **Clinician review** to explicitly confirm the content. The workspace clinician name and review time are recorded. This is not a hospital electronic signature.
- Manual changes affect the brief only. Source notes, tasks, memos and audio remain unchanged. Each saved edit clears the brief's review flag. The extraction quotes remain available as provenance; added or rewritten text is marked as manually edited and must be checked by the clinician.
- The banner shows generation time, the latest update time among cited source records, review status and any previous review time. A source update or new selected note/task makes the brief stale. Previously generated text remains available, but verification of a stale brief is rejected in both local and server modes.
- Regeneration explicitly confirms replacement. It resets review and stores the previous brief in encrypted revision history. It does not merge or silently discard manual edits without that confirmation.
- Concurrent changes are checked again when saving or verifying. A stale page must reload/resolve the conflict. Failed saves retain the editing dialog and entered text.

## Sources and memos

“查看来源”按四项列出生成时引用的文字、记录日期、来源版本及当时的核对状态；可以打开当前原始记录。更新后的原记录与旧引用可能不同，两者通过版本号区分。无来源的人工补充不会被标为已有病历引用。

As of 0.6.5, the memo fold contains the complete former floating-panel tools: all text memos with create/edit, all recordings, import, playback, review and retention flags, important excerpts, transcription actions, reviewed insertion and download. It uses the same records without copying or migrating them. The floating memo entry and limited three-item index are removed. The course timeline source links expand and focus the corresponding memo here. Collapse pauses playback; unrelated automatic saves refresh the summary without rebuilding the memo player. Summary review does not verify a memo or audio recording. Memos are not automatically inserted into the four summary fields.

## Storage, language and scope

The separate `brief` record uses existing encrypted local/server persistence and optimistic versions. It is included in explicit encounter JSON export, backups and selected-record synchronization; it is not automatically uploaded. Its sources are immutable through ordinary edits. The brief is **not** a stage summary and never satisfies an audio-deletion prerequisite.

All eight interface languages share the same four fields and actions. Switching language changes labels only, preserving extracted and manually edited text. Arabic and Urdu follow the existing right-to-left layout. This feature requires no new model credentials or hospital integration.

This is a compact clinical work aid. It does not verify clinical truth, replace original records, generate orders or provide hospital identity certification. Native clinical translation review and real-world usability validation remain pending.

## 完整备忘区域（0.6.5）

摘要下方的备忘已承接原浮窗的全部文字和录音操作，默认收起，按患者保留本次会话的展开状态。可以新建/编辑文字备忘、导入和回听录音、标记复核、保留重要片段、下载原声、查看转写和核对后填入记录。语音识别仍须配置服务并主动授权。病程来源链接直接定位到此处；摘要与备忘核对状态继续独立。收起备忘暂停回听；其他字段自动保存不重建音频播放器。

## 语音备忘 / Voice memos（0.6.6）

备忘区的“开始录音”直接进入当前患者的录音确认，无需先建查房记录。录音结束后回到备忘区，原声加密保留。默认脱机可录音和回听；转文字须先明确授权联网，并配置允许使用的语音识别服务，再主动点击“识别此录音”。不会因录音结束而自动上传或调用模型。

识别后点击“转为文字备忘”，核对并可修改文字，再勾选核对后保存。未配置识别时可回听后手动输入文字。文字备忘独立保存来源录音标识、版本、原转写快照及核对时间；“查看来源”定位当前原声。后续编辑清除原核对标记，保留来源快照。文字核对不自动标记原声为已复核，不授权清理原录音，也不会自动填入查房记录或患者摘要。

Start recording opens the current patient’s recording consent dialog without requiring a clinical note. Audio stays encrypted locally by default. Transcription requires connection authorization, a configured speech service and an explicit action. Create text memo opens an editable review form; reviewed text is saved separately with recording/version/transcript provenance. Later edits clear the memo review marker. Source links locate the current recording. This does not authorize audio deletion or verify the original recording, and does not add offline ASR.

## 语音分区与录音确认 / Dictation routing (0.6.7)

“录音安排补充说明”现为选填。医生必须勾选确认当前患者和本次录音安排；未填写说明时只保存该确认文字及录音记录时间，不补造患者授权方式、参与者或口头确认详情。浏览器麦克风许可独立于此确认，拒绝许可时给出明确提示。

使用语音浮窗或备忘区录音均进入同一流程。配置并授权语音识别服务后，主动识别录音；转写不会因录音结束而自动上传。如果当前语音草稿为空，识别后本地生成未勾选的分区候选；已有草稿保留，使用“核对并填入记录”或“使用转写”后重新归类。导入录音、手动粘贴转写与直接录音共用同一候选和核对流程。

可口述“备忘：明天核对。现病史：咳嗽两天，无胸痛。计划：剂量待核实。”。本地按明确标题分段，支持模板的八语言字段标题及常用中英文简称；可用“住院背景/相关既往病史：…”等前缀明确目标。任意口音、无标点或含糊表达不保证正确识别；无明确去向的文字留待手动选择。不会根据关键词推断诊断、患者严重程度、药物剂量或正式医嘱。

覆盖初诊、背景、每日查房字段和评估/计划、备忘、待办/待回报、检查字段、决策复盘。病程记录页引用已保存记录。患者摘要仍按原有来源生成/编辑；医生核对、患者参与记录和其他正式确认状态不能由口述自动签认。选择具体病历时优先使用该份记录；自动分区选择本次住院最近初诊、当日查房及现有背景，无对应记录则在核对后建立。候选去向显示记录日期，原有字段通过追加保留。

检查与化验须明确提供检验项目、检验结果、单位、采样时间、报告来源；例如分别口述这些标题。时间建议写成 YYYY-MM-DDTHH:mm，不能确定时保留候选并补全。原报告核对状态仍为待核对。若一批选中候选中存在缺项，整批不保存，可补全或取消选择该组后处理其他内容。不会自行把未知单位写成“无”或以当前时间代替采样时间。

候选默认不选，修改文字或目标后取消原勾选；核对后一次性追加并保存原文依据、识别来源、版本、处理时间和记录者。来源或目标变化要求重新生成，重复提交不会重复创建。复盘仍不进入临床导出。原始音频及其保留规则不变。

Recording details are optional, but patient/recording confirmation remains mandatory. Browser microphone permission is separate. Explicit headings suggest destinations across initial history, background, daily notes and assessment/plan, memos, tasks, pending results, complete laboratory fields and learning reflections. Automatic suggestions are unchecked and do not overwrite an existing voice draft. Review and edit each candidate before appending; unclear text requires a chosen destination. Original quotes/audio remain traceable. Missing laboratory metadata or stale source/target versions block the whole selected batch. Routing does not infer diagnoses, doses, severity, consent details or formal signatures, and does not add offline ASR or a Dragon integration.
