# 构建与复核 / Build and verification

Android **0.1.2-preview** · 2026-10-23

普通使用者安装交付 APK 即可，不需要安装以下开发工具。本页用于重建源码、重复检查和维护升级签名。 / End users install the delivered APK; they do not need these development tools. This page supports rebuilding, repeating checks and preserving upgrade-signing identity.

## 工具与目录 / Tools and locations

本轮使用 Windows、Node.js **24**、Microsoft OpenJDK **17.0.20.1+1**、Android SDK Platform **35**（revision 2 / extension 13）、Build Tools **35.0.0**、Command-line Tools **22.0**。Java 源码目标为 Java 8，APK 最低 API 26、目标 API 35。构建脚本直接调用官方 `aapt2`、`javac`、D8、`zipalign` 和 `apksigner`，不要求 Gradle 或 Android Studio。

This build uses Windows, Node.js **24**, Microsoft OpenJDK **17.0.20.1+1**, Android SDK Platform **35** (revision 2 / extension 13), Build Tools **35.0.0**, and Command-line Tools **22.0**. Java source targets Java 8; the APK targets API 35 with minimum API 26. Scripts invoke official `aapt2`, `javac`, D8, `zipalign` and `apksigner` directly; Gradle and Android Studio are not required.

工具下载来源、实际版本和归档 SHA-256 见 [toolchain-provenance.json](../logs/toolchain-provenance.json)。工具及其许可不由本项目重新授权；请从 [Microsoft OpenJDK](https://learn.microsoft.com/en-us/java/openjdk/download) 和 [Android 开发者工具](https://developer.android.com/studio#command-line-tools-only)取得并按其条款安装 SDK。源码包不携带 JDK、SDK、浏览器、Playwright 或签名私钥。

Download sources, versions and archive SHA-256 values are recorded in [toolchain-provenance.json](../logs/toolchain-provenance.json). Obtain the tools from [Microsoft OpenJDK](https://learn.microsoft.com/en-us/java/openjdk/download) and [Android developer tools](https://developer.android.com/studio#command-line-tools-only), under their own terms. The source package does not include the JDK, SDK, browser, Playwright or signing private key.

构建脚本默认读取项目旁的 `wardnote-android-buildtools` 文件夹，其结构为： / The default tool folder is `wardnote-android-buildtools` beside the project:

```text
wardnote-android-buildtools/
  jdk/jdk-17.0.20.1+1/bin/java.exe
  sdk/platforms/android-35/android.jar
  sdk/build-tools/35.0.0/...
  private-signing/                  # 私有，不得打包 / private, never distribute
  tmp/
```

本轮工具、缓存、临时文件和私有签名材料存放于 D 盘。源码构建产生的 `build/android` 可以重新生成，脚本仅清理其自身构建子目录；患者数据不应放在源码或构建目录内。

This run keeps tools, caches, temporary files and private signing material on D:. `build/android` is disposable generated output; the script cleans only its own build subdirectory. Patient data must not be stored in the source or build directory.

## 自动检查 / Automated checks

在解压后的独立 Android 源码根目录打开 **PowerShell 7**（`pwsh.exe`）。需要 Node.js 24、JDK 17、Python 3 和已安装的 Chrome/Chromium。`npm ci` 安装开发检查工具，首次安装依赖需要联网，此要求不影响交付 APK 首次脱机使用。Python 3 仅用于公开文件检查和源码打包。

Open **PowerShell 7** (`pwsh.exe`) in the extracted standalone Android source root. Use Node.js 24, JDK 17, Python 3 and an installed Chrome/Chromium. `npm ci` installs development check tools and requires connectivity for the first dependency installation; this does not affect the delivered APK's offline first use. Python 3 is used only for public-file checks and source packaging.

```powershell
# 替换为已有 JDK 17 位置 / Replace with your installed JDK 17.
$env:WARDNOTE_JAVA_HOME = 'D:\your-development-tools\jdk-17'
$env:NOTE_BROWSER_EXECUTABLE = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm ci --ignore-scripts --no-audit --no-fund
node scripts/check-ci-config.mjs
npm run test:all
python scripts/package-preview.py --check
python -m unittest discover -s tests -p test_public_package.py -v
python scripts/package-preview.py
```

`package-lock.json` 固定 Playwright **1.62.1** 和依赖完整性；`--ignore-scripts` 禁止安装生命周期脚本。Playwright 仅用于开发检查，不包含在 APK 中。已有模块可用 `NOTE_PLAYWRIGHT_MODULE` 指定绝对路径，版本应与锁文件相符。`NOTE_BROWSER_EXECUTABLE` 可覆盖默认 Chrome 路径；`WARDNOTE_POWERSHELL` 可指定 `pwsh.exe` 的绝对路径。这些环境变量只影响当前终端和子进程，不需永久修改系统设置。

`package-lock.json` pins Playwright **1.62.1** and dependency integrity; `--ignore-scripts` disables installation lifecycle scripts. Playwright is for development checks and is not included in the APK. Set `NOTE_PLAYWRIGHT_MODULE` to an existing module's absolute path if needed, using the locked version. `NOTE_BROWSER_EXECUTABLE` overrides the default Chrome path; `WARDNOTE_POWERSHELL` can specify an absolute `pwsh.exe` path. These settings affect only the current terminal and child processes, without permanent system changes.

测试入口先核验[历史基线](../tests/fixtures/README.md)的压缩包及每个文件的 SHA-256，再安全解压至 `.test-baseline/`：浏览器/PWA 0.6.15 UI r1 共 **55** 个原文件，Android 0.1.1 共 **57** 个 `web/` 原文件。来源和原许可随基线保存。无需维护者电脑上的旧目录，不下载未公开仓库，不读取真实账号或患者资料；拒绝链接路径和覆盖内容不同的已有基线文件。

The entry verifies archive and per-file SHA-256 values for the [historical fixtures](../tests/fixtures/README.md), then safely extracts them under `.test-baseline/`: **55** unchanged browser/PWA 0.6.15 UI r1 files and **57** unchanged Android 0.1.1 `web/` files. Source identity and original licenses accompany the fixtures. Tests require neither a maintainer's old folders nor an unpublished repository and do not read real accounts or patient data. Linked paths and overwriting different baseline content are refused.

`npm run test:all` 顺序运行 **15 项核心检查、18 项桌面浏览器流程和 3 项持久化升级模拟**。核心检查中的一个用例包含 DocumentGuard 的 10 个故障情景，不重复计数。可分别运行 `npm test`、`npm run test:browser`、`npm run test:upgrade`。合成数据使用独立临时地址、浏览器配置及原生桥接测试替身。**这些是宿主机检查，不是 Android 模拟器、真机或临床验证。**

`npm run test:all` sequentially runs **15 core checks, 18 desktop browser workflows and 3 persistent-profile upgrade simulations**. One core test contains 10 DocumentGuard fault scenarios, not additional top-level tests. Run `npm test`, `npm run test:browser` or `npm run test:upgrade` separately if needed. Synthetic data uses isolated local addresses, browser profiles and a native-bridge test double. **These are host checks, not Android emulator, real-device or clinical validation.**

高级复核可设置 `WARDNOTE_BASE_WEB` 和 `WARDNOTE_PREVIOUS_ANDROID_WEB`，分别指向未修改的浏览器 0.6.15 UI r1 和 Android 0.1.1 静态资源；不要指向当前 Android 的 `web/`。默认使用已核验的随包基线。

Advanced checks may override `WARDNOTE_BASE_WEB` and `WARDNOTE_PREVIOUS_ANDROID_WEB` with unchanged browser 0.6.15 UI r1 and Android 0.1.1 assets. Do not point either variable at the current Android `web/` directory. Verified bundled fixtures are the default.

### GitHub 检查布局 / GitHub check layout

[Android 工作流](../.github/workflows/android-ci.yml)以**独立 Android 源码根目录作为仓库根目录**：根下直接存在 `package.json`、`android/`、`web/`、`scripts/` 和 `.github/`。不要只把工作流复制到浏览器/PWA 根目录而不调整工作目录。后续如采用合并仓库，需配置 Android 子目录并复核打包路径；当前不创建仓库。

The [Android workflow](../.github/workflows/android-ci.yml) expects the **standalone Android source root to be the repository root**, directly containing `package.json`, `android/`, `web/`, `scripts/` and `.github/`. Do not copy only the workflow into a browser/PWA repository without adapting its working directory. A future combined repository must configure the Android subdirectory and verify packaging paths. No repository is created now.

工作流使用 Windows 2022、固定 SHA 的 checkout/setup-node、Node.js 24，以及 runner 中核验后的 JDK 17、Chrome、SDK Platform 35 和 Build Tools 35.0.0，工具来源参见 [GitHub 官方 Windows runner 清单](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md)。工作流文件采用合法 YAML 的 JSON 子集，`check-ci-config.mjs` 可无额外解析依赖核验本地配置。

The workflow uses Windows 2022, SHA-pinned checkout/setup-node, Node.js 24, and verified runner JDK 17, Chrome, SDK Platform 35 and Build Tools 35.0.0. See the [official Windows runner inventory](https://github.com/actions/runner-images/blob/main/images/windows/Windows2022-Readme.md). Its YAML file uses the JSON-compatible subset so `check-ci-config.mjs` can validate the local configuration without an additional parser dependency.

工作流先核验公开文件白名单并运行公开包边界的 12 项测试，再安装锁定开发依赖、运行回归、隔离构建并核验临时测试签名 APK，最后生成并回读核验 `source-r1.zip`。它只有代码读取权限，没有附件上传或发布步骤。`ci-android-build.ps1` 在独立临时目录生成新测试签名，结束后删除该签名、密码和临时 APK；不读取正式升级签名，也不覆盖交付 APK。可单独复现该步骤：

The workflow checks the public-file allowlist and runs 12 public-package boundary tests, installs locked tools, runs regression checks, builds and verifies an isolated test-signed APK, then creates and verifies `source-r1.zip` by readback. It has read-only repository permission and no upload or publication step. `ci-android-build.ps1` creates a disposable signing identity in an isolated temporary directory and deletes the key, password and temporary APK afterward. It neither reads the retained upgrade-signing identity nor replaces the delivered APK. To repeat that step:

```powershell
.\scripts\ci-android-build.ps1 -JavaHome 'D:\your-development-tools\jdk-17' -AndroidSdk 'D:\your-development-tools\android-sdk'
```

本轮本机已复现回归与隔离构建；**GitHub 托管工作流尚未运行**。首次获准建仓后仍需查看真实托管运行结果，不能把本地配置检查等同于 GitHub 成功运行。临时测试签名 APK 不能作为现有安装版的覆盖升级。

The regression checks and isolated build were reproduced on this host; **the GitHub-hosted workflow has not run**. Inspect its first actual result after repository creation is authorized. Local configuration checks do not establish successful hosted execution. A disposable test-signed APK cannot update an existing released installation.

## 生成与核验 APK / Build and inspect the APK

已具备上述工具时，运行： / With the tools installed, run:

```powershell
.\scripts\build-android.ps1 -ToolsDirectory 'D:\your-development-tools\wardnote-android-buildtools'
.\scripts\verify-android-apk.ps1 -ToolsDirectory 'D:\your-development-tools\wardnote-android-buildtools'
```

首次独立构建且**确实需要新的评估签名身份**时，可给构建命令加 `-CreatePreviewKey`。脚本将密钥和密码放在公开项目目录之外并限制文件访问权限。后续更新必须沿用原密钥；不要为每次构建生成新密钥。交付 APK 使用本项目保留的评估签名，源码包不含该私钥，因此其他人自行新签名的 APK 不能直接覆盖安装为该评估包的升级。

For a first independent build that **intentionally creates a new evaluation-signing identity**, add `-CreatePreviewKey`. The script stores the key and password outside the public project and restricts file access. Reuse that key for later updates; do not generate one per build. Delivered APKs use the project's retained evaluation signature. Its private key is not in the source package, so independently re-signed APKs cannot replace the delivered APK as a same-identity update.

输出为 `artifacts/wardnote-android-0.1.2-preview.apk` 及对应 `.sha256`。核验脚本检查应用标识、版本要求、无权限声明、签名、ZIP 对齐、资源逐字节一致性和私有文件排除，并更新 `logs/android-apk-verification.json`。这些是**宿主机上的包检查**，不证明 Android 已成功安装或硬件流程可用。

Outputs are `artifacts/wardnote-android-0.1.2-preview.apk` and its `.sha256`. The verifier checks identity, SDK requirements, absence of requested permissions, signature, ZIP alignment, byte-for-byte bundled-resource matching and private-file exclusion; it updates `logs/android-apk-verification.json`. These are **host-side package checks**, not proof of Android installation or hardware workflows.

重复构建可复现步骤和功能检查；ZIP 时间戳、工具变化及不同签名可能产生不同字节和散列，不声称位级可复现构建。最终分发时始终核对当前交付的校验文件。

The procedure and functional checks can be repeated; ZIP timestamps, tool changes and different signatures can produce different bytes and hashes. Bit-for-bit reproducibility is not claimed. Verify against the checksums of the actual delivery being distributed.

## 交付范围 / Delivery

本次发布候选目录 / Release-candidate folder: `Android-offline-preview-0.1.2-release-ready`。原 `Android-offline-preview-0.1.2` 目录保留不改。 / The original `Android-offline-preview-0.1.2` directory remains unchanged.

- `wardnote-android-0.1.2-preview.apk`：评估安装包 / evaluation installer.
- `wardnote-android-0.1.2-preview-source-r1.zip`：独立 Android 源码、发布说明及自动检查配置；r1 不改变 APK 字节和运行时版本 / standalone Android source, release material and automated-check configuration; r1 does not change APK bytes or the runtime version.
- 校验文件与验证记录：以交付清单为准 / checksums and evidence listed in the delivery manifest.

旧浏览器/PWA、冻结包、现有工作区和 C 盘模板继续保留。此过程不创建 GitHub 仓库，也不实际发布。 / Existing browser/PWA delivery, frozen packages, workspaces and C-drive templates remain preserved. This process neither creates a GitHub repository nor publishes the project.

后续授权发布时按[发布指南](RELEASING.md)筛选文件。公开自动检查只能使用临时测试签名，不能接收原升级私钥或密码；测试签名包不是官方升级。私有升级密钥须另行受保护备份并核验恢复，本机备份不等于异地容灾。 / Follow the [release guide](RELEASING.md) when publication is authorized. Public CI uses disposable test signing, never the retained upgrade key/password; test-signed packages are not official updates. Privately back up and verify recovery of the upgrade key; a local copy is not off-device disaster recovery.

## 0.1.2 更新回归 / Upgrade regression

默认运行 `npm run test:upgrade`，入口自动使用随包保留的 Android 0.1.1 静态资源。它使用独立持久化桌面 Chromium 配置模拟旧资源到新资源的冷重启，并检查两种账号模式和跨分卷音频；运行后清理自己的配置。它不是 APK 安装测试。原 0.1.1 APK 和源码 ZIP 仍需保留用于包级核对和追溯。

Run `npm run test:upgrade` to use the bundled Android 0.1.1 assets automatically. This uses an isolated persistent desktop Chromium profile to simulate a cold restart with updated assets and check both account modes and multi-part audio backups. It cleans its own profile; it does not install an APK. Retain the original 0.1.1 APK/source ZIP for package-level checks and provenance.

构建及包级升级核验 / Build and package-level update verification:

```powershell
.\scripts\build-android.ps1
.\scripts\verify-android-apk.ps1 -PreviousApk <path-to-retained-0.1.1-apk>
```

版本由 `package.json` 的 `version` 和 `androidVersionCode` 提供；保留既有签名密钥。不得以生成新密钥、卸载旧应用或清除数据处理升级失败。

Versions come from `version` and `androidVersionCode` in `package.json`. Preserve the signing key. Do not work around update failures by generating a new key, uninstalling the old app or clearing data.

自动测试中的 DocumentGuard 故障测试需要上述 JDK，默认使用相邻工具目录；可用 `WARDNOTE_JAVA_HOME` 指定已有 JDK。只编译生产保护模块及测试替身，不安装 Android 模拟器。 / The DocumentGuard fault test uses the JDK above; set `WARDNOTE_JAVA_HOME` to override its location. It compiles the production helper and test providers, without installing an emulator.
