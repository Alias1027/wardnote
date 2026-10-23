# Android 发布操作指南 / Android release procedure

适用 / Applies to: **Android 0.1.2-preview**, source/publication material **r1**. 本轮仅准备文件与本地核验，**不建仓、不创建远程标签、不上传或发布**。 / This round prepares files and local checks only; **no repository, remote tag, upload or publication is performed**.

## 1. 区分交付版本 / Keep release lines distinct

| Component / 组件 | Retain / 保留 | Prepared candidate / 本次候选 |
| --- | --- | --- |
| Browser/PWA / 浏览器版 | `0.6.15 UI r1` and its frozen packages / 原版本及冻结包 | No replacement in this Android release / 本轮不替换 |
| Android runtime / Android 运行时 | Original 0.1.0, 0.1.1 and 0.1.2 deliveries / 既有交付 | Same `wardnote-android-0.1.2-preview.apk`, versionCode 3 / 同一安装包 |
| Android source/docs/checks / Android 源码、文档及检查 | Original `...-source.zip` / 原源码包 | `wardnote-android-0.1.2-preview-source-r1.zip` |
| Delivery folder / 交付目录 | Existing folders / 既有目录 | `Android-offline-preview-0.1.2-release-ready` |

Do not rename the Android runtime to match the browser version. The r1 source revision adds publication material/check configuration without changing bundled application bytes. / 不为匹配浏览器版本而修改 Android 运行时版本；r1 为发布材料和检查配置整理，APK 内应用字节保持不变。

## 2. 建仓前本地核验 / Local checks before repository creation

- Verify APK/source SHA-256 against their sidecars and `SHA256SUMS.txt`; check every source archive entry against `SOURCE-MANIFEST.json`. Verify the intended APK retains application ID `org.wardnote.offline.preview`, signing identity and versionCode 3. / 按校验文件核验 APK、源码及源码清单，确认应用标识、签名及版本。
- Review the **complete public file allowlist**, not the whole development folder. Include approved source, eight-language assets, licenses/notices, documentation, tests, workflow/feedback templates and selected synthetic validation evidence only. / 审核完整公开白名单，仅纳入源码、八语资源、许可、说明、测试、自动检查及反馈模板和筛选后的合成验证证据。
- Exclude private signing/recovery material, passwords, personal settings, patient data, external original audio, unfiltered logs, browser profiles, SDK/JDK caches and `.git` metadata. `.gitignore` is an additional check, not permission to upload the working directory wholesale. / 排除签名及恢复材料、密码、个人配置、患者资料、原声、未筛选日志、浏览器配置和工具缓存；不能仅依赖忽略规则上传整份工作目录。
- Follow [BUILD-TOOLCHAIN.md](BUILD-TOOLCHAIN.md) for available local checks. Keep historical Android runtime results separate from this publication-material check. CI configuration being present does not mean GitHub Actions has run. / 本地检查依构建说明执行，历史运行时测试与本轮发布材料检查分开记录，配置存在不等于已在 GitHub 跑通。
- Record the final evidence in the selected delivery/check records. Retain previous APK/source packages and a verified independent backup before any future upgrade. / 将最终证据记入筛选的交付清单及记录，保留旧包，升级前核验独立备份。

## 3. 签名材料 / Signing material

Keep the retained upgrade identity outside every public directory. Back up the key and required recovery information in an encrypted or access-protected private location and verify a restore without printing secrets. A second local copy is **not** off-device disaster recovery. The maintainer must separately arrange controlled offline/off-device custody; no such custody is claimed by this release.

升级签名身份保存在公开目录外，密钥及必要恢复资料须加密或受访问权限保护，恢复核验不输出秘密。本机第二份备份**不等于异地容灾**；受控离线／异地保管仍需维护者另行安排，本次发布材料不作此保证。

Public CI may create only a disposable test key and must never receive the retained signing password/key through repository files, artifacts or pull-request secrets. Test-signed builds are not official upgrades and must not be offered as replacements for the delivered APK. / 公开自动检查只创建临时测试密钥，不接收原升级私钥或密码；测试签名包不是官方升级包，不作为当前安装包的替代品分发。

## 4. 获得发布授权后：创建仓库 / After explicit publication authorization: repository setup

本次准备的工作流按**独立 Android 源码根目录就是仓库根目录**设计。解压源码后，进入 `wardnote-android/` 内层目录；`package.json`、`android/`、`web/`、`scripts/` 和 `.github/` 应直接位于仓库根。不要把整个交付总目录作为仓库，也不要把 Android 工作流直接混入浏览器/PWA 仓库根。若以后采用合并仓库，须先为工作流明确配置 Android 子目录、复核相对链接与打包路径，并重新检查后再发布。

