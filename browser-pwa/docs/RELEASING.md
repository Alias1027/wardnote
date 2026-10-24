# Preparing a public release

Current source release: **v0.6.15**, including UI r1 (initial pre-release).

First-preview freeze / 首发定稿：2026-10-21。拟用标签为 `v0.6.15`，运行版本为 `0.6.15`，浏览器缓存修订为 `wardnote-shell-v0.6.15-r1`；静态包缓存追加 `-static`。本轮仅统一文档与发布材料，程序、依赖及测试内容不变。三个 ZIP 和各自 `.sha256` 为六个拟发布附件；维护者交付目录另存首发冻结清单，记录公开文件清单及附件散列。当前没有 Git 提交、远程仓库或已发布标签可供绑定，真实 GitHub CI、标签绑定与公开发布须在获准建仓后完成。

The frozen first-preview candidate includes UI r1. Its intended tag is `v0.6.15`, application version is `0.6.15`, and browser cache revision is `wardnote-shell-v0.6.15-r1` (with `-static` appended in the static package). This closeout changes documentation and release materials only. The three ZIPs and their SHA-256 sidecars form six intended release assets; a separate maintainer freeze record captures source inventories and asset hashes. No Git commit, remote repository or published tag is created by this preparation. Hosted CI and tag-to-commit binding remain required after repository creation is authorized.

冻结后如修改任一公开文件，须重新检查、打包并更新冻结清单；不把改过的附件继续当作原定稿。公开发布后的更改应使用新版本及新校验值，保留既有发布附件。

Any public-file change invalidates the frozen artifact hashes: repeat the affected checks, rebuild and replace the freeze record before release. After publication, issue a new version and checksums for changes instead of replacing the original released assets.

The application directory may coexist with private local records. Publish an allowlisted source package, not the working directory wholesale.

## Build a reviewable source directory

From the project root:

```sh
node scripts/release.mjs --check
node scripts/release.mjs
```

The first command validates the explicit file list and local Markdown links. The second creates `dist/wardnote-0.6.15/` plus a SHA-256 manifest inside it. It refuses to overwrite an existing destination. The script never copies local `data/`, `work/`, `logs/`, `reference/`, `.env` or `config.local.json`; `.gitignore` is an additional safeguard, not the packaging mechanism. An optional `--zip` writes a source ZIP using Node's built-in compression; it includes dotfiles and CI configuration.

```sh
node scripts/release.mjs --zip
node scripts/test-package.mjs
```

Run the ZIP command instead of the plain build command when a ZIP is needed; both create the same source directory and refuse existing output. Preserve previous published versions; remove only a verified disposable generated directory before rebuilding. `test-package.mjs` verifies the packaged source hashes and runs every packaged `*.test.mjs` suite. A content scan is an aid, not a guarantee that all possible secrets or clinical information have been identified.

## Reproducible checks

### Separate Windows offline package / 独立 Windows 离线发行包

