# WardNote — Getting started / 开始使用

Version 0.6.15 · 2026-10-21 · 简体中文 / English / Español / Français / Русский / العربية / हिन्दी / اردو

[从这里开始 / Start here](../开始使用.html) · [部署向导 / Deployment guide](EASY-DEPLOYMENT.md)

## 简体中文

0.6.15：Windows 双击 `Start-WardNote.cmd`；在启动面板确认后停止。手机建议由管理员部署静态 PWA，设备本机保存；此发行版无服务器同步或云端识别接口。下文联网授权说明仅适用于完整后端版。

### 开始使用

**程序更新** — 启动、返回前台或恢复网络时会检查同一地址的程序文件；页面处于前台时每 5 分钟检查，也可在登录页或设置中选择「检查更新」。只请求程序文件，不上传记录或录音，不开启资料同步或联网授权。检查失败不代表当前版本已是最新。

发现新版时选择「稍后」可继续工作；选择「保存并更新」前先结束并保存录音、完成异步提交、关闭弹窗及其他 WardNote 浏览器/PWA 窗口。记录保存成功后才切换，失败则保留当前页面。很旧的页面没有更新入口时，确认记录与录音已保存，关闭同地址全部旧窗口，再重开原地址；**不要清除站点数据**。部署方须一次部署完整且版本一致的交付包，不能在公开目录逐个替换文件。

候选程序缓存不完整时，可选择「重新下载更新」；只修复程序资源，不清除患者资料，也不自动应用。

**Windows 一键启动、浏览器直接使用与 PWA 入口**

**Windows 启动** — Windows 离线包已包含运行环境，解压后双击启动脚本；源码包需先安装 Node.js 24+。基础记录无需下载模型或填写 API 密钥，使用说明随包提供。

**浏览器直接使用** — 启动本机服务后，在电脑浏览器打开下方地址，无需另装专用客户端。首次准备完成后，本机工作区可脱机记录。 `http://127.0.0.1:8787/`

**PWA 入口** — 已提供移动页面和 PWA 安装资源。浏览器提供安装能力时，设置页可显示安装入口，也可使用浏览器的安装或添加到主屏幕菜单；可用方式取决于浏览器和平台。

**仍需部署** — 手机访问电脑服务，需要部署方配置可访问的可信 HTTPS 地址。手机上的 127.0.0.1 指手机自身；HTTPS、网络访问及院方管理措施须另行配置。

**尚待验证** — 真实手机安装、独立 PWA 模式、后台或锁屏连续录音及医院正式部署尚待验证。不同设备上同名账号不会自动合并或同步资料。

首次试用请使用虚构资料。默认脱机，每次联网须单独授权；结束录音并确认保存后再停止服务。

## English

0.6.15: on Windows, double-click `Start-WardNote.cmd`; stop from the launcher after confirmation. For phones, the administrator can deploy the static PWA with device-local storage. That edition has no synchronization or cloud transcription API; connection authorization below applies only to the full backend.

### Getting started

**App updates** — Same-origin program files are checked at startup, on returning to the foreground or reconnecting, and every five minutes while visible. Choose Check for updates on the sign-in or Settings page for a manual check. Only program files are requested; records and audio are not uploaded, and data sync or network authorization is not enabled. A failed check does not establish that the current version is the latest.

Choose Later to keep working when an update is offered. Before Save and update, finish and save recording, complete asynchronous submissions, close dialogs and other WardNote browser/PWA windows. The app switches only after records save successfully; failure leaves the current page in place. If a very old page has no update control, confirm records and audio are saved, close all old windows at the same address and reopen it; **do not clear site data**. Deployment owners must publish one complete, consistent package rather than replace files one by one in a live directory.

If the candidate program cache is incomplete, choose Download update again. Only program resources are repaired; patient data are not cleared and the update is not applied automatically.

**One-click Windows launch, direct browser access and a PWA entry point**

**Windows launch** — The Windows offline package includes the runtime. Extract it and double-click the launcher; the source package requires Node.js 24+. Basic recording needs no model download or API key. Help is included in the package.