The prepared workflow assumes the **standalone Android source root is the repository root**. After extraction, enter the inner `wardnote-android/` directory; `package.json`, `android/`, `web/`, `scripts/` and `.github/` must sit directly at the repository root. Do not use the entire delivery parent as a repository or copy the Android workflow into the browser/PWA root unchanged. A future combined repository must explicitly configure the Android working subdirectory, recheck relative links and packaging paths, and repeat validation before publication.

1. On GitHub, create the intended repository under the authorized owner. Do not generate a different default license; retain `LICENSE`, `NOTICE` and `LICENSES`. A public repository does not change this source-available license into an OSI open-source license. / 在授权主体下建仓，不用默认许可替换当前条款；公开仓库不改变许可性质。
2. Extract the verified source archive into a **new staging directory**. Upload/commit only its reviewed source manifest entries, then check the staged file list. Do not commit the delivery parent, private backup or tool directories. / 将已核验源码包解压至新暂存目录，仅上传清单中的已审查文件，不提交交付总目录、私有备份和工具目录。
3. Review the default branch, enable the prepared Actions workflow and run it. Keep permissions minimal and use test signing. A hosted workflow failure must be investigated before describing hosted CI as passing. / 检查默认分支，启用并实际运行准备的自动检查，维持最小权限及测试签名；失败不能标记通过。
4. In **Settings → Advanced Security**, enable **Private vulnerability reporting** and confirm the report entry is visible. See [SECURITY.md](../SECURITY.md) and [GitHub's current setup instructions](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository). No private reporting endpoint is claimed before this step. / 在设置的 Advanced Security 中开启并检查私密漏洞报告入口，未完成前不声称已启用。
5. Confirm issue forms and contribution instructions render correctly in GitHub. Do not automatically contact users or recruit clinical testers. / 检查反馈及贡献模板渲染，不自动联系用户或招募临床测试者。

## 5. 获得发布授权后：创建预发布 / After authorization: create the prerelease

1. Choose the verified commit and suggested tag `android-v0.1.2-preview`. If that tag already exists, inspect it; never move an existing released tag silently. / 选定核验提交及建议标签，已有标签先查明，不静默移动已发布标签。
2. Use [RELEASE-0.1.2-preview.md](RELEASE-0.1.2-preview.md) for the Chinese/English release body. Under **Releases → Draft a new release**, select the tag/target and **This is a pre-release**; retain prominent device/clinical limitations. Keep a draft until all attachments are verified. See [GitHub's release instructions](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository). / 在 Releases → Draft a new release 中选择标签和目标，使用中英说明并勾选预发布；附件核验完毕前保留草稿，明确真机及临床验证尚待反馈。
3. Attach the reviewed APK, `...-source-r1.zip`, their `.sha256` files and `SHA256SUMS.txt`. Do not attach signing backups, all logs or the development folder. / 上传审核后的 APK、源码及校验文件，不上传签名备份、所有日志或工作目录。
4. Download the public assets again and verify hashes, source manifest and links. Leave preserved browser/PWA release assets unchanged. / 发布后回下载核对散列、清单及链接，保留浏览器/PWA 附件不变。

## 6. 明确保留的验证工作 / Deferred validation

After publication, invite synthetic-case feedback on real Android devices, OEM recorder return/import, document providers, same-signature upgrade/data retention, low-resource performance, eight-language readability/accessibility and clinical workflows. These are future checks, not evidence already completed. Institutional or clinical testing still requires the applicable license authorization and local governance. iOS/Apple adaptation is not planned in this phase; older browser documents mentioning iPhone testing are historical, not a new commitment.

发布后再收集真机录音往返、文件提供程序、同签名升级及资料保留、低配置运行、八语和无障碍及临床流程反馈。这些均为后续工作，机构或临床测试仍需许可与院方管理条件。当前不计划 iOS／苹果适配；旧浏览器材料中的 iPhone 测试条目仅为历史计划，不构成新增承诺。

## 发布正文链接检查 / Release-body links

本文档及 Release 草稿中的相对链接适用于源码仓库内阅读。粘贴到 GitHub Release 正文前，将其替换为实际仓库对应标签/提交下的文件链接，并逐一打开核对；仓库尚未建立时不编造地址。 / Relative links in these documents work within the source tree. Before pasting into a GitHub Release, replace them with links to the actual repository tag/commit and open each link to verify it; do not invent a repository URL before it exists.
