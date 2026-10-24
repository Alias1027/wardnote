// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Public reference metadata only. No patient data or automatic network requests.
export const PROJECT_NOTICE = Object.freeze({
  "title": "参考来源、用途与版权",
  "purpose": "本工具参考相关框架中的部分原则，用于辅助初诊评估和住院患者管理，并支持临床思维与患者管理能力的培养和教学；不能替代医院／机构的正式病历、医嘱、管理系统或管理职责。",
  "boundary": "参考这些框架不代表获得相关机构认可、认证或满足全部要求。",
  "sources": "官方来源（可复制网址）",
  "edition": "版本说明：Joint Commission 医院及关键准入医院项目的 NPSG 章节自2026年1月1日起由 NPG 取代；NHS England 于2015年发布 NatSSIPs，CPOC 于2023年发布 NatSSIPs 2。",
  "license": "版权署名不改变现有许可：个人非商业使用依项目许可；机构及商业用途须事先取得作者书面授权。既有合法授权及第三方权利保留。",
  "copyright": "© Junhui Liu M.D."
});
export const PROJECT_REFERENCES = Object.freeze([
  {
    "id": "china",
    "label": "中国国家卫生健康委员会：医疗质量安全核心制度要点（十八项核心制度）",
    "code": "",
    "url": "https://www.nhc.gov.cn/zwgk/jdjd/201804/5dfb30387c74412194c7f05b878d4f87.shtml"
  },
  {
    "id": "cms",
    "label": "美国 CMS：医院参与条件",
    "code": "CMS CoPs · 42 CFR Part 482",
    "url": "https://www.cms.gov/medicare/health-safety-standards/conditions-coverage-participation/hospitals"
  },
  {
    "id": "joint-commission",
    "label": "美国 Joint Commission：国家患者安全目标／国家绩效目标",
    "code": "NPSG / NPG",
    "url": "https://www.jointcommission.org/en-us/standards/national-performance-goals"
  },
  {
    "id": "acgme",
    "label": "美国 ACGME：住院医师培训通用项目要求",
    "code": "ACGME CPR",
    "url": "https://www.acgme.org/programs-and-institutions/programs/common-program-requirements/"
  },
  {
    "id": "nice",
    "label": "英国 NICE：住院急性病成人患者病情恶化的识别与响应",
    "code": "NICE CG50",
    "url": "https://www.nice.org.uk/guidance/CG50/chapter/recommendations"
  },
  {
    "id": "nhs",
    "label": "英国 NHS England：侵入性操作国家安全标准（原版）",
    "code": "NatSSIPs · 2015",
    "url": "https://www.england.nhs.uk/patient-safety/natssips/"
  },
  {
    "id": "cpoc",
    "label": "英国 CPOC：侵入性操作国家安全标准（第二版）",
    "code": "NatSSIPs 2 · 2023",
    "url": "https://www.cpoc.org.uk/guidelines-and-resources/guidelines/national-safety-standards-invasive-procedures-natssips"
  },
  {
    "id": "gba",
    "label": "德国 G-BA：质量管理指令",
    "code": "G-BA QM-RL",
    "url": "https://www.g-ba.de/richtlinien/87/"
  }
]);

// Shared getting-started copy. Translation changes never affect clinical data.
export const START_GUIDE = Object.freeze({
  "title": "开始使用",
  "lead": "Windows 一键启动、浏览器直接使用与 PWA 入口",
  "windowsTitle": "Windows 启动",
  "windows": "Windows 离线包已包含运行环境，解压后双击启动脚本；源码包需先安装 Node.js 24+。基础记录无需下载模型或填写 API 密钥，使用说明随包提供。",
  "browserTitle": "浏览器直接使用",
  "browser": "启动本机服务后，在电脑浏览器打开下方地址，无需另装专用客户端。首次准备完成后，本机工作区可脱机记录。",
  "pwaTitle": "PWA 入口",
  "pwa": "已提供移动页面和 PWA 安装资源。浏览器提供安装能力时，设置页可显示安装入口，也可使用浏览器的安装或添加到主屏幕菜单；可用方式取决于浏览器和平台。",
  "deploymentTitle": "仍需部署",
  "deployment": "手机访问电脑服务，需要部署方配置可访问的可信 HTTPS 地址。手机上的 127.0.0.1 指手机自身；HTTPS、网络访问及院方管理措施须另行配置。",
  "validationTitle": "尚待验证",
  "validation": "真实手机安装、独立 PWA 模式、后台或锁屏连续录音及医院正式部署尚待验证。不同设备上同名账号不会自动合并或同步资料。",
  "firstUse": "首次试用请使用虚构资料。默认脱机，每次联网须单独授权；结束录音并确认保存后再停止服务。"
});
