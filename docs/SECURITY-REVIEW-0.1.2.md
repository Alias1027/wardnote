# Android 安全审查与修复 / Android security review and repairs

2026-10-23 · **0.1.1-preview → 0.1.2-preview** · Junhui Liu M.D.

## 1. 结论 / Executive summary

本轮安装并应用 Google `android-intent-security` 和 Trail of Bits `differential-review`，完成聚焦的源码安全审查、独立攻击路径复查、修复和隔离回归。发现的 **2 项中风险、2 项低风险**问题均已在本次范围内修复，另完成一项文档提供程序边界加固。未发现可证实的外部 Intent 重定向或跨账号数据库越权路径；此表述不代表穷尽所有漏洞。

Both selected skills were installed and applied to a focused source review, independent adversarial re-review, repairs and isolated regression. **Two medium and two low findings** were repaired, plus one document-provider boundary hardening item. No demonstrable external Intent redirection or cross-account database privilege escalation was found within this scope; this is not an exhaustive vulnerability-free claim.

| 发现 / Findings | 严重 / Critical | 高 / High | 中 / Medium | 低 / Low |
| --- | --- | --- | --- | --- |
| 本轮 / This review | 0 | 0 | 2 | 2 |
| 本轮遗留 / Remaining from these findings | 0 | 0 | 0 | 0 |

**建议 / Recommendation: CONDITIONAL — 可继续作为离线预览版交付；不能据此认定已满足真实医院使用或获得安全认证。** 未验证的 Android 系统生命周期、录音处理程序和文件提供程序属于剩余风险，需后续真机反馈。 / Continue as an offline preview; this is not approval for real-patient deployment or a security certification. Android lifecycle, recorder and provider behavior remain device-validation risks.

## 2. 基线与变化 / Baseline and changes

基线为保留的 `wardnote-android-0.1.1-preview-source.zip`，SHA-256：`8502fbabe5f4c8075f0b6115cbde785ab44b802cda6319bcdd350b6ac20bac99`。同时对照 0.1.0 → 0.1.1 的历史修复，确认未移除导入窗口保护和旧数据格式约束。本目录没有 Git 仓库，**无法执行提交历史、git blame 或 CVE 提交追踪**；不编造提交标识。比较采用归档快照并忽略 CRLF/LF 差异。

The retained source ZIP above is the baseline. The previous 0.1.0 → 0.1.1 change context was also inspected. **No Git history is available**; commit attribution, blame and historical CVE tracing cannot be performed. Archive snapshots and normalized line endings provide the comparison, not invented commit history.

精确修改见 [统一差异文件](SECURITY-ALIGNMENT-0.1.2.diff) 和 [逐文件变更统计](../logs/security-diff-inventory.json)。运行时代码变更为 `MainActivity.java`、新增 `DocumentGuard.java`、`android-platform.js`、`app.js`、`android-strings.js`；另更新测试、版本、打包清单和说明。没有新增 AndroidX、第三方运行库、权限或网络接口。

Exact changes are in the linked unified diff and file inventory. Runtime changes are limited to the five files above; tests, versioning, packaging and documentation were updated. No AndroidX/runtime dependency, permission or network interface was added.

## 3. 具体发现 / Findings and repairs

| 编号 / ID | 等级 / Severity | 入口与可复现情景 / Entry and scenario | 修复 / Repair |
| --- | --- | --- | --- |
| S1 | 中 / Medium | 基线 `web/app.js:242` 普通导出没有账号/患者守卫，调用者未等待导出完成；在系统保存窗口返回后注销，旧导出可能继续。 / Ordinary export could continue after session invalidation. | 当前 `app.js:242–243,403,454–460` 在取得内容前捕获上下文，等待整个导出；传输期间阻止界面切换，独立失效则中止。不会撤回已合法交给外部程序的字节。 / Capture context before fetching, await export and block UI switching; abort on independent invalidation. Already delivered bytes cannot be recalled. |
| S2 | 中 / Medium | 基线 `android-platform.js:57–58` 在分片读取或散列计算的异步等待后没有再次检查。纯内存测试实际出现上下文失效后的 `writeChunk`。 / A delayed chunk read bypassed the pre-await check. | 当前 `android-platform.js:55–66` 在异步边界后检查；忙碌状态覆盖整个传输；失效时不提交下一分片或完成请求。 / Recheck after awaits; hold busy state throughout; stop subsequent chunks/finalization. |
| S3 | 低 / Low | 基线 `MainActivity.java:103` 文件选择器启动未捕获 `SecurityException`。设备策略拒绝可能结束 Activity，丢失未提交输入。 / Policy denial could crash the picker path. | 当前 `MainActivity.java:105,270–328` 捕获拒绝及异常结果，解析完成前保留回调，失败返回取消，不输出患者载荷。此原生错误分支尚未在 Android 上执行。 / Handle denial/malformed results and complete cancellation safely; Android runtime execution remains pending. |
| S4 | 低 / Low | 基线 `MainActivity.java:424–426` 忽略删除结果；关闭失败也会跳过清理。可能残留导出却声称已删除。 / Failed cleanup could be falsely reported as removal. | 当前 `DocumentGuard.java:38–42` 关闭失败仍尝试删除，只有确认成功才报告；八语提示检查残留文件。保留 `VERIFY_FAILED` 错误码，避免成功删除后二次清理造成误报。 / Confirm deletion, surface residual-file warning in all eight languages, avoid duplicate cleanup after confirmed removal. |

