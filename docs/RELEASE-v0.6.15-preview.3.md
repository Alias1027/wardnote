# v0.6.15-preview.3 · 自然对话整理 / Conversation review

2026-10-26 · Web **0.6.15 UI r3** · Android **0.1.4-preview**, versionCode **5**.

## 太长不看

在原有便携式查房记录上增加“医生口述／医患对话”两种整理模式。疑似寒暄、人物或语境不明的原文留在回看区，不直接填表。社会支持、家族史和条件性计划等可能有临床意义的信息仍由医生核对后选用。八语言界面同步；完整原声、转写、加密保存与备份保留。

**本地模式是保守分段工具，不是已经验证的闲聊过滤器。** 可选文本模型未引用的原文仍可回看。Android 继续支持系统录音和导入，不新增联网权限，也不包含 ASR 或云同步。浏览器提交完整音频或原文给在线服务时，其中的闲聊同样会发送。

## TL;DR

WardNote adds **clinician dictation / clinical conversation** modes to its portable ward-round workflow. Possible greetings and uncertain context are held for review, not inserted directly. Clinicians can recover relevant information about social support, family history or conditional plans, choose its destination and explicitly approve it. All eight interfaces are aligned; original audio, transcripts, encrypted storage and backups remain available.

**Local routing is conservative segmentation, not a validated small-talk filter.** Source text not quoted by an optional model remains visible. Android still uses system recording/import and adds no network permission, ASR or cloud sync. Sending full audio or text to an online service also sends its small talk.

## 更新内容 / Changes

- 模式与报告语言分别保存；旧草稿默认医生口述。 / Mode is independent of output language; existing drafts default to dictation.
- 采用回看内容需先移入候选、选择分区并勾选；修改文字或分区后重新核对。 / Held content needs promotion, a destination and an explicit check; editing clears approval.
- 模式、原文、来源或目标变化使旧候选失效；采用后剩余回看片段不丢失。 / Changed inputs invalidate candidates; held excerpts survive application of another batch.
- 原文与录音可定位；无法确定时间时回听整段，不猜测说话人身份。 / Quotes and recording playback remain available; missing timing falls back to the whole recording, without guessing speaker identities.
- 不修改 V007 原件、历史安装包、数据加密或机构管理边界。 / Original V007 files, historical installers, encryption and institutional boundaries are preserved.

## 下载与更新 / Downloads and updating

只需下载对应平台的一个包；开发者使用联合源码包中的 `browser-pwa/` 获取主项目源码。所有四个程序／源码包的内容、签名和版本保持不变。

Choose one package for your platform. Developers can find the main-project source under `browser-pwa/` in the combined source archive. The four deliverables retain their original contents, signatures and versions.

| 用途 / Use | 下载 / Download |
| --- | --- |
| Windows x64，一键启动 / One-click startup | [Windows ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.3/wardnote-0.6.15-ui-r3-portable-win-x64.zip) |
| Android，首次脱机使用 / Offline first launch | [Android APK](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.3/wardnote-android-0.1.4-preview.apk) |
| 浏览器／PWA，可信HTTPS部署 / Trusted-HTTPS deployment | [PWA ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.3/wardnote-0.6.15-ui-r3-static-pwa.zip) |
| 完整项目源码 / Combined project source | [Source ZIP](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.3/wardnote-0.6.15-ui-r3-android-0.1.4-preview-source.zip) |
| 上述四项的统一校验 / Checksums for all four | [SHA256SUMS.txt](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.3/SHA256SUMS.txt) |

**2026-10-26附件整理：** 已移除独立主项目源码ZIP及5个单独校验文件，统一校验表对应上方四项。现在共5个上传附件，加上GitHub自动生成的2种源码归档，页面共7项。发布标签仍固定于 `041186a71ca905731252a36e902c724e74e2490a`；此次仅调整下载清单与线上说明。归档内文档保留原发布快照，当前下载以本表为准。

**Asset cleanup, 26 October 2026:** The redundant standalone main-source ZIP and five individual checksum files have been removed. One checksum list covers the four deliverables above. Five uploaded assets plus GitHub’s two automatic source archives make seven entries. The release tag remains at `041186a71ca905731252a36e902c724e74e2490a`; this is a download-list and documentation change only. Documentation inside archives retains its original snapshot; use this table for current downloads.

未变更的V007 PDF仍使用[原件下载](https://github.com/Alias1027/wardnote/releases/download/v0.6.15-preview.2/wardnote-v007-pdf-originals-r1.zip)。 / Unchanged V007 PDFs remain available from that original download.

更新前结束录音、保存记录并验证独立加密备份。Android 应覆盖安装同签名 APK，不先卸载或清除资料；浏览器/PWA 沿用提示和保存后更新流程；Windows 请按既有更新及资料迁移说明使用原数据位置。新的文件夹/地址不会自动继承浏览器账号资料。

Finish recording, save work and verify an independent encrypted backup first. Update Android in place with the same-signature APK; do not uninstall or clear data. Follow browser/PWA save-and-update prompts. Follow the existing Windows update/data-location guide; a different folder or browser origin does not automatically transfer account data.

## 验证范围 / Validation scope

- 本地主项目自动测试 **176/176**；Android 核心检查 **20/20**、桌面桥接模拟 **18** 项、升级模拟 **3** 项通过。 / Main core tests: **176/176**; Android core: **20/20**, desktop bridge: **18**, upgrade simulation: **3**.
- 新增虚构自然对话测试覆盖问候、社会支持、亲属病史、医生自述、否定、不确定性、假设、多人/噪声标记、原文遗漏和误填阻断；八语言 UI、脱机重载、录音来源、备份及更新回归另附交付记录。 / New synthetic cases cover those contexts and review safeguards; UI, offline, evidence, backup and update regressions are recorded separately.
- APK **59** 个网页资源与源码一致；版本号递增、签名身份不变，无新增 Android 权限。 / All **59** bundled web resources match source; versionCode increases, signing identity is preserved, and no Android permissions are requested.
- 深层 Windows 测试目录中的浏览器缓存初始化失败，经字节相同的短路径副本复测通过；未放宽产品安全检查。 / A deep Windows test-path cache-initialization failure was reproduced and avoided using a byte-identical short-path copy; product safeguards were not relaxed.
- GitHub 托管检查状态以该标签关联的 Actions 为准。模拟模型测试不代表外部模型、ASR、方言、真实环境噪声、真机或临床验证。低配置、母语临床审校与临床适用性仍留待反馈。 / Consult this tag's Actions for hosted status. Mock-model tests do not validate external models, ASR, dialects, real noise, physical devices, clinical language or effectiveness.

源码可见许可保持不变；所有机构及商业用途须事先书面授权。反馈请勿提交患者信息、真实录音、备份、私钥或密码。 / The source-available license is unchanged; all institutional and commercial use needs prior written authorization. Do not submit patient data, real recordings, backups, private keys or passwords in feedback.

[流程与限制 / Workflow and limitations](../browser-pwa/docs/VOICE-CONVERSATION.md) · [反馈 / Feedback](https://github.com/Alias1027/wardnote/issues/new/choose)
