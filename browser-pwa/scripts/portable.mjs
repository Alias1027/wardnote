// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Offline-only packager. Fetch and review official runtime assets separately.
import {readFileSync,writeFileSync,mkdirSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,relative,sep,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {verifyManifest,validatePath,writeZip} from './release.mjs';

export const NODE_RUNTIME=Object.freeze({
 version:'24.19.0',platform:'win32',arch:'x64',
 releaseURL:'https://nodejs.org/dist/v24.19.0/',
 checksumURL:'https://nodejs.org/dist/v24.19.0/SHASUMS256.txt',
 archive:'node-v24.19.0-win-x64.zip',
 archiveSHA256:'57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73',
 executableSHA256:'3602f2bb1a10f2cbab4c36886218a33c1ab3db87290e73b033c46c77147d0237',
 licenseSHA256:'d9c4eeda951d6d08f4aa1316b61aafcf67e6da5f79b18f8edeb56fa6abdc038c'
});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const inside=(root,path)=>{const rel=relative(root,path);return rel!==''&&!isAbsolute(rel)&&rel!=='..'&&!rel.startsWith('..'+sep);};
function regular(path){
 for(let current=resolve(path);;current=dirname(current)){
  if(lstatSync(current).isSymbolicLink())throw new Error('Symbolic links and junctions are not allowed in portable inputs');
  if(current===dirname(current))break;
 }
 if(!lstatSync(path).isFile())throw new Error('Portable input must be a regular file');
 return readFileSync(path);
}
export function readVerifiedRuntime(directory){
 const root=realpathSync(directory),assets={};
 for(const name of ['node.exe','LICENSE','SHASUMS256.txt',NODE_RUNTIME.archive])assets[name]=regular(join(directory,name));
 if(hash(assets['node.exe'])!==NODE_RUNTIME.executableSHA256)throw new Error('Node executable checksum mismatch');
 if(hash(assets.LICENSE)!==NODE_RUNTIME.licenseSHA256)throw new Error('Complete original Node license checksum mismatch');
 if(hash(assets[NODE_RUNTIME.archive])!==NODE_RUNTIME.archiveSHA256)throw new Error('Official Node archive checksum mismatch');
 const sums=new Map(assets['SHASUMS256.txt'].toString('utf8').trim().split(/\r?\n/).map(line=>{const match=/^([0-9a-f]{64})\s+(.+)$/.exec(line);if(!match)throw new Error('Invalid official checksum list');return [match[2],match[1]];}));
 if(sums.get('win-x64/node.exe')!==NODE_RUNTIME.executableSHA256||sums.get(NODE_RUNTIME.archive)!==NODE_RUNTIME.archiveSHA256)throw new Error('Official checksum list does not match pinned runtime');
 return {root,node:assets['node.exe'],license:assets.LICENSE,checksums:assets['SHASUMS256.txt']};
}
function runtimeInfo(){return {...NODE_RUNTIME,archiveURL:NODE_RUNTIME.releaseURL+NODE_RUNTIME.archive,verification:'Pinned SHA-256 matches the official HTTPS checksum list; original LICENSE was extracted from the verified official archive. No claim of independent release-signature verification.',license:'Complete unmodified Node.js LICENSE, including bundled third-party notices, in runtime/node/LICENSE'};}
export function createPortable(release,destination,runtimeDirectory){
 if(existsSync(destination)||existsSync(destination+'.zip')||existsSync(destination+'.zip.sha256'))throw new Error('Portable output already exists; refusing to overwrite');
 verifyManifest(release);
 const manifest=JSON.parse(regular(join(release,'release-manifest.json')).toString('utf8'));
 const pkg=JSON.parse(regular(join(release,'app/package.json')).toString('utf8'));
 if(manifest.version!==pkg.version)throw new Error('Source version mismatch');
 const runtime=readVerifiedRuntime(runtimeDirectory);
 const files=manifest.files.map(f=>({path:f.path,bytes:regular(join(release,validatePath(f.path)))}));
 files.push({path:'release-manifest.json',bytes:regular(join(release,'release-manifest.json'))},
  {path:'runtime/node/node.exe',bytes:runtime.node},
  {path:'runtime/node/LICENSE',bytes:runtime.license},
  {path:'runtime/node/SHASUMS256.txt',bytes:runtime.checksums},
  {path:'runtime/node/provenance.json',bytes:Buffer.from(JSON.stringify(runtimeInfo(),null,2)+'\n')});
 if(new Set(files.map(f=>f.path)).size!==files.length)throw new Error('Reserved runtime path collides with source package');
 mkdirSync(destination,{recursive:true});
 for(const file of files){const path=resolve(destination,file.path);if(!inside(resolve(destination),path))throw new Error('Portable path escaped output');mkdirSync(dirname(path),{recursive:true});writeFileSync(path,file.bytes,{flag:'wx'});}
 const portable={format:'wardnote-portable/1',version:pkg.version,target:'windows-x64',runtime:runtimeInfo(),sourceManifestSHA256:hash(regular(join(release,'release-manifest.json'))),files:files.map(f=>({path:f.path,size:f.bytes.length,sha256:hash(f.bytes)}))};
 writeFileSync(join(destination,'portable-manifest.json'),JSON.stringify(portable,null,2)+'\n',{flag:'wx'});
 verifyPortable(destination);
 return portable;
}
export function verifyPortable(root){
 const manifest=JSON.parse(regular(join(root,'portable-manifest.json')).toString('utf8'));
 if(manifest.format!=='wardnote-portable/1'||manifest.target!=='windows-x64'||!Array.isArray(manifest.files)||new Set(manifest.files.map(f=>f.path)).size!==manifest.files.length)throw new Error('Invalid portable manifest');
 if(manifest.runtime?.executableSHA256!==NODE_RUNTIME.executableSHA256||manifest.runtime?.licenseSHA256!==NODE_RUNTIME.licenseSHA256)throw new Error('Unrecognized runtime');
 for(const file of manifest.files){validatePath(file.path);const bytes=regular(join(root,file.path));if(bytes.length!==file.size||hash(bytes)!==file.sha256)throw new Error('Portable file checksum mismatch: '+file.path);}
 for(const [path,expected]of [['runtime/node/node.exe',NODE_RUNTIME.executableSHA256],['runtime/node/LICENSE',NODE_RUNTIME.licenseSHA256]]){
  if(!manifest.files.some(f=>f.path===path&&f.sha256===expected))throw new Error('Runtime evidence missing');
 }
 if(hash(regular(join(root,'release-manifest.json')))!==manifest.sourceManifestSHA256)throw new Error('Source manifest checksum mismatch');
 verifyManifest(root);
 return manifest.files.length;
}
const ROOT=resolve(import.meta.dirname,'..');
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args.length===2&&args[0]==='--verify'){console.log(`Verified ${verifyPortable(resolve(args[1]))} portable files`);}
 else{
  if(args.length!==2||args[0]!=='--runtime-dir')throw new Error('Usage: node scripts/portable.mjs --runtime-dir <reviewed-runtime-directory> | --verify <portable-directory>');
  const {version}=JSON.parse(readFileSync(join(ROOT,'app/package.json'),'utf8')),name=`wardnote-${version}-portable-win-x64`,destination=join(ROOT,'dist',name);
  const manifest=createPortable(join(ROOT,'dist',`wardnote-${version}`),destination,resolve(args[1]));
  writeZip(destination,destination+'.zip',[...manifest.files.map(f=>f.path),'portable-manifest.json'],name);
  console.log(`Prepared ${manifest.files.length} verified files for Windows x64; Node ${NODE_RUNTIME.version} included. No installer, npm or network download is required to launch on a compatible Windows system.`);
 }
}
