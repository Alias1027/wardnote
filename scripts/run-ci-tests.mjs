// Reproducible Windows host checks using bundled, hash-verified historical assets.
import {spawnSync} from 'node:child_process';
import {mkdirSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),mode=process.argv[2]||'all';
if(!['core','browser','upgrade','all'].includes(mode))throw Error('Use core, browser, upgrade or all.');
if(process.platform!=='win32')throw Error('These host checks currently require Windows; no other platform validation is claimed.');
if(Number(process.versions.node.split('.')[0])<24)throw Error('Node.js 24 or later is required.');
mkdirSync(join(root,'logs'),{recursive:true});
function run(program,args){const r=spawnSync(program,args,{cwd:root,env:process.env,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1);}
run(process.env.WARDNOTE_POWERSHELL||'pwsh.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',join(root,'scripts/prepare-test-baselines.ps1')]);
process.env.WARDNOTE_BASE_WEB ||= join(root,'.test-baseline/browser');
process.env.WARDNOTE_PREVIOUS_ANDROID_WEB ||= join(root,'.test-baseline/android-0.1.1');
process.env.WARDNOTE_JAVA_HOME ||= process.env.JAVA_HOME_17_X64||process.env.JAVA_HOME||resolve(root,'../wardnote-android-buildtools/jdk/jdk-17.0.20.1+1');
if(mode==='core'||mode==='all')run(process.execPath,['--test',...readdirSync(join(root,'tests')).filter(x=>x.endsWith('.test.mjs')).sort().map(x=>join('tests',x))]);
if(mode==='browser'||mode==='all')run(process.execPath,['tests/android-browser.mjs']);
if(mode==='upgrade'||mode==='all')run(process.execPath,['tests/android-upgrade.mjs']);
