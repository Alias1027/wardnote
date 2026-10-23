# Android 0.1.2 发布准备补充记录 / Release preparation r1

2026-10-23 — 本轮可执行的发布前收尾已完成；本文件作为最终源码包的一部分，包的最终散列及交付核验另见 `.sha256`、`source-package-r1-verification.json` 和 `DELIVERY-CHECK.json`，避免自引用。

## 变更与交付 / Changes and delivery

- 补齐中英文 Android 首次预发布说明、支持范围、安装升级与恢复指引、建仓后发布步骤；统一 README、快速开始和验证说明。明确 `0.1.2-preview` / versionCode 3 与源码发布材料修订 `r1` 的区别。
- 新增只用虚构病例的双语问题/建议反馈模板、贡献说明、安全问题私密反馈步骤；不创建虚构维护者邮箱或仓库网址。Release 正文中的相对链接须在实际建仓后换成真实标签链接。
- 新增 Windows GitHub 检查配置、锁定依赖、自包含的历史测试基线及隔离临时签名构建入口；不会调用正式签名材料，不自动上传、签发或发布 APK。
- 采用人工复核的 138 文件公开白名单。打包拒绝链接目录、未列文件、私有材料/数据扩展和已识别凭据标记；读取并校验源码包每个条目及两份历史基线中的 112 条目。独立复核后补强 ZIP 内白名单一致性与嵌套基线核验。
- 新增独立 `source-r1.zip` 与 `Android-offline-preview-0.1.2-release-ready` 交付目录；原 0.1.2 APK 不重新签名、不改变字节。旧源码包、旧交付和浏览器/PWA冻结版本保留。

Prepared bilingual release/support, installation/update and restore instructions, publishing steps, synthetic-case feedback and private-security-report guidance. Added pinned, read-only GitHub checks with self-contained historical fixtures and disposable signing. The exact reviewed public allowlist replaces recursive source-directory inclusion. The source-r1 publication revision does not change the Android runtime or existing installer.

## 本轮实际检查 / Checks executed this round

| 检查 / Check | 结果 / Result |
| --- | --- |
| 核心自动测试 / Core | 15/15；亦从源码 ZIP 解压副本执行 / also run from extracted archive |
| 桌面桥接模拟 / Desktop browser bridge simulation | 18/18；无页面错误 / no page errors |
| 桌面升级与备份模拟 / Desktop upgrade and backup simulation | 3/3；包括 18 MiB 合成音频和分卷恢复 / includes synthetic audio and segmented restore |
| 公开边界测试 / Publication boundaries | 12/12；包含真实 Windows junction、私钥标记、未知文件及基线/manifest篡改拒绝 / link and tampering rejection |
| 临时签名构建 / Disposable signing build | 构建、包结构与签名核验通过，57 个资源一致；临时 APK/密钥已清除 / build verified, temporary materials removed |
| 历史基线 / Historical fixtures | 112 条目双层散列核验通过 / archive and entry hashes verified |
| 解压后的文档链接 / Extracted documentation links | 93 个相对文件链接通过 / relative file links resolve |
| 私有签名恢复 / Private signing recovery | 5 项检查通过 / five checks passed |
| 保留内容 / Preservation | 183 个既有交付文件与 66 个运行时文件散列未变 / unchanged |

上述结果均在本轮重新执行；15 项核心测试中的 JVM 文档测试含 10 个场景，不重复计入总数。GitHub 配置及脚本已在本机检查，未宣称已经在 GitHub 托管执行。

All listed local results were rerun this round. Ten JVM document scenarios are contained in one of the 15 top-level core tests and are not counted again. Hosted GitHub execution has not occurred.

## 签名保护 / Signing protection

正式签名材料在公开目录之外生成 AES-256-GCM 加密备份，独立随机恢复密钥分目录保存，两处目录仅限本人、SYSTEM 与 Administrators 访问。已验证错误密钥及篡改密文被拒绝、恢复文件与原件一致、恢复出的私钥签署测试包后证书与正式签名一致，并清除临时恢复材料。公开证据只有结果和证书指纹，不含私钥、密码、恢复密钥或私有路径。

An encrypted backup and separately stored random recovery key are restricted by Windows ACLs. Wrong-key/tamper rejection, byte-exact recovery, signing with the original certificate and temporary-file removal passed. Public evidence contains outcomes and the certificate fingerprint only. **两份材料仍在本机同一磁盘，尚非离机或异地容灾备份 / Both remain on the same local drive; no off-device disaster-recovery copy exists.**

## 边界与后续 / Boundaries and follow-up

- 保留既有浏览器/PWA、冻结包、Android交付和所有用户数据；本轮未访问或操作 C 盘模板、现有账号资料及患者录音。
- 不建仓、不发布、不上传。真机/模拟器安装、不同厂商录音与文件提供程序、低配置完整班次、八语母语临床审校、真实临床及托管反馈表验证留待后续。
- 当前 APK 无联网权限，不提供联网转写、离线识别或云同步；外部录音/文件应用的行为另行核查。云同步与苹果平台不在本轮范围。
- 仅清理本轮产生的解压核验副本、测试基线和缓存；保留工具链、历史成果、签名备份和恢复材料。

Preserved all existing deliveries and runtime files. User data and C-drive templates were not accessed. No repository was created and nothing was published. Device/OEM recorder/provider, low-resource, native-language clinical, clinical and hosted-form checks remain future work. Only generated test copies/caches are eligible for cleanup; existing products, toolchains and private recovery materials remain.