**Direct browser access** — After starting the local service, open the address below in your computer browser; no separate dedicated client is needed. Once initial preparation is complete, the device workspace supports offline notes. `http://127.0.0.1:8787/`

**PWA entry point** — Mobile layouts and PWA installation resources are included. When the browser exposes installation support, Settings can show an install entry; the browser may also offer an install or add-to-home-screen menu. Availability varies by browser and platform.

**Deployment still required** — Phone access to the computer service requires a reachable, trusted HTTPS address configured by the deployment owner. On a phone, 127.0.0.1 refers to that phone. HTTPS, network access and institutional controls require separate setup.

**Validation pending** — Installation on physical phones, standalone PWA mode, continuous background or lock-screen recording and hospital production deployment remain unvalidated. Identical account names on different devices do not automatically merge or synchronize data.

Use fictional data for initial evaluation. The default is offline; each connection requires separate authorization. End recordings and confirm saving before stopping the service.

## Español

0.6.15: en Windows, abra `Start-WardNote.cmd`; detenga desde el panel tras confirmar. Para teléfonos, el administrador puede desplegar la PWA estática con almacenamiento local. Esa edición no ofrece sincronización ni transcripción en la nube; la autorización de conexión siguiente solo aplica al backend completo.

### Primeros pasos

**Actualizaciones de la aplicación** — Se comprueban los archivos del programa del mismo origen al iniciar, al volver al primer plano o recuperar la conexión, y cada cinco minutos mientras la página está visible. Puede buscar actualizaciones manualmente desde el inicio de sesión o Ajustes. No se envían registros ni grabaciones, ni se activan la sincronización o la autorización de conexión. Una comprobación fallida no confirma que la versión sea la más reciente.

Seleccione Más tarde para seguir trabajando. Antes de guardar y actualizar, termine y guarde la grabación, complete los envíos pendientes y cierre los diálogos y las demás ventanas de WardNote. La actualización solo se aplica tras guardar correctamente; si falla, la página actual permanece abierta. Si una página muy antigua no ofrece este control, confirme que todo esté guardado, cierre todas las ventanas antiguas de la misma dirección y vuelva a abrirla; **no borre los datos del sitio**. El responsable del despliegue debe publicar un paquete completo y coherente, sin sustituir archivos uno a uno en el directorio activo.

Si la caché del programa pendiente está incompleta, vuelva a descargar la actualización. Solo se reparan los archivos del programa; no se borran datos de pacientes ni se aplica la actualización automáticamente.

**Inicio con un clic en Windows, acceso directo desde el navegador y opción PWA**

**Inicio en Windows** — El paquete sin conexión para Windows incluye el entorno de ejecución. Extráigalo y haga doble clic en el iniciador; el paquete de código fuente requiere Node.js 24+. El registro básico no necesita descargar modelos ni claves de API. La ayuda se incluye en el paquete.

**Acceso directo desde el navegador** — Tras iniciar el servicio local, abra la dirección siguiente en el navegador del ordenador; no necesita un cliente específico. Una vez completada la preparación inicial, el espacio de trabajo del dispositivo permite registrar notas sin conexión. `http://127.0.0.1:8787/`

**Acceso PWA** — Se incluyen diseños móviles y recursos de instalación PWA. Si el navegador ofrece soporte de instalación, Ajustes puede mostrar una opción de instalación; el navegador también puede ofrecer instalar o añadir a la pantalla de inicio. La disponibilidad depende del navegador y la plataforma.

**Despliegue pendiente** — El acceso desde el teléfono al servicio del ordenador requiere una dirección HTTPS accesible y de confianza, configurada por el responsable del despliegue. En un teléfono, 127.0.0.1 se refiere al propio teléfono. HTTPS, el acceso de red y los controles institucionales requieren configuración adicional.

**Validación pendiente** — La instalación en teléfonos reales, el modo PWA independiente, la grabación continua en segundo plano o con la pantalla bloqueada y el despliegue hospitalario en producción siguen sin validarse. Los nombres de cuenta idénticos en distintos dispositivos no fusionan ni sincronizan datos automáticamente.

