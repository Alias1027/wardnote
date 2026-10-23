// The .yml workflow uses JSON syntax, a valid YAML subset, to permit dependency-free parsing.
// This validates the local contract; only a real GitHub run validates hosted execution.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(import.meta.dirname,'..'),read=name=>readFileSync(join(root,name),'utf8');
const workflow=JSON.parse(read('.github/workflows/android-ci.yml'));
assert.deepEqual(Object.keys(workflow.on).sort(),['pull_request','push','workflow_dispatch']);
assert.deepEqual(workflow.permissions,{contents:'read'});
const jobs=Object.values(workflow.jobs);assert.equal(jobs.length,1);
const job=jobs[0];assert.equal(job['runs-on'],'windows-2022');assert.equal(job.defaults.run.shell,'pwsh');
const expectedActions=['actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1','actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1'];
assert.deepEqual(job.steps.filter(s=>s.uses).map(s=>s.uses),expectedActions);
assert.equal(job.steps[0].with['persist-credentials'],false);
assert.equal(job.steps[1].with['node-version'],'24');
const commands=job.steps.filter(s=>s.run).map(s=>s.run).join('\n');
for(const command of ['JAVA_HOME_17_X64','platforms;android-35','build-tools;35.0.0','npm ci --ignore-scripts','npm run test:all','ci-android-build.ps1','python scripts/package-preview.py --check','python -m unittest discover -s tests -p test_public_package.py -v'])assert.ok(commands.includes(command),command);
const boundaryCheck=job.steps.findIndex(s=>s.run==='python scripts/package-preview.py --check');
assert.equal(job.steps[boundaryCheck+1].run,'python -m unittest discover -s tests -p test_public_package.py -v');
assert.equal(job.steps.at(-1).run,'python scripts/package-preview.py');
assert.doesNotMatch(commands,/secrets\.|gh release|git push|upload-artifact|private-signing/i);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(lock.name,pkg.name);assert.equal(lock.version,pkg.version);
assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
assert.equal(pkg.devDependencies.playwright,'1.62.1');
for(const name of ['playwright','playwright-core']){const entry=lock.packages['node_modules/'+name];assert.equal(entry.version,'1.62.1');assert.match(entry.integrity,/^sha512-/);assert.ok(entry.resolved.startsWith('https://registry.npmjs.org/'));}
for(const file of ['scripts/prepare-test-baselines.ps1','scripts/run-ci-tests.mjs','scripts/ci-android-build.ps1','scripts/verify-android-apk.ps1','tests/fixtures/manifest.json'])assert.ok(existsSync(join(root,file)),file);
const fixtures=JSON.parse(read('tests/fixtures/manifest.json'));assert.deepEqual(fixtures.archives.map(a=>Object.keys(a.files).length),[55,57]);
console.log('PASS CI configuration parses as JSON-compatible YAML; pinned actions, read-only permissions, locked dependencies, checked-in baselines, test and isolated-signing stages validated. GitHub-hosted execution has not been run.');
