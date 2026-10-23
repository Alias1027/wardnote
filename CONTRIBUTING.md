# Contributing / 参与贡献

WardNote prioritizes independent portable patient notes, human review and data preservation. Keep changes small and explain their user-visible benefit; do not turn optional institutional adapters into prerequisites for local note-taking. / 本项目优先独立便携记录、人工核对及资料完整。请说明改动的实际用途，避免让可选院内接口成为日常记录的必需条件。

## Feedback / 反馈

Use only fictional records and locally generated synthetic audio. The Android bug form asks for device model, Android and WebView versions, recorder/version, document provider, installation/update history and reproduction steps. Never attach real recordings, patient details, backups, passwords, signing material or unfiltered work logs. Security issues follow [SECURITY.md](SECURITY.md), not public bug reports.

仅使用虚构记录和合成录音，按 Android 问题模板填写型号、Android/WebView 版本、录音应用、文件提供程序及安装升级方式。不要附上真实录音、患者资料、备份、密码、签名材料或未筛选工作日志。安全问题按[私密报告规则](SECURITY.md)处理。

## Changes and checks / 修改与检查

1. Describe the problem, proposed behavior and failure handling. Preserve source text, negation, uncertainty, units and human-review status. / 说明问题、目标和失败处理，保留原文、否定、不确定性、单位及人工核对状态。
2. Use the [build/check guide](docs/BUILD-TOOLCHAIN.md) and prepared automated workflows. Report exactly what ran and which checks were skipped. / 按构建说明与自动检查配置运行，明确实际执行及未执行内容。
3. Add meaningful regression coverage for data-integrity or security changes. Do not bypass consent, context checks, failed-save protection or backup verification to make a test pass. / 对安全或资料完整性修复补有意义的回归，不绕过授权、上下文、保存失败保护或备份核验。
4. Use disposable test signing for CI/local experiments. Never commit the private upgrade key, passwords, real data, tool caches or machine paths containing secrets. / 自动检查和个人实验用临时测试签名，不提交正式升级私钥、密码、真实资料或工具缓存。
5. Keep Android `0.1.2-preview` and browser/PWA `0.6.15 UI r1` version lines distinct; public documentation must state the tested platform and limits. / 区分两条版本线，说明测试平台及限制。

## Rights and conduct / 权属及协作

The [source-available license](LICENSE) applies; the project is not offered under an OSI-approved open-source license. Public inspection and proposing contributions do not authorize institutional execution, clinical deployment or commercial use. Before accepting external code, translations or documentation, agree in writing on authorship and the rights required for distribution and institutional/commercial licensing. Opening an issue/PR does not assign copyright or execute a contributor agreement. Institutional contributors must obtain the necessary authorization.

本项目采用[源码可见许可](LICENSE)，不是 OSI 开源许可。公开阅读及提出贡献不授权机构运行、临床部署或商业使用。接受外部代码、翻译和说明前须书面明确权属及分发、机构／商业授权所需权利；提交问题或 PR 不等于转让版权或已签贡献协议。机构贡献者须取得必要授权。

Discuss clinical and technical evidence respectfully. Do not imply institutional or professional endorsement without permission. / 尊重临床与技术证据，不未经许可暗示医院或专业人士背书。