Utilice datos ficticios para la evaluación inicial. El modo predeterminado es sin conexión; cada conexión requiere autorización independiente. Finalice las grabaciones y confirme que se han guardado antes de detener el servicio.

## Français

0.6.15 : sous Windows, ouvrez `Start-WardNote.cmd` ; arrêtez depuis le panneau après confirmation. Sur téléphone, l’administrateur peut déployer la PWA statique avec stockage local. Cette édition ne propose ni synchronisation ni transcription cloud ; l’autorisation de connexion ci-dessous concerne le backend complet.

### Bien démarrer

**Mises à jour de l’application** — Les fichiers du programme de même origine sont vérifiés au démarrage, au retour au premier plan ou après reconnexion, puis toutes les cinq minutes lorsque la page est visible. Une vérification manuelle est disponible sur les pages de connexion et de paramètres. Aucun dossier ni enregistrement audio n’est envoyé ; ni la synchronisation ni l’autorisation de connexion ne sont activées. Une vérification échouée ne confirme pas que la version est à jour.

Choisissez Plus tard pour continuer à travailler. Avant d’enregistrer et de mettre à jour, terminez et sauvegardez l’enregistrement audio, attendez la fin des envois et fermez les dialogues et les autres fenêtres WardNote. Le changement ne se fait qu’après une sauvegarde réussie ; en cas d’échec, la page actuelle reste ouverte. Si une très ancienne page ne propose pas ce contrôle, confirmez la sauvegarde, fermez toutes les anciennes fenêtres de la même adresse, puis rouvrez-la ; **n’effacez pas les données du site**. Le responsable du déploiement doit publier un paquet complet et cohérent, sans remplacer les fichiers un par un dans le dossier en service.

Si le cache du programme en attente est incomplet, téléchargez à nouveau la mise à jour. Seuls les fichiers du programme sont réparés ; aucune donnée patient n’est effacée et la mise à jour n’est pas appliquée automatiquement.

**Démarrage en un clic sous Windows, accès direct par navigateur et accès PWA**

**Démarrage sous Windows** — Le paquet Windows hors ligne inclut l’environnement d’exécution. Extrayez-le puis double-cliquez sur le lanceur ; le paquet source nécessite Node.js 24+. La saisie de base ne nécessite ni modèle à télécharger ni clé API. L’aide est fournie dans le paquet.

**Accès direct par navigateur** — Après avoir démarré le service local, ouvrez l’adresse ci-dessous dans le navigateur de l’ordinateur, sans client dédié à installer. Après la préparation initiale, l’espace de travail de l’appareil permet la saisie hors ligne. `http://127.0.0.1:8787/`

**Accès PWA** — Les mises en page mobiles et les ressources d’installation PWA sont fournies. Si le navigateur expose la fonction d’installation, les paramètres peuvent afficher un accès à l’installation ; le navigateur peut aussi proposer l’installation ou l’ajout à l’écran d’accueil. La disponibilité dépend du navigateur et de la plateforme.

**Déploiement encore nécessaire** — L’accès depuis un téléphone au service de l’ordinateur nécessite une adresse HTTPS accessible et reconnue comme fiable, configurée par le responsable du déploiement. Sur un téléphone, 127.0.0.1 désigne ce téléphone. HTTPS, l’accès réseau et les contrôles institutionnels doivent être configurés séparément.

**Validation en attente** — L’installation sur des téléphones physiques, le mode PWA autonome, l’enregistrement continu en arrière-plan ou écran verrouillé et le déploiement hospitalier en production restent à valider. Des noms de compte identiques sur différents appareils ne fusionnent ni ne synchronisent automatiquement les données.

Utilisez des données fictives pour l’évaluation initiale. Le mode par défaut est hors ligne ; chaque connexion nécessite une autorisation distincte. Terminez les enregistrements et confirmez leur sauvegarde avant d’arrêter le service.

## Русский

0.6.15: в Windows откройте `Start-WardNote.cmd`; остановите службу через панель после подтверждения. Для телефонов администратор может развернуть статическую PWA с локальным хранением. В ней нет API синхронизации или облачной транскрипции; разрешение подключения ниже относится только к полной серверной версии.

