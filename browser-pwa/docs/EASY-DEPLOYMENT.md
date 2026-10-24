# WardNote 简单启动与 HTTPS 部署

医生日常使用有两条入口：个人电脑使用 Windows 离线包，解压后双击 `Start-WardNote.cmd`；手机／多台电脑打开部署方提供的固定 HTTPS 网址。后者由管理员一次性部署，每台设备分别保存本机工作区，不会因为账号名相同而自动同步。[从这里开始](../开始使用.html) 提供八语言离线说明。

## 个人电脑

Windows 便携包自带运行环境，完整解压后双击 `Start-WardNote.cmd`，启动面板会打开浏览器；可重新打开页面、查看帮助、手动创建桌面快捷方式及确认后停止。原 `启动应用.cmd` / `停止应用.cmd` 入口继续保留。关闭启动面板不等于停止服务；结束录音并确认保存后，再使用面板的停止按钮。基础记录无需 npm、模型或 API 密钥。

第一次保持本机服务运行，检查“设备与脱机状态”，用虚构资料完成首次保存和离线重开。源码包与便携包不同，源码包仍需 Node.js 24+；静态 PWA 包用于 HTTPS 站点，不包含 Windows 运行环境或启动面板。

## 院内或自有服务器：静态 PWA

打开 [离线 HTTPS 部署助手](../deployment/admin-setup.html)，输入专用域名，生成可审阅的 Caddyfile 和启动、检查命令。助手可双击打开，不联网、不请求密码、不创建站点。实际发布使用另行生成的 `wardnote-<版本>-static-pwa.zip`：解压后，助手和说明在包根，只有 `site` 文件夹部署到 HTTPS 站点根目录。

静态包保留默认脱机、设备加密账号、记录与本机录音、修改历史、核对流程、加密备份／恢复以及 PWA 资源；服务器同步、云端识别、模型调用和外部发送在此发行方式中不可用。普通医生访问站点无需安装 Node.js，站点也不需要 WardNote 后端或数据库。

可信 HTTPS、域名、网络访问和设备证书信任须由部署方准备。使用专用来源根路径，例如 `https://notes.example.org/`；不支持 `/wardnote/` 子路径。手机的 `127.0.0.1` 指向手机自身，不能作为电脑服务地址。本次交付不会自动创建托管账号、购买域名、开放端口或修改设备根证书。

完整文件结构、响应头、Caddy 命令、更新与实际设备验收步骤见 [静态 PWA 部署说明](../deployment/STATIC-PWA.md)。本机预览与浏览器手机尺寸测试只证明相应测试路径，真实手机安装、PWA 独立模式和锁屏／后台录音仍需在目标设备验收。机构使用依项目许可取得授权。

## 可选完整后端

需要服务器同步或配置外部服务时，应另行采用现有 [部署说明](DEPLOYMENT.md) 和 [基础设施说明](INFRASTRUCTURE.md)，执行完整后端的配置及授权流程。当前后端非回环访问要求直接 TLS 与 `publicOrigin`；不要直接套用其他项目的 HTTP 反向代理例子。

这次入口设计参考了同工作区 Headache Diary 的“个人开始使用 / 管理员部署”分层。该项目的回环反向代理实现没有移植到 WardNote；本次路线为可单独静态托管的设备本地工作区。

## English guide

For a personal Windows computer, extract the portable package completely and double-click `Start-WardNote.cmd`. Its panel opens the browser and offers reopen, help, optional desktop shortcut creation and a confirmed stop action. Closing the panel alone does not stop the service; finish recordings and saving before stopping it. The original Chinese launch/stop filenames remain available. The runtime is included; no npm, model download or API key is needed for local records. Source packages still require Node.js 24+; the static PWA package is for HTTPS hosting and includes neither a Windows runtime nor the launcher panel. Complete the device and offline readiness check before trying offline use.

For phones or computers using an institutional or self-hosted website, open the [offline HTTPS setup assistant](../deployment/admin-setup.html). It generates a Caddyfile and commands for review. It does not contact a host, run a service, install a certificate or request credentials. Build the static package with `node scripts/deploy-static.mjs --zip`; deploy only its `site` directory to a dedicated, trusted HTTPS origin at `/`. Existing static hosting is sufficient; no WardNote server, database or Node.js runtime is required on that host. The URL must remain stable. Subpath hosting and a phone opening the computer's `127.0.0.1` address are unsupported.

The static profile retains encrypted device accounts, local records and audio, revision/review workflows, encrypted backup and restore, and offline PWA resources. Server synchronization, external model/transcription services and sending are unavailable. The same username on another browser or device is a separate workspace; move data using verified encrypted backups. Initial application downloads and updates still contact the static host.

The administrator provides the domain, reachable HTTPS service and device certificate trust. Test on the actual target phones: save and reopen synthetic records, record and replay audio, reload offline, verify and restore backups, then optionally install the PWA using the browser's supported menu. Automated desktop and narrow-viewport checks do not establish actual phone installation, standalone PWA behavior, or background/locked-screen recording. Institutional use remains subject to the project license.

For optional backend capabilities, follow the existing [deployment](DEPLOYMENT.md) and [infrastructure](INFRASTRUCTURE.md) documentation. The full backend requires direct TLS plus `publicOrigin` for non-loopback access; the other project's reverse-proxy implementation has not been transplanted into WardNote.

### Browser installation references / 浏览器安装说明来源

[Apple: Turn a website into an app in Safari on iPhone](https://support.apple.com/guide/iphone/iphea86e5236/ios) · [Google Chrome: Use web apps on Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en). Consulted 2026-10-21; menu names and availability depend on the device/browser.