After the source directory is built and checked, prepare the reviewed official runtime assets in a private build directory: `node.exe`, the complete original `LICENSE`, `SHASUMS256.txt`, and `node-v24.19.0-win-x64.zip`. Obtain the ZIP and checksum list from [Node.js 24.19.0](https://nodejs.org/dist/v24.19.0/); extract LICENSE from the verified ZIP. The packager pins the official ZIP, executable and complete license SHA-256 values. It checks every input before creating output, refuses symlink/junction inputs and refuses an existing output path. No runtime download occurs during packing or launch.

```sh
node scripts/portable.mjs --runtime-dir path/to/reviewed-runtime
node scripts/portable.mjs --verify dist/wardnote-VERSION-portable-win-x64
```

Replace `VERSION` with the current application version when verifying. The builder creates the versioned `portable-win-x64` directory, ZIP, ZIP checksum, `portable-manifest.json` and `runtime/node/provenance.json`. Preserve the complete original Node license and its bundled third-party notices. Only the executable and licensing/checksum evidence are added to the allowlisted source package; npm, tests' browser profiles, private configuration and clinical data are not copied. The official upstream ZIP is a private verification input, not duplicated in the delivered portable ZIP. These checks establish matching bytes from official HTTPS resources; independent upstream release-signature verification is not claimed.

Validate the package with its **bundled runtime** and an isolated fictional-data directory. Confirm startup with no working `NOTE_NODE`, configured external Node or Node on PATH, exact version, fixed selected port, shutdown and preserved data. Exercise modified/incomplete runtime rejection separately. This rehearsal does not replace a physical clean computer, older OS, local security-policy or low-resource-device test.

先生成并核验源码包，再用独立打包脚本添加已核验的官方运行时及完整许可。源码、Windows 便携、静态 PWA 三类包分别交付，各附 SHA-256；均不包含患者资料。构建、校验、隔离启动通过只代表本机工程验证，首次用户和低配置实机使用仍待发布后综合反馈。更换 Node 版本必须重新审查官方来源、全部固定校验值、许可证、操作系统兼容性与启动检查。

### Development checks

From `app/`, run `npm ci --ignore-scripts`, `npm test`, `npx playwright install chromium` and `npm run test:browser`. The browser command runs the clinical workflow, auxiliary-panel and eight-language suites against isolated fictional records and local service mocks. It requires no production configuration or provider credentials.

The CI matrix runs `npm test`, publication checks, source packaging and packaged-source tests on Windows, Linux and macOS. Linux also installs the locked browser tools and runs all browser suites configured in `app/package.json`. Failure artifacts contain only synthetic test evidence and expire after three days. Tests guard against accidentally narrowing the core suite or dropping required release files. The current local evidence is documented in [VALIDATION.md](VALIDATION.md); the existence of a workflow file does not mean hosted CI has passed.

## Public repository setup

1. Create the intended GitHub repository only after the owner authorizes publication. This preparation step does not do so.
2. Initialize Git in the generated source directory, review staged files and make the first commit. Use a public or GitHub-provided no-reply identity of your choice.
3. Enable GitHub private vulnerability reporting before announcing the repository; `SECURITY.md` describes that channel. If unavailable, establish a private maintainer channel first.
4. Push the reviewed source and let CI run. Investigate failures before tagging a release. CI has no deployment step, production secret or patient-data requirement.
5. Publish an annotated version tag and mark the release **pre-release**. Include the source, Windows x64 portable and static PWA ZIPs, all three SHA-256 sidecars, supported environments and known limits.

The current [source-available license](../LICENSE) permits independent personal noncommercial activity within its terms; all institutional and commercial use requires prior written permission from Junhui Liu M.D. Contact junhuiliu1025@gmail.com or the official repository once published. Preserve third-party notices and earlier granted rights; see [scope](../LICENSES/README.md). The historical license texts are not new blanket grants. No repository URL is invented.

## Updates

### Browser and PWA update behavior / 浏览器与 PWA 更新行为

0.6.15 在启动、返回前台或恢复网络时检查同源程序文件，页面前台运行时每 5 分钟检查；登录页和设置页提供手动「检查更新」。发现新版后提示，由使用者选择「稍后」或「保存并更新」，不会因检查完成而强制刷新。只有待保存记录成功写入，且没有活动录音、尚未完成的异步提交、弹窗或其他同地址窗口时才允许应用；任一保护检查失败都保留当前页面，按提示处理后再试。检查只请求程序文件，不上传患者数据或录音，不启用资料同步，也不改变联网授权。

Version 0.6.15 checks same-origin program files at startup, when returning to the foreground or reconnecting, and every five minutes while visible. Manual checks are available before login and in Settings. An available update is offered for Later or Save and update; detecting it does not force a refresh. Application requires successful pending saves, no active recording, unfinished asynchronous submission, open dialog or other app window at the same address. A failed safety check keeps the current page in place for the user to resolve and retry. Update checks request program files only, upload no patient records or audio, and neither enable data sync nor alter connection authorization.

候选版本程序缓存不完整时，「重新下载更新」仅重新获取该候选的程序文件，保留患者资料和当前页面，不自动应用。Download update again repairs an incomplete candidate program cache only; it preserves patient data and the current page, and does not automatically apply the update.

很旧的已打开页面没有更新提示组件时，需一次性结束并保存录音、确认文字保存成功，关闭同地址全部旧浏览器/PWA 窗口后重开原地址。不能用清除站点数据、删除账号或重建工作区来解决程序缓存问题。仅刷新一个仍被旧服务工作线程控制的页面，未必完成这次迁移。

For a very old open page without update controls, finish and save recording, confirm text is saved, close every old browser/PWA window at the same address, and reopen the original address once. Do not clear site data, delete accounts or recreate workspaces to fix program caching. Reloading one page while the old worker still controls open clients may not complete this transition.

### Deploy a complete release / 完整版本部署

所有程序资源、版本号和服务工作线程必须来自同一已核验交付包。先在独立目录完整解压并校验；本机服务停止后更换程序，静态服务器以已准备目录进行整体切换。不要在正在公开提供的目录中逐个上传或替换文件，以免浏览器下载到混合版本。保留原地址、患者数据和私有配置；部署方应在合成资料环境验证版本提示、保存与离线重开后再安排使用者更新。

All assets, version identifiers and the service worker must come from the same verified package. Extract and verify a complete separate directory first. Stop a local service before replacing its program; switch a static host to the prepared directory as a complete release. Do not upload or replace files one by one in a live serving directory, which can expose mixed versions. Keep the original origin, clinical data and private configuration. Rehearse update notices, saving and offline reopen with synthetic records before arranging user updates.

Change `app/package.json`, `app/public/domain.js` and the service-worker shell cache version together; update the lockfile, current documentation, changelog and validation report. Historical evidence retains the version actually tested. For 0.5.3 → 0.6.3, preserve the existing personal server database and private configuration. Server startup adds encrypted sync/authorization tables and a separate institutional database. Existing clinical content remains unchanged. The new default browser workspace starts empty; import only selected old server records through explicit connection. Do not delete browser site data during upgrades. See [migration](OFFLINE-AND-ACCOUNTS.md). End recordings and wait for saves before stopping/restarting a local service. Keep an encrypted backup before a later version that changes stored data.

### Update and rollback procedure / 升级与回退步骤

1. Make and independently verify an encrypted backup of the current device account; back up each server workspace actually in use and preserve private configuration separately. Retain the previous verified source package and checksum. A source ZIP or service-worker cache does not contain the patient's data.
2. End and save recording, resolve pending edits and close dialogs. Close other WardNote browser/PWA windows before applying an update; do not bypass an unsaved-work warning. Stop the local server before replacing its source files.
3. Replace only program files from a verified package. Preserve `data/`, private configuration and browser site storage. Start the service at the same origin and apply the prepared update only when the interface confirms it is ready.
4. Confirm the displayed version, offline reopen, existing accounts, sample records/review state, source links and retained audio. Actual completed rehearsal scope is recorded in [VALIDATION.md](VALIDATION.md).
5. If rollback is necessary, first preserve a fresh backup and the failed version's evidence. Close **all** WardNote windows and stop the service, restore the verified previous program package, restart and recheck the same data. Do not replace current records with an older backup. Restore a data backup only into a separate destination/account, then compare it before deciding what to use.

1. 先独立核验当前本机账号的加密备份；实际使用的各服务端工作区分别备份，私有配置单独保留。保留上一版经校验的源码包和校验值；源码包、离线资源缓存均不包含患者数据备份。
2. 结束并保存录音、处理待保存内容、关闭对话框；应用更新前关闭其他 WardNote 浏览器/PWA 窗口。保存未完成时不要绕过提示；替换本机服务程序前停止服务。
3. 只替换经校验的程序文件，保留 `data/`、私有配置及浏览器站点存储；在原地址重启，并在界面允许时应用已准备的更新。
4. 核对版本、脱机重开、原账号、抽样记录及核对状态、来源和原声。实际演练范围见[验证报告](VALIDATION.md)。
5. 需要回退时，先保留最新备份和失败证据；关闭**全部** WardNote 窗口并停服务，换回已核验的旧程序包，重启后再次核查资料。不得用旧备份直接覆盖当前数据；确需恢复备份时，先恢复到独立目的目录/新账号进行比较。

The local 2026-10-18 launcher/server rehearsal ran actual 0.6.11 → 0.6.12 → 0.6.11 source packages against isolated fictional personal and institutional encrypted databases. Startup/shutdown, reported versions and preserved record/revision/audio hashes passed. This is server/source rollback evidence, separate from the browser service-worker checks in the validation report; it does not establish compatibility with every future database format. Version 0.6.11 and earlier workers do not have the new waiting/confirmation behavior, so rolling back to them requires all app windows to be closed first. Cached previous program resources are a limited recovery aid, not an automatic downgrade facility or a backup of records. A source rollback cannot recover unsaved audio or edits.

2026-10-18 已使用实际 0.6.11 → 0.6.12 → 0.6.11 程序包和隔离的个人／机构虚构加密数据库完成本机启动器/服务端演练，启动停止、返回版本及记录/修改历史/音频散列保持检查通过。这属于服务端与源码回退证据，与验证报告中的浏览器离线资源更新检查分开；不代表未来任意数据格式均可逆向兼容。0.6.11 及更早的离线资源程序没有新的等待/确认机制，回退至这些版本前必须先关闭全部 App 窗口。保留的旧程序缓存仅为有限恢复辅助，不是自动降级功能或患者资料备份；程序回退也无法恢复未保存的录音和文字。

## 中文提示

仅发布 `dist/` 生成的独立源码目录或ZIP，勿将本地项目根目录直接全部上传。当前脚本不会创建仓库、提交到GitHub或启用远程功能。首次公开前须选择实际仓库、核对已确认的署名和许可、启用私密漏洞报告，并查看真实CI结果。

## 0.6.15 easy deployment / 便捷部署

See [Easy deployment / 个人与管理员向导](EASY-DEPLOYMENT.md). Windows uses `Start-WardNote.cmd`; mobile/PWA uses the separately packaged static site on a trusted HTTPS origin. The offline administrator wizard prepares configuration only. No public hosting or real-device/clinical validation was performed.

### Optional static PWA asset

From the source root after verification:

```powershell
node scripts/deploy-static.mjs --zip
node scripts/deploy-static.mjs --verify dist/wardnote-0.6.15-static-pwa
```

This creates a third ZIP and SHA-256 sidecar. The package includes an offline `admin-setup.html`; only its `site/` directory is deployed to a dedicated trusted HTTPS origin at `/`. The generated configuration does not publish a site or obtain a certificate. Never host a full source/delivery folder containing data or configuration.