### Начало работы

**Обновления приложения** — Файлы программы с того же адреса проверяются при запуске, возврате на передний план или восстановлении сети, а также каждые пять минут, пока страница видима. Ручная проверка доступна на странице входа и в настройках. Записи и аудио не отправляются; синхронизация и разрешение сетевой обработки не включаются. Неудачная проверка не означает, что версия актуальна.

Выберите «Позже», чтобы продолжить работу. Перед сохранением и обновлением завершите и сохраните аудиозапись, дождитесь окончания отправки, закройте диалоги и остальные окна WardNote. Переход возможен только после успешного сохранения; при ошибке текущая страница остаётся открытой. Если в очень старой странице нет этой функции, подтвердите сохранение, закройте все старые окна с тем же адресом и откройте его заново; **не очищайте данные сайта**. Ответственный за развёртывание должен публиковать полный согласованный пакет, не заменяя файлы по одному в работающем каталоге.

Если кэш ожидающей версии неполон, скачайте обновление заново. Восстанавливаются только файлы программы; данные пациентов не удаляются, и обновление не применяется автоматически.

**Запуск в Windows одним нажатием, доступ через браузер и вход в PWA**

**Запуск в Windows** — Автономный пакет Windows включает среду выполнения. Распакуйте его и запустите двойным щелчком; пакет исходного кода требует Node.js 24+. Для основных записей не нужны загрузка модели или ключ API. Справка включена в пакет.

**Прямой доступ через браузер** — Запустите локальный сервис и откройте указанный ниже адрес в браузере компьютера; отдельный клиент не требуется. После первоначальной подготовки рабочая область устройства поддерживает записи без сети. `http://127.0.0.1:8787/`

**Вход в PWA** — Мобильная вёрстка и ресурсы установки PWA включены. Если браузер предоставляет возможность установки, в настройках может появиться соответствующая кнопка; браузер также может предлагать установку или добавление на главный экран. Доступность зависит от браузера и платформы.

**Требуется развёртывание** — Для доступа с телефона к сервису компьютера ответственный за развёртывание должен настроить доступный доверенный HTTPS-адрес. На телефоне 127.0.0.1 обозначает сам телефон. HTTPS, сетевой доступ и меры контроля учреждения настраиваются отдельно.

**Ожидает проверки** — Установка на реальных телефонах, работа PWA в отдельном окне, непрерывная запись в фоне или при заблокированном экране и промышленное внедрение в больнице ещё не проверены. Одинаковые имена аккаунтов на разных устройствах не объединяют и не синхронизируют данные автоматически.

Для первоначальной оценки используйте вымышленные данные. По умолчанию приложение работает без сети; каждое подключение требует отдельного разрешения. Завершите запись и убедитесь в сохранении перед остановкой сервиса.

## العربية

0.6.15: افتح `Start-WardNote.cmd` على Windows؛ أوقف الخدمة من اللوحة بعد التأكيد. للهواتف، يمكن للمسؤول نشر PWA ثابتة تحفظ البيانات محليًا. لا توفر هذه النسخة واجهات مزامنة أو تفريغ سحابي؛ تفويض الاتصال أدناه يخص النسخة ذات الخادم الكامل فقط.

### بدء الاستخدام

**تحديثات التطبيق** — تُفحص ملفات البرنامج من المصدر نفسه عند بدء التشغيل، والعودة إلى الواجهة أو استعادة الاتصال، وكل خمس دقائق ما دامت الصفحة ظاهرة. يتوفر فحص يدوي في صفحتي الدخول والإعدادات. لا تُرفع السجلات أو التسجيلات الصوتية، ولا تُفعّل المزامنة أو صلاحية المعالجة عبر الشبكة. فشل الفحص لا يؤكد أن الإصدار هو الأحدث.

