# Contributing / 参与贡献

Clinical workflow feedback, accessibility improvements, adapters, tests and documentation are welcome. Use fictional cases throughout discussion and testing.

## Before a change

1. Describe the affected task, the observed problem and the desired result. For a clinical workflow change, describe who reviews the result and which source supports it.
2. For a larger change, open a feature proposal before implementation. Include data movement, review requirements and failure handling.
3. Report vulnerabilities privately using [SECURITY.md](SECURITY.md), not a public issue.

## Development

Node.js 24+ is required. Run `node app/server.mjs` from the root. No build step or runtime packages are needed. Core checks: `cd app` then `npm test` (or the explicit Node command in the README). Browser checks: `npm ci`, `npx playwright install chromium`, `npm run test:browser`.

`NOTE_BROWSER` selects an existing browser. `NOTE_PLAYWRIGHT_MODULE` optionally selects a managed Playwright module; ordinary contributors should use the locked local development dependency. Keep temporary files in `work/` and never commit `data/`, private logs or local configuration.

## Pull requests

- Explain the user-visible change, why it is needed and the checks actually run.
- Add a regression test for a consequential defect or a new data-integrity rule. Do not add tests that merely repeat presentation text.
- Preserve negation, uncertainty, units and source identity. Never silently turn draft data into reviewed data.
- Never bypass recording consent, cross-encounter references, stale-summary checks or retention protection to make a test pass.
- Keep runtime additions minimal and justify new dependencies. Format changed code readably; avoid unrelated rewrites.
- Use only synthetic fixtures and screenshots; disclose any external service required for reproduction.

## Licensing

The current source-available license does not itself grant the maintainer commercial relicensing rights over your original contributions. Before accepting external code, translations, templates or documentation, agree in writing on authorship and the rights needed to distribute under the project license and offer institutional/commercial licenses. Opening an issue or pull request does not imply a copyright assignment or contributor agreement. No external contributor agreement is currently executed or claimed. Institutional contributors must obtain any required organizational authorization. See [license scope](LICENSES/README.md).

## Collaboration

Respect clinical and technical expertise. Describe evidence and limitations without personal attacks. Bug reports should be reproducible and free of patient data. Institutional affiliation or clinical endorsement must not be implied without authorization.

中文：欢迎提出临床流程问题、界面无障碍、测试及接口改进。请说明具体场景、来源、复核者和失败时的处理；仅使用虚构资料，勿上传真实病历或音频。接受外部贡献前须书面明确权属、项目分发及机构／商业授权所需权利；提出问题或提交PR不等于自动转让版权。
