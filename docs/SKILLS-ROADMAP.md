# 安全技能使用状态 / Security skill status

2026-10-23：用户已明确授权安装前两项。`android-intent-security` 与 `differential-review` 已按固定提交安装、保留许可并完成本轮适用范围审查。见[安全报告](SECURITY-REVIEW-0.1.2.md)与[来源记录](../logs/skills-provenance.json)。没有把技能代码嵌入 App；另外两项仍是未安装的候选。

The user authorized the first two candidates. They are now installed at pinned commits, with licenses retained, and their applicable review workflows were completed. Skills are development tools, not app runtime components. The other two candidates remain uninstalled.

## 原始候选评估（安装前历史记录） / Original pre-installation assessment

# 适用技能候选 / Skill candidates

初次评估日期 / Initially checked: 2026-10-23。本轮只核对公开原始仓库和技能文件；没有安装新技能、执行下载脚本、启用外部服务或向第三方提供项目数据。技能用于开发流程，不是 App 的运行时组件，也不能代替真机/临床验证。

This round assessed original public repositories and skill files only. No new skills were installed, downloaded scripts executed, external services enabled, or project data sent to those projects. Skills support development, not app runtime or clinical certification.

| 候选 / Candidate | 项目用途 / Project fit | 建议 / Recommendation |
| --- | --- | --- |
| [Google Android — android-intent-security](https://github.com/android/skills/blob/main/security/android-intent-security/SKILL.md) | 系统录音、文件选择返回 URI、导出组件与授权边界 / Recorder/file-picker Intents, returned URIs, exported components and grants | 优先候选；按当前 Java/WebView 架构选择适用规则。不能照搬假定更高 API 的示例或为无需转发的 Intent 添加额外框架。 / Priority candidate; apply only rules matching the current Java/WebView app. Do not copy higher-API assumptions or add unnecessary frameworks. |
| [Trail of Bits — differential-review](https://github.com/trailofbits/skills/blob/main/plugins/differential-review/skills/differential-review/SKILL.md) | 比较版本间账号、数据导入、加密与升级相关改动 / Security review of account, import, crypto and upgrade changes | 优先候选；当前保留的源码 ZIP 可作文件级基线，缺少 Git 历史时必须说明审查限度。 / Priority candidate; retained source ZIPs provide a file baseline, with missing Git history stated explicitly. |
| [Anthropic — webapp-testing](https://github.com/anthropics/skills/blob/main/skills/webapp-testing/SKILL.md) | 八语界面、表单、导入与备份的浏览器用户流程 / Browser journeys for languages, forms, import and backups | 与现有 Playwright 测试重叠，适合补充检查而非另建一套重复测试。 / Complements existing Playwright checks; avoid a duplicate test stack. |
| [Google Android — testing-setup](https://github.com/android/skills/blob/main/testing/testing-setup/SKILL.md) | 后续原生生命周期、系统交互与设备测试 / Later native lifecycle, system interactions and device tests | 路线候选。上游包含 Gradle/依赖注入等框架安装建议，与当前直接 SDK 构建不完全匹配，不宜整套自动执行。 / Roadmap candidate: upstream Gradle and dependency-injection setup does not directly match the current SDK-only build. |

当前已采用本机 diagnosing-bugs 技能完成失败复现、修复及回归。候选的真实性与适配性已初筛，但没有声称完成其全套审计。正式新增前应固定版本，检查脚本、权限、许可证和重复功能；沿用用户“选定候选后再安装”的设置。

The locally available diagnosing-bugs skill was used for reproduction, repair and regression. Candidate provenance and fit were screened; no complete audit by those external skills is claimed. Before installation, pin a revision and inspect scripts, permissions, licenses and overlap. Preserve the user's candidate-selection-before-installation policy.