اختر «لاحقًا» لمواصلة العمل. قبل الحفظ والتحديث، أنهِ التسجيل الصوتي واحفظه، وانتظر اكتمال عمليات الإرسال، وأغلق مربعات الحوار ونوافذ WardNote الأخرى. لا يُطبّق التحديث إلا بعد نجاح الحفظ؛ وعند الفشل تبقى الصفحة الحالية. إن كانت الصفحة قديمة جدًا ولا توفر هذه الأداة، فتأكد من الحفظ، وأغلق جميع النوافذ القديمة للعنوان نفسه ثم أعد فتحه؛ **لا تمسح بيانات الموقع**. يجب على مسؤول النشر إتاحة حزمة كاملة ومتسقة، دون استبدال الملفات واحدًا تلو الآخر في المجلد المنشور.

إذا كان مخبأ ملفات الإصدار المنتظر غير مكتمل، فأعد تنزيل التحديث. تُصلح ملفات البرنامج فقط؛ لا تُمسح بيانات المرضى ولا يُطبّق التحديث تلقائيًا.

**تشغيل بنقرة واحدة على Windows، واستخدام مباشر عبر المتصفح، ومدخل إلى PWA**

**التشغيل على Windows** — تتضمن حزمة Windows دون اتصال بيئة التشغيل. فك الضغط وانقر مرتين على ملف التشغيل؛ تتطلب حزمة المصدر Node.js 24+. لا يحتاج التدوين الأساسي إلى تنزيل نموذج أو مفتاح API. المساعدة مرفقة بالحزمة.

**الاستخدام المباشر عبر المتصفح** — بعد تشغيل الخدمة المحلية، افتح العنوان أدناه في متصفح الكمبيوتر؛ لا يلزم تثبيت برنامج عميل مخصص. بعد الإعداد الأولي، تدعم مساحة عمل الجهاز تدوين الملاحظات دون اتصال. `http://127.0.0.1:8787/`

**مدخل PWA** — تتوافر واجهات الهاتف وموارد تثبيت PWA. عندما يتيح المتصفح دعم التثبيت، قد يظهر خيار التثبيت في الإعدادات؛ وقد يوفر المتصفح أيضًا قائمة للتثبيت أو الإضافة إلى الشاشة الرئيسية. يختلف التوافر حسب المتصفح والمنصة.

**متطلبات النشر المتبقية** — يتطلب وصول الهاتف إلى خدمة الكمبيوتر عنوان HTTPS موثوقًا وقابلًا للوصول يهيئه مسؤول النشر. يشير 127.0.0.1 على الهاتف إلى الهاتف نفسه. يجب إعداد HTTPS والوصول إلى الشبكة وضوابط المؤسسة بشكل منفصل.

**بانتظار التحقق** — لم يُتحقق بعد من التثبيت على هواتف فعلية أو تشغيل PWA كتطبيق مستقل أو التسجيل المستمر في الخلفية أو أثناء قفل الشاشة أو النشر التشغيلي في المستشفيات. أسماء الحسابات المتطابقة على أجهزة مختلفة لا تدمج البيانات أو تزامنها تلقائيًا.

استخدم بيانات وهمية للتقييم الأولي. الوضع الافتراضي دون اتصال؛ ويتطلب كل اتصال إذنًا منفصلًا. أنهِ التسجيلات وتأكد من حفظها قبل إيقاف الخدمة.

## हिन्दी

0.6.15: Windows पर `Start-WardNote.cmd` खोलें; पुष्टि के बाद पैनल से सेवा बंद करें। फ़ोन के लिए व्यवस्थापक स्थानीय स्टोरेज वाली स्थिर PWA तैनात कर सकता है। इसमें सिंक या क्लाउड ट्रांसक्रिप्शन API नहीं है; नीचे कनेक्शन अनुमति केवल पूरे बैकएंड संस्करण पर लागू है।

### शुरू करें

**ऐप अपडेट** — शुरू होने पर, सामने लौटने या नेटवर्क बहाल होने पर, और पेज दिखाई देने के दौरान हर पाँच मिनट में उसी मूल पते की प्रोग्राम फ़ाइलें जाँची जाती हैं। लॉगिन या सेटिंग पेज से मैन्युअल जाँच भी की जा सकती है। रिकॉर्ड या ऑडियो अपलोड नहीं होते; डेटा सिंक या नेटवर्क प्रोसेसिंग की अनुमति चालू नहीं होती। जाँच असफल होने का अर्थ यह नहीं कि संस्करण नवीनतम है।

