# Security policy / 安全问题反馈

## Maintained scope / 当前维护范围

| Line / 产品线 | Status / 状态 |
| --- | --- |
| Android `0.1.2-preview` | Current Android security-maintenance target; technical preview, not device/clinical certification. / 当前 Android 安全维护目标；技术预览，不代表真机或临床认证。 |
| Android `0.1.0` / `0.1.1` | Retained upgrade/reference snapshots; fixes are delivered in the current preview. / 保留为升级及比较基线，修复在当前预览版提供。 |
| Browser/PWA `0.6.15 UI r1` | Co-hosted under browser-pwa/; see docs/PROJECT-VALIDATION.md and its own security documentation. Android checks do not certify it. / 已合并至 browser-pwa/，见整体验证及该产品线安全说明；Android 检查不替代主项目检查。 |

No response-time guarantee, hospital-grade security certification or clinical validation is claimed. Apple platforms and cloud synchronization are outside this Android release. / 不承诺响应时限、医院级安全认证或临床验证；苹果平台与云同步不属于本次 Android 版本。

## Report privately / 私密报告

Private vulnerability reporting is enabled for the [official repository](https://github.com/Alias1027/wardnote). Use [Report a vulnerability](https://github.com/Alias1027/wardnote/security/advisories/new) under Security → Advisories; GitHub sign-in is required. If unavailable, request a private channel using junhuiliu1025@gmail.com. Initially send only a request to arrange secure reporting, not sensitive attachments. Public issues must not contain exploit details.

[官方仓库](https://github.com/Alias1027/wardnote)已启用私密漏洞报告。请使用 Security → Advisories 中的[Report a vulnerability](https://github.com/Alias1027/wardnote/security/advisories/new)，需先登录 GitHub。若入口不可用，可通过 junhuiliu1025@gmail.com 请求约定私密渠道；首次仅发送联系请求，不附敏感文件。不要在公开问题中披露漏洞利用细节。

Include the affected package/version, impact, reproducible synthetic steps and relevant platform details. Never send real patient records, original clinical audio, backups, credentials, signing keys or personal device identifiers. Use [the synthetic feedback fields](.github/ISSUE_TEMPLATE/bug.yml) only after removing confidential details. / 报告应含版本、影响、虚构病例复现步骤及必要平台信息；不得发送真实病历、原声、备份、账号秘密、签名材料或个人设备标识。

## Current boundaries / 当前边界

- Android requests no `INTERNET` permission. The external recorder/document provider is separate software and may retain or synchronize its own copy. / Android 不申请联网权限；外部录音应用及文件提供程序可自行保留或同步副本。
- Account/mode-separated encryption protects stored application payloads; it does not protect an unlocked or compromised device, external originals, or every piece of metadata. / 账号及模式隔离加密不保护已解锁或被攻陷的设备、外部原件或全部元数据。
- System installers can terminate the app. Save and verify independent backups before a same-signature update; uninstall/data clearing removes local data. / 系统安装器可终止进程；更新前保存并核验独立备份，卸载或清除数据会删除本机资料。
- The hospital owns staff authorization, access assignment/revocation and accountable oversight. Deployment arrangements must cover this app, audio, exports and backups; a pseudonym does not ensure anonymization. Local accounts and revision records do not constitute institutional identity authentication or certified signatures. / 机构承担人员授权、权限分配及撤销和可追溯管理，落实覆盖本工具及其录音、导出和备份的措施；化名不等同匿名，本地账号和修改历史不等同机构身份认证或正式签名。
- Signing private keys, passwords and private recovery material are excluded from public source, APK assets, CI artifacts and issue reports. Public CI uses a disposable test identity, never the retained upgrade key. / 签名私钥、密码及私有恢复材料不进入公开源码、APK 资源、自动检查产物或问题报告；公开自动检查仅使用临时测试签名。

For reviewed findings and evidence limits, see [SECURITY-REVIEW-0.1.2.md](docs/SECURITY-REVIEW-0.1.2.md) and [VALIDATION.md](docs/VALIDATION.md). Source/build and desktop simulation results are not Android device-runtime or clinical validation. / 已审查问题和证据边界见上述报告，源码、构建和桌面模拟不构成 Android 真机或临床验证。