S1/S2 是已有用户授权导出中的会话失效问题，**不是已证明的远程攻击或跨账号读取**。攻击/故障条件为已登录用户开始导出，随后账号被注销或失效。修复后仍无法保证恶意文件提供程序诚实报告其存储行为。

S1/S2 concern stale-session continuation of a user-initiated export, **not proven remote access or cross-account reads**. A signed-in export followed by session loss is the precondition. A malicious provider may still lie about its own storage.

## 4. 安全对齐加固 / Best practices and security alignment

**范围：ContentProvider 返回值与非破坏性文件创建。优先级：中；性质：防御加固。** `MainActivity.java:363–389` 与 `DocumentGuard.java:22–36` 记录既有文档 ID，要求返回目标具有新身份、正确名称、可确认的空内容和相同提供方；未验证、已有或非空目标不写入、不删除。只有通过检查的新目标才可能执行失败清理。对伪造提供方的模拟不代表已证明的系统越权漏洞。

**Area: ContentProvider return validation and non-destructive creation. Priority: medium; classification: hardening.** Snapshot existing document IDs, require a new identity, expected name, confirmed empty content and matching provider. Never write or delete an unverified/existing/nonempty target; cleanup is limited to a validated new target. Provider deception is a boundary concern, not demonstrated Android privilege escalation.

依赖与 XML 无变化。系统启动入口仍需 `exported=true`，不读取外部启动 Intent 的载荷；本项目无嵌套 Intent 转发、服务、广播接收器、自有 ContentProvider 或 PendingIntent，相关规则不适用。`onCreate` 创建工作区界面；无自定义 `onNewIntent` 数据处理或 `singleTop` 路由。未为不存在的功能引入签名权限或 IntentSanitizer。

Dependencies and manifest XML are unchanged. The exported launcher remains necessary and consumes no external launch payload. There are no nested-Intent forwarding, services, receivers, owned providers or PendingIntents. `onCreate` initializes the workspace; there is no custom `onNewIntent` processing or `singleTop` routing. Unneeded signature permissions and IntentSanitizer were not added.

## 5. 测试与覆盖边界 / Tests and coverage limits

- **15/15 自动测试**：包含异步失效、清理错误及一个直接执行生产 `DocumentGuard` 的 JVM 测试；后者包含 **10 个提供方故障情景**。这不是额外 10 项顶层测试，也不是 Android ContentResolver 仿真。 / 15 tests, including one production-helper JVM test with 10 provider scenarios; do not double-count these as 10 additional top-level tests.
- **18/18 桌面 Chromium 流程**：首次脱机资源、八语/RTL、录音返回与导入、真实界面导出、注销保护、备份互通及错误恢复。原生桥是测试替身。 / 18 desktop workflows using a native-bridge double.
- **3/3 持久化配置升级模拟**：0.1.1 → 0.1.2 资源替换后，两类账号、历史及 18 MiB 合成音频保留，跨分卷恢复字节一致。 / Three persistent-profile upgrade checks, including exact multi-part audio recovery.
- **41 个 JS 模块语法检查、57 个 APK 网页资源逐字节核对、签名/应用标识/版本递增核验**。 / 41 JavaScript modules and 57 APK asset checks, plus signing/update metadata verification.

没有代码覆盖率仪器，不给出行覆盖百分比。系统权限拒绝、恶意 Parcelable、真实 ContentResolver 和 OEM 录音往返只有源码审查/编译证据；仍需真机验证。具体记录见 [验证矩阵](VALIDATION.md) 与 `logs/`。

No line-coverage instrumentation was used. Permission denial, malformed Parcelables, real ContentResolver and OEM recorder round trips remain source/compile evidence only; physical-device validation is pending.

## 6. 影响范围与不变量 / Blast radius and invariants