काम जारी रखने के लिए बाद में चुनें। सहेजने और अपडेट करने से पहले रिकॉर्डिंग समाप्त करके सहेजें, लंबित सबमिशन पूरे होने दें और संवाद तथा WardNote की अन्य विंडो बंद करें। सफलतापूर्वक सहेजने के बाद ही अपडेट लागू होता है; विफलता पर वर्तमान पेज बना रहता है। बहुत पुराने पेज में अपडेट विकल्प न हो तो सहेजना सुनिश्चित करें, उसी पते की सभी पुरानी विंडो बंद करके फिर खोलें; **साइट का डेटा न मिटाएँ**। व्यवस्थापक पूरा और एक ही संस्करण वाला पैकेज तैनात करे; सक्रिय फ़ोल्डर में फ़ाइलें एक-एक करके न बदले।

प्रतीक्षारत संस्करण की प्रोग्राम कैश अधूरी हो तो अपडेट दोबारा डाउनलोड करें। केवल प्रोग्राम फ़ाइलें सुधरती हैं; रोगी डेटा नहीं मिटता और अपडेट अपने-आप लागू नहीं होता।

**Windows में एक क्लिक से शुरू करें, ब्राउज़र में सीधे उपयोग करें और PWA प्रवेश विकल्प पाएँ**

**Windows में शुरुआत** — Windows ऑफलाइन पैकेज में रनटाइम शामिल है। इसे निकालें और लॉन्चर पर डबल-क्लिक करें; सोर्स पैकेज के लिए Node.js 24+ चाहिए। सामान्य रिकॉर्ड के लिए मॉडल डाउनलोड या API कुंजी आवश्यक नहीं है। सहायता पैकेज में शामिल है।

**ब्राउज़र में सीधे उपयोग** — स्थानीय सेवा शुरू करने के बाद कंप्यूटर के ब्राउज़र में नीचे दिया पता खोलें; अलग क्लाइंट ऐप की आवश्यकता नहीं है। प्रारंभिक तैयारी पूरी होने पर डिवाइस के कार्यक्षेत्र में ऑफलाइन नोट लिखे जा सकते हैं। `http://127.0.0.1:8787/`

**PWA प्रवेश विकल्प** — मोबाइल लेआउट और PWA इंस्टॉलेशन संसाधन उपलब्ध हैं। ब्राउज़र इंस्टॉलेशन सुविधा उपलब्ध कराए तो सेटिंग में इंस्टॉल विकल्प दिख सकता है; ब्राउज़र में इंस्टॉल या होम स्क्रीन पर जोड़ने का मेनू भी हो सकता है। उपलब्धता ब्राउज़र और प्लेटफ़ॉर्म पर निर्भर करती है।

**अभी आवश्यक तैनाती** — फ़ोन से कंप्यूटर की सेवा तक पहुँचने के लिए तैनाती करने वाले पक्ष को पहुँच योग्य, विश्वसनीय HTTPS पता कॉन्फ़िगर करना होगा। फ़ोन पर 127.0.0.1 उसी फ़ोन को दर्शाता है। HTTPS, नेटवर्क पहुँच और संस्थागत नियंत्रण अलग से कॉन्फ़िगर करने होंगे।

**सत्यापन शेष** — वास्तविक फ़ोन पर इंस्टॉलेशन, स्वतंत्र PWA मोड, बैकग्राउंड या लॉक स्क्रीन में लगातार रिकॉर्डिंग और अस्पताल में वास्तविक संचालन की तैनाती का सत्यापन अभी शेष है। अलग-अलग उपकरणों पर समान खाता नाम होने से डेटा अपने-आप जुड़ता या सिंक नहीं होता।

प्रारंभिक परीक्षण में काल्पनिक डेटा का उपयोग करें। डिफ़ॉल्ट मोड ऑफलाइन है; हर कनेक्शन के लिए अलग अनुमति आवश्यक है। सेवा बंद करने से पहले रिकॉर्डिंग समाप्त करें और सहेजे जाने की पुष्टि करें।

