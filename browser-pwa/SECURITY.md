# Security policy / 安全问题反馈

## Supported scope

The latest 0.6.x pre-release is the current maintenance target. Earlier snapshots are not independently supported. There is no commercial response-time guarantee or clinical/security certification. See [architecture](docs/ARCHITECTURE.md) for the present trust boundaries.

## Report privately

On the official source repository, use **Security → Advisories → Report a vulnerability** after the maintainer enables GitHub private vulnerability reporting. Repository setup steps are in [RELEASING.md](docs/RELEASING.md).

If that control is unavailable, do **not** post exploit details or any clinical data publicly. Ask for a private reporting channel through a minimal public issue containing only “Please enable private vulnerability reporting”; provide details after a private channel is established. This source package does not invent a maintainer address or claim that reporting is already enabled on an unpublished repository.

Include the affected version, deployment mode, impact, reproducible steps using synthetic records and a proposed mitigation if available. Never include production passwords, service tokens, patient details, recordings or production databases.

## Current boundaries

**Institutional responsibility, outside the product's administration scope:** the hospital or deploying institution owns individual identity authorization, access control and accountable audit oversight. WardNote does not implement or plan a hospital identity/role/audit-management platform. The institution must establish and verify coverage of this app's access, data, audio, exports and backups through its approved deployment arrangements. This boundary allocates responsibility; it does not exempt identifiable patient information from protection. Existing local password, lock, encryption, event and revision safeguards remain in place.

**机构职责与产品边界：**个人身份授权、访问权限分配/撤销及可追溯操作的管理由部署医院或机构承担，不属于本项目新增管理模块的范围。机构须落实覆盖本工具资料、录音、导出及备份的措施。本机多账号分别加密保存；服务端仍按个人／机构模式划分工作区，获准使用同一服务端工作区的用户共享其授权范围。账号名、记录者标识和本地事件记录不足以单独认证每位人员或证明其操作归属。化名可减少直接身份暴露，但自由文本、日期和录音可能仍可关联患者；具体处理和外发由机构按用途判断。详见[临床工作边界](docs/CLINICAL-SCOPE.md)。本次调整保留全部现有本地保护。

- Local accounts have independent encrypted device stores. Server workspaces remain mode-specific: users authorized to the same server workspace share that scope. Matching local usernames do not establish cross-device identity or institutionally authenticated per-user roles.
- Encrypted payloads do not protect an unlocked process or a compromised host; record IDs, types, times and sizes remain metadata.
- Source-linked review and the local audit chain are not certified signatures or immutable external evidence.
- ASR and export endpoints are explicit administrator configuration. Their operators, authentication and retention require separate assessment.
- Only application resources enter the service-worker cache. Device clinical records and saved audio persist encrypted in mode-separated IndexedDB. Unsaved memory buffers may be lost on termination; browser data deletion or device loss requires a separate backup. Network permission defaults to off, is reset on opening, and never automatically authorizes clinical transfer.
- Deleting current audio does not erase old backups. Restoring requires reconciliation of prior retention decisions.

中文：请优先使用仓库的私密漏洞报告功能。如果尚未启用，只公开请求建立私密渠道，不公开漏洞利用细节或患者资料。当前维护范围为最新0.6.x预发布版本；不得将本说明理解为医院级安全认证。

Personal/institution mode selection is not institutional SSO or per-employee authorization. Passwords, clinical data and biometric material are excluded from authorization event payloads. Destinations are configured server-side by mode, default unconfigured, and use HTTPS except loopback tests. Passkeys and QR authorization are not implemented. See [account and transmission limits](docs/OFFLINE-AND-ACCOUNTS.md).