| 方法 / Function | 直接调用点 / Direct call sites | 范围 / Scope |
| --- | --- | --- |
| `writeNativeFile` | 2 | 普通导出与分卷备份 / ordinary export and segmented backup |
| `exportGuard` | 2 | 导出动作捕获及默认下载保护 / action capture and default download guard |
| `nativeBusy` | 6 | 录音、导航、退出、更新提示等守卫 / recording, navigation, exit and update guards |
| `DocumentGuard.createFresh` | 1 | 原生分卷文件创建 / native part creation |
| `DocumentGuard.discard` | 2 | 生产代码中的创建失败清理及导出清理 / creation-failure and export cleanup |

数量来自生产代码静态调用点，排除声明与测试，不等于运行频率。沿调用链复核 `offline-ui.js` → `writeNativeFile`、`app.js` → `offline-api.js` → `offline-store.js`。`accounts.js`、`offline-store.js`、`backup-segments.js` 与保留浏览器基线逐字节一致；没有加密格式或账号迁移。

Counts are static production call sites, excluding declarations/tests. Reviewed caller chains include offline UI, export actions and storage. Account, encrypted-store and backup-format modules remain byte-identical to the preserved browser baseline; no data-format migration occurs.

## 7. 历史与剩余风险 / History and residual risk

旧导入确认与保存保护保留。0.1.1 审查中未发现移除安全检查的行为；本轮修复关闭新增发现。应用继续固定本地来源，禁止框架、对象和 Worker，拒绝外部导航，无网络/麦克风/广泛存储权限。安全技能不检查或认证医学内容。

Previous confirmation/save safeguards are preserved. This round found no removal of those controls. The app retains its fixed local origin, CSP frame/object/worker restrictions, navigation boundary and absence of network/microphone/broad-storage permissions. Skills do not validate clinical content.

外部录音应用及文档提供程序可以保留或同步自己的副本；已发出的写入无法远程撤销。超时、被系统终止或提供程序不配合时可能遗留不完整文件；应检查目的文件夹并重新核验备份。应用不以卸载、清除数据或换签名方式处理更新。

External recorder/provider copies remain outside WardNote control. In-flight writes cannot be recalled; timeouts, OS termination or uncooperative providers may leave incomplete files. Inspect the destination and reverify backups. Never use uninstall/data clearing/re-signing as an update workaround.

## 8. 后续与方法 / Recommendations and methodology

策略为中型代码库的 **FOCUSED** 审查：完整阅读原生桥和新增保护模块，逐段检查变更及一层高风险调用链；独立复查攻击/失败情景。运行时变更逐项审查；文档与测试核对一致性。源码路径结论置信度较高，Android 设备行为仍未验证。保留的浏览器/PWA、冻结包、0.1.0/0.1.1 交付、已有数据与 C 盘模板不修改；本轮不公开发布。

The **FOCUSED** review covered the native bridge, new helper, every runtime change and one-hop high-risk callers, with independent adversarial re-review. Confidence is higher for reviewed source paths; device behavior remains unverified. Preserved releases, data and C-drive templates are untouched; no publication occurred.

后续按 [ROADMAP](ROADMAP.md) 收集真机、低配置、母语临床人员和医院场景反馈；重点加入设备策略拒绝、只读/满盘提供方、录音返回、系统中断和同签名安装升级。 / Later feedback should cover device-policy denial, read-only/full providers, recorder return, interruption, same-signature installation, low-resource use and clinical usability.

## 9. 技能来源 / Skill provenance

- [Google Android Intent Security](https://github.com/android/skills/tree/95ea931a1ad8f9b2be132ae0cfb2aad964d71118/security/android-intent-security), commit `95ea931a1ad8f9b2be132ae0cfb2aad964d71118`, Apache-2.0.
- [Trail of Bits Differential Review](https://github.com/trailofbits/skills/tree/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/differential-review/skills/differential-review), commit `196a9073ab10d35bacf111f945e02c00b2c6883a`, CC BY-SA 4.0.

技能原文、许可证、固定版本及可恢复副本保存在本机技能维护目录，未嵌入 APK 或项目源码许可范围；本报告为项目的独立分析，不复制技能正文。安装来源与散列见 [skills-provenance.json](../logs/skills-provenance.json)。新增技能在下一轮对话可被技能目录发现，本轮已经直接读取并执行其适用工作流。

Upstream skills/licenses and pinned recovery copies are held in local skill maintenance, not embedded in the APK or relicensed as project code. This is an original project analysis, not copied skill text. The next turn can discover the installed entries; their relevant workflows were read and applied directly in this turn.