## اردو

0.6.15: Windows پر `Start-WardNote.cmd` کھولیں؛ تصدیق کے بعد پینل سے سروس بند کریں۔ فون کے لیے منتظم مقامی ذخیرے والی جامد PWA لگا سکتا ہے۔ اس میں مطابقت یا کلاؤڈ نقل نویسی API نہیں؛ ذیل کی اتصال اجازت صرف مکمل بیک اینڈ کے لیے ہے۔

### شروع کریں

**ایپ کی اپ ڈیٹس** — آغاز پر، سامنے واپس آنے یا نیٹ ورک بحال ہونے پر، اور صفحہ نظر آنے کے دوران ہر پانچ منٹ بعد اسی اصل پتے کی پروگرام فائلیں چیک ہوتی ہیں۔ لاگ ان یا ترتیبات سے دستی جانچ بھی دستیاب ہے۔ ریکارڈ یا آڈیو اپ لوڈ نہیں ہوتے؛ ڈیٹا کی ہم وقت سازی یا نیٹ ورک پر کارروائی کی اجازت فعال نہیں ہوتی۔ جانچ کی ناکامی کا مطلب یہ نہیں کہ ورژن تازہ ترین ہے۔

کام جاری رکھنے کے لیے بعد میں منتخب کریں۔ محفوظ کرکے اپ ڈیٹ کرنے سے پہلے ریکارڈنگ ختم اور محفوظ کریں، زیر التوا ارسال مکمل ہونے دیں، اور مکالمے اور WardNote کی دیگر ونڈوز بند کریں۔ اپ ڈیٹ صرف کامیاب محفوظ ہونے کے بعد لاگو ہوتا ہے؛ ناکامی پر موجودہ صفحہ برقرار رہتا ہے۔ بہت پرانے صفحے میں یہ اختیار نہ ہو تو محفوظ ہونے کی تصدیق کریں، اسی پتے کی تمام پرانی ونڈوز بند کرکے دوبارہ کھولیں؛ **سائٹ کا ڈیٹا نہ مٹائیں**۔ منتظم مکمل اور ایک ہی ورژن کا پیکیج تعینات کرے؛ فعال فولڈر میں فائلیں ایک ایک کرکے تبدیل نہ کرے۔

اگر زیرِ انتظار ورژن کی پروگرام کیش نامکمل ہو تو اپ ڈیٹ دوبارہ ڈاؤن لوڈ کریں۔ صرف پروگرام فائلیں درست ہوتی ہیں؛ مریض کا ڈیٹا نہیں مٹتا اور اپ ڈیٹ خودکار طور پر لاگو نہیں ہوتا۔

**Windows میں ایک کلک سے آغاز، براؤزر میں براہِ راست استعمال اور PWA کا داخلی راستہ**

**Windows پر آغاز** — Windows آف لائن پیکیج میں رن ٹائم شامل ہے۔ اسے نکالیں اور لانچر پر ڈبل کلک کریں؛ سورس پیکیج کے لیے Node.js 24+ درکار ہے۔ بنیادی اندراج کے لیے ماڈل ڈاؤن لوڈ یا API کلید ضروری نہیں۔ مدد پیکیج میں شامل ہے۔

**براؤزر میں براہِ راست استعمال** — مقامی سروس شروع کرنے کے بعد کمپیوٹر کے براؤزر میں نیچے دیا گیا پتہ کھولیں؛ الگ کلائنٹ ایپ درکار نہیں۔ ابتدائی تیاری کے بعد آلے کے ورک اسپیس میں آف لائن نوٹس لکھے جا سکتے ہیں۔ `http://127.0.0.1:8787/`

**PWA کا داخلی راستہ** — موبائل ترتیب اور PWA کی تنصیب کے وسائل شامل ہیں۔ اگر براؤزر تنصیب کی سہولت فراہم کرے تو ترتیبات میں انسٹال کا اختیار دکھ سکتا ہے؛ براؤزر میں انسٹال یا ہوم اسکرین پر شامل کرنے کا مینو بھی ہو سکتا ہے۔ دستیابی براؤزر اور پلیٹ فارم پر منحصر ہے۔

