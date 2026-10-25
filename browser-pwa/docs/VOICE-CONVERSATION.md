# 自然对话与 small talk / Clinical conversation and small talk

本轮新增于 **Web 0.6.15 UI r3 / Android 0.1.4-preview**。它改进转写后的整理与核对，不承诺自动判断闲聊的临床价值，也没有增加实时 ASR、说话人身份认证或离线识别引擎。

## 使用方式

1. **医生口述**：沿用明确标题分区，如“备忘：”“现病史：”。旧草稿缺少模式字段时仍按此模式处理。
2. **医患对话**：本地按换行分段，保留完整原文和人物标签；所有片段先放入“暂不纳入记录”。极少数完整、简短的问候可标为“疑似寒暄”，其余均提示核对语境或人物。单段未换行的对话不会被臆测成多个人的发言。超过 100 段时尾部合并保留，绝不丢弃。
3. 回看后按“移至待核对候选”，手动选择分区，必要时编辑，再勾选采用。移入候选不表示确认；编辑或改变分区后必须重新勾选。
4. 若在联网授权后启用文本模型，对话模式要求保留人物、否定、不确定性、时间、药物状态与条件性计划，并提供原文引用。模型未引用的文字也留在回看区；重复引用无法唯一定位时，不据此认定已覆盖全部内容。原文引用存在并不证明语义正确。
5. 原文、整理模式、目标记录、报告语言或录音来源变化后，旧候选失效。采用一批候选后，未采用的回看片段与完整原文继续保留；再次采用需重新生成候选。原始录音不会被裁剪、覆盖或删除。

## 需要特别核对的语境

| 对话线索 | 核对重点 |
| --- | --- |
| “女儿搬走了，现在独居”“负担不起交通费” | 社会支持、功能与就医条件，不能作为普通寒暄丢弃 |
| “我哥哥去年心梗” | 家属与患者、既往与当前事件应区分 |
| 医生谈自己的失眠 | 不可变成患者症状 |
| “如果明天还发热，可能考虑……” | 条件性计划不等于已执行的医嘱 |
| 否定、玩笑、反讽、多人插话、听不清及不明剂量 | 保留原文，回听并人工确认，不补全缺失事实 |

时间定位只使用识别服务返回且能与当前原文匹配的片段；没有可靠时间时回听整段。A/B 等标签不是经过验证的医生、患者或家属身份。

## 平台与隐私边界

- 浏览器/PWA 与 Android 复用同一套模式和人工核对流程，八种界面语言同步；界面翻译不改写患者原文。
- Android 预览版继续优先调用系统录音器并保留导入方式；不新增联网权限或云识别。可整理手动输入或粘贴的文本。浏览器端的在线 ASR/文本模型仍需原有配置、联网授权和提交确认。
- 提交完整录音或转写时，其中的寒暄也会发送给所选服务。未写入最终记录不代表未传输。没有新增静默过滤、自动外发或音频裁剪。
- 当前问候识别只是少量短语规则；不能代表八语言自然对话理解或临床准确率。未知表达一律保留待核对。医生对所有采用内容负责复核，工具不产生正式医嘱。
- 以虚构对话测试寒暄、社会支持、家族史、医生自述、假设、否定、噪声标记和角色不明，并检查八语言、脱机重载与保存失败。真实口音、方言、说话人分离、ASR 准确率、真机和临床适用性仍待反馈验证。

## English

Added in **Web 0.6.15 UI r3 / Android 0.1.4-preview**. This improves review of an existing transcript. It does not introduce real-time ASR, authenticated speaker identification, an offline speech engine, or validated assessment of clinical relevance.

- **Clinician dictation** keeps explicit-heading routing. Existing drafts without a mode retain this behavior.
- **Clinical conversation** separates local text at line breaks and holds every utterance for review. A small, exact phrase list can flag possible greetings; all other material remains context to review. Unlabelled speech is not assigned an invented speaker. Long inputs retain their tail in a combined excerpt.
- To use a held excerpt, move it to candidates, choose a destination, edit if needed, and explicitly check it. Moving it does not approve it. Editing or changing its destination clears its check.
- Optional online model processing requests preservation of the information subject, negation, uncertainty, timing, medication status and conditional plans. Exact source quotations are mandatory. Unquoted source ranges remain available for review, including potentially important context. Repeated quotations do not establish unique coverage. A matching quotation does not establish semantic accuracy.
- Changing the transcript, mode, destination, language or recording invalidates previous candidates. Applying a batch retains the full transcript and held excerpts. Regenerate candidates before further use. Original audio is never trimmed or deleted by this feature.
- Social support, living circumstances and barriers to care must not be dismissed as small talk. Family history is not the patient's own disease; clinician self-disclosure is not a patient symptom; a hypothetical plan is not a completed action. Questions, humor, overlapping speech and uncertain words or doses require review.
- Playback uses service-provided timestamps only when they match the unchanged source; otherwise play the whole recording. Speaker A/B labels are not authenticated identities.
- All eight interfaces share the workflow. Android remains offline with system-recorder/import support and no new network permission. Online ASR/model use in the browser requires existing configuration, connection authorization and submission confirmation. Sending a full recording or transcript sends its small talk too, even if omitted from the final note.
- Synthetic tests and desktop browser checks do not validate real ASR, accents, dialects, physical devices, native clinical-language quality or clinical effectiveness. Those remain future feedback items.
