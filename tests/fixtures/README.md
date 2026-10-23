# Historical regression assets / 历史回归基线

These archives contain only exact historical application assets, not accounts, patient information or recordings. They allow public CI to verify compatibility without downloading an unpublished repository or relying on a maintainer's private filesystem.

两份压缩包仅包含历史应用静态资源，不含账号、患者信息或录音。公开自动检查可直接使用这些基线，无需下载尚未公开的仓库或访问维护者电脑。

- `browser-0.6.15-ui-r1.zip`: 55 original browser/PWA public files, preserved byte-for-byte.
- `android-0.1.1-web.zip`: all 57 `web/` files from the retained Android 0.1.1 source archive.
- `manifest.json`: archive and per-file SHA-256, byte sizes, source archive hash where applicable, and license attribution.
- `LICENSE-browser-base.txt` and `LICENSE-android-0.1.1.txt`: exact source licensing notices. Copyright remains with Junhui Liu M.D.; no new license is granted by packaging these fixtures.

`scripts/prepare-test-baselines.ps1` verifies hashes and ZIP paths before extracting under `.test-baseline/`. It refuses linked paths and refuses to overwrite an existing file with different content. Fixtures are never bundled into the APK or used as patient data. The test fixtures are historical snapshots and are not runnable releases offered for clinical use.

准备脚本先核验散列和压缩路径，再解压至 `.test-baseline/`；拒绝链接路径或覆盖内容不同的已有文件。基线不进入 APK，不作为患者数据，也不是供临床使用的独立发布版本。