**ابھی درکار تعیناتی** — فون سے کمپیوٹر کی سروس تک رسائی کے لیے تعیناتی کے ذمہ دار کو قابلِ رسائی، قابلِ اعتماد HTTPS پتہ ترتیب دینا ہوگا۔ فون پر 127.0.0.1 اسی فون کو ظاہر کرتا ہے۔ HTTPS، نیٹ ورک رسائی اور ادارہ جاتی کنٹرول الگ سے ترتیب دینے ہوں گے۔

**تصدیق باقی ہے** — حقیقی فون پر تنصیب، الگ PWA موڈ، پس منظر یا لاک اسکرین کے دوران مسلسل ریکارڈنگ اور ہسپتال میں عملی تعیناتی کی تصدیق ابھی باقی ہے۔ مختلف آلات پر یکساں کھاتہ نام ڈیٹا کو خودکار طور پر یکجا یا ہم آہنگ نہیں کرتے۔

ابتدائی جانچ کے لیے فرضی ڈیٹا استعمال کریں۔ پہلے سے طے شدہ حالت آف لائن ہے؛ ہر کنکشن کے لیے الگ اجازت ضروری ہے۔ سروس بند کرنے سے پہلے ریکارڈنگ ختم کریں اور محفوظ ہونے کی تصدیق کریں۔

## Launcher filenames / 启动脚本文件名

Windows: `启动应用.cmd` starts the service; `停止应用.cmd` stops it after recordings and saves finish. The source package requires Node.js 24+; the separate Windows x64 portable package includes it. These filenames are not translated.

Windows：离线便携包完整解压后双击 `Start-WardNote.cmd`（原 `启动应用.cmd` 仍可使用）；源码包需先安装 Node.js 24+。结束录音并确认保存后，运行 `停止应用.cmd`。脚本文件名不随界面语言改变。

## Independent use and preparation / 独立使用与准备条件

完成首次资源准备后，核心文字记录、本机保存和备份不依赖 EMR/HIS、云模型或持续互联网。仍需兼容的浏览器、足够内存和存储及供电；Windows 离线便携包自带运行环境，源码包需 Node.js 24+；手机需可信 HTTPS 首次访问及浏览器/PWA 准备。八语言界面不等于八语种语音识别、母语临床审校或各国制度适配已经完成；不同设备同名账号也不自动成为同一跨设备身份。

After initial resource preparation, core text entry, local storage and backup do not depend on an EHR/HIS, cloud model or continuous internet. A compatible browser, sufficient memory/storage and power are still needed. The Windows offline package includes its runtime, while the source package requires Node.js 24+; phones need trusted HTTPS for initial access and browser/PWA preparation. Eight UI languages do not establish eight-language speech recognition, native clinical translation approval or adaptation to every country's rules. Matching local account names on separate devices do not establish one cross-device identity.

低资源设备、弱网、共享终端、真实手机和离线备份恢复的实测，列入获准公开预发布后的自愿用户反馈；首次体验使用虚构资料，不上传患者数据或备份。当前适用范围以[验证报告](VALIDATION.md)为准，反馈安排见[后续计划](RELEASE-CHECKLIST.md)。

Low-resource devices, intermittent networks, shared terminals, physical phones and offline backup recovery are planned for voluntary feedback after authorized public pre-release. Start with fictional data; do not upload patient data or backups as feedback. Supported claims follow the [validation report](VALIDATION.md); see the [follow-up plan](RELEASE-CHECKLIST.md).

[Infrastructure / 基础设施适配](INFRASTRUCTURE.md) · [Deployment / 部署](DEPLOYMENT.md) · [Validation / 验证范围](VALIDATION.md) · [Offline and accounts / 脱机与账号](OFFLINE-AND-ACCOUNTS.md)

Translations are draft UI guidance, pending native-language review. / 新增译文尚待母语人员复核。
