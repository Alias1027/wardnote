// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Run the core suite from the isolated public release, without clinical data/config.
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {verifyManifest} from './release.mjs';
const root=resolve(import.meta.dirname,'..');
const {version}=JSON.parse(readFileSync(join(root,'app/package.json'),'utf8'));
const packaged=join(root,'dist',`wardnote-${version}`);
console.log(`Verified ${verifyManifest(packaged)} packaged source files`);
const tests=readdirSync(join(packaged,'app/tests')).filter(name=>name.endsWith('.test.mjs')).sort();
if(!tests.length)throw new Error('No packaged tests found');
const result=spawnSync(process.execPath,['--test',...tests.map(name=>join('tests',name))],{cwd:join(packaged,'app'),stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status??1;
