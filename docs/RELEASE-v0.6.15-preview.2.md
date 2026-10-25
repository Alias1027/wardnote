# v0.6.15-preview.2 · 统一预发布 / Aligned pre-release

2026-10-25 · Main project **0.6.15 UI r2** · Android **0.1.3-preview**, versionCode **4** · **V007 original PDFs / 原件**.

## 本次内容

- Windows一键启动包、静态浏览器/PWA包、主项目源码及整体源码与本次标签对齐；八语言简介和帮助包含在UI r2／Android 0.1.3-preview中。
- Android沿用之前已核验的本地0.1.3-preview APK及原应用签名；本次不改变原生代码、联网权限或记录格式。包身份验证不等同真机安装或升级验证。
- 新增[8份V007中英文PDF原件](../pdf-templates/v007/README.md)，共12页；同时提供独立ZIP及逐份仓库下载。用户明确取消证书方案，不创建PDF签名证书、不添加签名、加密或打印限制。
- 公开PDF可被编辑、转写或重建，技术手段不能完全阻止这些行为。作者选择保留实用性，使用官方来源、版本、版权/许可及SHA-256比对支持原件核对。这不否认签名验证来源和完整性的价值，也不改变许可条件；SHA-256本身不提供作者身份认证。
- 原两条Release、16项附件、标签、C盘模板、D盘电子模板、现有数据与签名材料均保留。PDF原件不重排、不添加表单字段；V007纸表与App运行版本分别编号。

## Included

- Windows portable, static browser/PWA, main-source and whole-project source packages are aligned to this tag. UI r2 and Android 0.1.3-preview include the eight-language introduction/help update.
- Android reuses the verified local 0.1.3-preview APK and existing signing identity. Native code, network permissions and record formats are unchanged. Package checks do not prove installation or upgrade behavior on a physical device.
- [Eight original V007 Chinese/English PDFs](../pdf-templates/v007/README.en.md), 12 pages total, are provided individually in the repository and in a standalone ZIP. At the owner's request, no PDF certificate, signature, encryption or printing restriction is added.
- Public PDFs can be edited, transcribed or reconstructed; technical controls cannot fully prevent this. The author prioritizes practical use with official sources, clear versions, copyright/license notices and SHA-256 comparisons. This does not deny the value of signature verification or change license terms; hashes do not authenticate the author.
- Both previous Releases, all 16 assets, historical tags, source templates, existing data and private signing materials are preserved. No PDF reflow or interactive fields are added; worksheet and app versions are separate.

## 下载及更新 / Downloads and updates

Use the assets on [this Release](https://github.com/Alias1027/wardnote/releases/tag/v0.6.15-preview.2). Verify `SHA256SUMS.txt` against downloads. Windows: fully extract and run `Start-WardNote.cmd`. Browser/PWA: initial preparation needs a trusted HTTPS origin; follow safe-update prompts and finish recording/save work first. Android: save, export and verify an independent backup, then install the same-signature APK over the existing app; do not uninstall or clear data. The Android app offers neither transcription nor automatic cloud sync. External recorder/file-provider settings remain outside its control.

请核验下载校验值，更新前结束录音、保存记录并验证独立备份。Windows完整解压后启动；浏览器/PWA沿用安全更新确认；Android覆盖安装同签名APK，不先卸载或清除资料。PDF填写后另存本地，不将患者信息或填写后的文件上传公开反馈。

## 验证与许可 / Validation and license

Existing core/publication checks, source/PDF/package hash verification and hosted workflows are used for this release; exact final results are linked in the Release body and local delivery log. Historical checks keep their original dates and versions. Physical-device/OEM-recorder, low-resource, native clinical-language and clinical-use validation remain pending. No claim of clinical or educational effectiveness follows from engineering checks.

详见[验证范围](PROJECT-VALIDATION.md)、[PDF使用说明](../pdf-templates/v007/README.md)及[许可证](../LICENSE)。本项目为源码可见，机构与商业用途须事先书面授权；既往有效许可及第三方权利继续保留。参考制度不等同认证或完全合规；工具不替代正式病历、医嘱、机构职责或临床判断。
