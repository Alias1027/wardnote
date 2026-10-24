# WardNote 浏览器与手机脱机版

部署方完成一次 HTTPS 配置后，医生只需打开一个网址；电脑和手机均可在浏览器内使用，浏览器支持时可安装为渐进式 Web 应用（Progressive Web App, PWA）。本包为设备本地保存的静态版本（static deployment），不含服务器数据库、服务器账号同步、云端识别或外部发送接口。

## 医生如何开始

1. 在普通浏览器窗口打开部署方提供的 **HTTPS 网址**。不要直接打开 ZIP 内的 `index.html`，也不要在手机上填写电脑的 `127.0.0.1`。
2. 第一次保持连接，在登录页打开“设备与脱机状态”，等程序资源准备完成。使用虚构资料创建本机账号，保存一条记录，再关闭网络并重新打开同一网址，确认可登录、阅读和新增记录。
3. 浏览器提供安装入口时，可选择安装／添加到主屏幕。iPhone 可在 Safari 共享菜单使用“添加到主屏幕”，具体名称取决于系统版本。安装入口不出现时，仍可直接用浏览器。安装不是本包自动完成的操作。
4. 结束录音并确认保存后再锁屏或关闭程序。定期下载完整加密备份，并在设置中核验全部分卷与清单；清除浏览器数据可能清除本机资料。相同账号名在不同浏览器、设备或网址下并不会自动同步。换设备或网址先备份，再恢复并核验。

真实手机安装、操作系统后台／锁屏录音、机构正式使用和临床有效性须另行验证。桌面浏览器的手机尺寸测试不能替代真实手机验收。首次下载及更新程序需要访问静态站点，站点服务方可以看到网络连接信息；本机记录与录音不在本包中，也不会因为打开页面而自动上传。

## 首选：已有可信 HTTPS 静态站点

把本包 **`site` 文件夹内的内容** 放到专用站点的根目录，例如 `https://notes.example.org/`。站点可在院内或受控网络中，不要求公开互联网可访问。普通用户无需安装 Node.js，无需数据库，也无需填写 API 密钥。

- 必须使用独立来源（origin）和根路径 `/`；`https://example.org/wardnote/` 这样的子路径不受支持。程序使用根路径资源和 Service Worker 作用域；与其他应用共用同一来源不合适。
- 设备必须信任 HTTPS 证书。普通局域网 HTTP 和“忽略证书警告”不能作为手机 PWA 部署方案。院内证书须由管理员在目标设备建立信任。
- 按 `static-headers.json` 配置响应头；`site/_headers` 为支持此格式的静态托管平台提供同一配置。平台若不支持 `_headers`，必须在平台或 Web 服务器中配置，不能只上传文件就认定响应头生效。
- HTML、JS、CSS、SVG、PNG、Web App Manifest 必须返回正确 MIME 类型；JS 为 `text/javascript`，Manifest 为 `application/manifest+json`。程序文件按 `Cache-Control: no-cache` 重新验证，离线可用由 Service Worker 控制；不要给 `sw.js` 设置长期不可变缓存。
- `/api` 与 `/api/*` 返回 404；不启用把任意路径回退到 `index.html` 的 SPA rewrite，不添加其他后端代理。禁用目录列表、访问统计脚本和 HTML 注入；本包没有外部 CDN 依赖。
- 仅发布 `site`；不要把完整源码包、个人工作区、加密备份、录音、配置或日志设为站点根目录。更新时先在独立目录校验完整新版，再一次切换站点目录；不得在正在服务的目录逐文件覆盖，以免混用新旧资源。保持原网址不变，不要清除用户浏览器数据。程序发现新版会提示；登录和设置页可手动“检查更新”。极旧页面若尚无此入口，结束录音并确认保存后，关闭同地址全部浏览器／PWA 窗口再重新打开。

Update deployment: verify the complete new release in a separate directory, then switch the site directory atomically. Never overwrite a live release file by file. Keep the same origin and preserve browser storage. The login and Settings pages offer a manual update check; updates prompt the user before applying. For a legacy page without this control, finish recording, confirm saving, close all browser/PWA windows at that origin, and reopen. Do not clear site data.

## 可选：已安装 Caddy 的管理员

本包含 `Caddyfile`，只运行静态文件服务。先取得自己控制的域名，确认 DNS 指向服务器、证书签发条件和网络访问已满足。在解压后的包根目录设置域名后运行：

```powershell
$env:WARDNOTE_DOMAIN = 'notes.example.org'
caddy run --config Caddyfile --adapter caddyfile
```

Linux / macOS 管理员可使用：

```sh
WARDNOTE_DOMAIN=notes.example.org caddy run --config Caddyfile --adapter caddyfile
```

这是前台服务，终端结束会停止；持续运行、开机启动、域名及证书生命周期由部署方管理。公共域名通常需要 DNS 指向正确服务器、端口 80/443 可到达且无占用。内部域名的本地 CA 证书不会自动得到所有手机信任；证书和网络条件不能由压缩包自动解决。本次交付没有购买域名、创建托管账号、开放端口或部署公开站点。

## 发布与本机验证

维护者在源码包根目录运行 `node scripts/deploy-static.mjs --zip` 生成静态包；可选 `--origin https://notes.example.org/` 记录目标地址并检查根路径条件。导出只读取显式公开文件清单，校验依赖、Service Worker 缓存清单和静态配置；已有输出不会被覆盖。

维护者仍在完整源码包根目录验证导出包：`node scripts/deploy-static.mjs --verify <静态包目录>`。这个校验脚本属于源码包，不包含在静态站点包内。核对 `static-manifest.json` 中的版本与文件 SHA-256，并检查全部 `SHA256SUMS.txt` 以及 ZIP 外的 `.sha256`。SHA-256 用于检测内容改变，不等同于发布者数字签名。

维护者在源码包根目录进行本机检查：`node scripts/deploy-static.mjs --preview <静态包目录>`，按控制台显示的 `http://127.0.0.1:4173/` 打开。此测试服务只监听本机，不创建临床服务器数据库。它依赖维护者的 Node.js，不是手机共享服务，也不能验证公开证书或真实手机安装。静态包中的 `admin-setup.html` 则可直接双击打开，无需 Node.js。

上线验收：在目标设备检查证书、根路径、MIME 和安全响应头，确认“设备与脱机状态”显示可用；完成虚构记录的保存、重新登录、离线重开、录音保存回听及加密备份／恢复。检查 `/api/status` 返回 404、联网按钮不可用、后台请求没有临床 API 发送，再向医生提供固定网址。

## 技术依据

- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)：Service Worker 需要安全上下文；本机 localhost 是开发例外。
- [Caddy: Automatic HTTPS](https://caddyserver.com/docs/automatic-https)：自动签发与续期的域名／网络条件、本地 CA 的设备信任要求。
- [Caddy: Response headers](https://caddyserver.com/docs/caddyfile/directives/header)：Caddyfile 响应头设置。
- [Apple: Add a website to the Home Screen](https://support.apple.com/guide/iphone/iph42ab2f3a7/ios)：Safari 主屏幕入口随系统版本的操作方式。

许可见随包 `LICENSE` 和 `NOTICE`；静态部署不会扩大个人非商业许可，机构使用须依许可取得授权。
