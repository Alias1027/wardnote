// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Explicit public-source export only. This tool never provisions a host or reads a patient store.
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,lstatSync} from 'node:fs';
import {resolve,join,dirname,relative,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {collectFiles,validatePath,writeZip} from './release.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const PROFILE="// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0\n// Generated static package: no clinical server endpoints.\nexport const STATIC_ONLY=true;\n";
const EXTRAS=['deployment/STATIC-PWA.md','deployment/admin-setup.html','deployment/admin-wizard.js','deployment/static-headers.json','LICENSE','NOTICE','LICENSES/Apache-2.0.txt','LICENSES/CC-BY-4.0.txt'];
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json; charset=utf-8'};
export function validateOrigin(value){
 let url;try{url=new URL(value);}catch{throw new Error('Deployment origin must be a dedicated HTTPS origin at /');}
 const valid=url.hostname.length<=253&&url.hostname.split('.').length>1&&url.hostname.split('.').every(p=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(p));
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||url.port||!valid||/^\d+(?:\.\d+){3}$/.test(url.hostname))throw new Error('Deployment origin must be a dedicated HTTPS domain at / (no port, credentials, query or subpath)');
 return url.origin;
}
export function caddyConfig(domain,headers){
 if(domain!=='{$WARDNOTE_DOMAIN}')domain=new URL(validateOrigin('https://'+domain)).hostname;
 return `# Run from this package directory. Serve only ./site; no backend or database.\n${domain} {\n\troot * ./site\n\tencode zstd gzip\n\theader {\n${Object.entries(headers).map(([key,value])=>'\t\t'+key+' "'+value.replaceAll('"','\\"')+'"').join('\n')}\n\t}\n\t@api path /api /api/*\n\trespond @api 404\n\t@unsupported not method GET HEAD\n\trespond @unsupported 405\n\tfile_server {\n\t\thide _headers\n\t}\n}\n`;
}
export function inspectStaticSource(root){
 const names=JSON.parse(readFileSync(join(root,'deployment/static-files.json'),'utf8'));
 if(!Array.isArray(names)||!names.length||new Set(names).size!==names.length)throw new Error('Static allowlist must contain unique public files');
 for(const name of names)if(!name.startsWith('app/public/')||!MIME[extname(name)])throw new Error('Static allowlist must contain public application assets only: '+name);
 const source=collectFiles(root,names),byName=new Map(source.map(f=>[f.path.slice('app/public/'.length),f]));
 const required=['index.html','app.js','sw.js','deployment-profile.js','offline-ui.js','offline-store.js','offline-api.js','manifest.webmanifest'];
 for(const name of required)if(!byName.has(name))throw new Error('Required static asset missing: '+name);
 if(!/export\s+const\s+STATIC_ONLY\s*=\s*false\s*;/.test(byName.get('deployment-profile.js').bytes.toString()))throw new Error('Source deployment profile contract missing');
 const sw=byName.get('sw.js').bytes.toString(),list=sw.match(/const FILES\s*=\s*(\[[\s\S]*?\]);/);
 if(!list)throw new Error('Cannot inspect Service Worker cache list');
 const shell=[...list[1].matchAll(/['"]([^'"\r\n]+)['"]/g)].map(m=>m[1]);
 if(!shell.includes('/deployment-profile.js'))throw new Error('Service Worker must cache the deployment profile');
 for(const url of shell)if(!byName.has(url==='/'?'index.html':url.slice(1)))throw new Error('Service Worker asset missing from static allowlist: '+url);
 for(const f of source){
  const name=f.path.slice('app/public/'.length),body=f.bytes.toString();
  if(name!=='sw.js'&&!shell.includes('/'+name)&&!(name==='index.html'&&shell.includes('/')))throw new Error('Public asset omitted from offline cache: '+name);
  if(name.endsWith('.js'))for(const match of body.matchAll(/^\s*(?:import\s+(?:[\w*$,{}\s]+?\s+from\s+)?|export\s+[\w*$,{}\s]+?\s+from\s+)['"]([^'"]+)['"]/gm)){
   if(!match[1].startsWith('.'))throw new Error('Static modules must use local relative imports: '+match[1]);
   const dependency=relative(join(root,'app/public'),resolve(root,'app/public',dirname(name),match[1])).split(sep).join('/');
   if(!byName.has(dependency))throw new Error('Imported asset missing from static allowlist: '+dependency);
  }
  if(name.endsWith('.webmanifest')){const manifest=JSON.parse(body);if(manifest.scope!=='/'||manifest.start_url.split('?')[0]!=='/')throw new Error('Manifest must use host root');for(const icon of manifest.icons||[])if(!byName.has(icon.src.slice(1)))throw new Error('Manifest icon missing');}
 }
 const headers=JSON.parse(readFileSync(join(root,'deployment/static-headers.json'),'utf8'));
 for(const [key,value]of Object.entries(headers))if(!/^[A-Za-z-]+$/.test(key)||typeof value!=='string'||/[\r\n"\\]/.test(value))throw new Error('Invalid static response header');
 return {source,headers};
}
export function createStatic(root,destination,{origin=null}={}){
 if(existsSync(destination)||existsSync(destination+'.zip')||existsSync(destination+'.zip.sha256'))throw new Error('Static output already exists; refusing to overwrite');
 if(origin)origin=validateOrigin(origin);
 const {source,headers}=inspectStaticSource(root),{version}=JSON.parse(readFileSync(join(root,'app/package.json'),'utf8'));
 const files=source.map(f=>({path:'site/'+f.path.slice('app/public/'.length),bytes:f.bytes}));
 files.find(f=>f.path==='site/deployment-profile.js').bytes=Buffer.from(PROFILE);
 const sw=files.find(f=>f.path==='site/sw.js');
 if(!/const CACHE=['"]wardnote-shell-[^'"]+['"]/.test(sw.bytes.toString()))throw new Error('Unknown Service Worker cache contract');
 sw.bytes=Buffer.from(sw.bytes.toString().replace(/(const CACHE=['"]wardnote-shell-[^'"]+)(['"])/,'$1-static$2'));
 files.push(...collectFiles(root,EXTRAS).map(f=>({path:f.path.replace(/^deployment\//,''),bytes:f.bytes})),{path:'Caddyfile',bytes:Buffer.from(caddyConfig(origin?new URL(origin).hostname:'{$WARDNOTE_DOMAIN}',headers))},{path:'site/_headers',bytes:Buffer.from('/*\n'+Object.entries(headers).map(([key,value])=>'  '+key+': '+value).join('\n')+'\n')});
 if(new Set(files.map(f=>f.path)).size!==files.length)throw new Error('Duplicate static output path');
 const manifest={format:'wardnote-static/1',version,profile:'device-local-static',origin,rootPath:'/',backend:false,files:files.map(f=>({path:f.path,size:f.bytes.length,sha256:digest(f.bytes)}))};
 const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 const checksums=files.map(f=>`${digest(f.bytes)}  ${f.path}`).concat(`${digest(manifestBytes)}  static-manifest.json`).join('\n')+'\n';
 files.push({path:'static-manifest.json',bytes:manifestBytes},{path:'SHA256SUMS.txt',bytes:Buffer.from(checksums)});
 mkdirSync(destination,{recursive:true});
 for(const f of files){validatePath(f.path);const target=join(destination,f.path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,f.bytes,{flag:'wx'});}
 verifyStatic(destination);return manifest;
}
function tree(root,prefix=''){
 const paths=[];for(const name of readdirSync(join(root,prefix))){const path=prefix?prefix+'/'+name:name,stat=lstatSync(join(root,path));if(stat.isSymbolicLink())throw new Error('Static package symlink prohibited');if(stat.isDirectory())paths.push(...tree(root,path));else if(stat.isFile())paths.push(path);else throw new Error('Unexpected static package entry');}return paths;
}
export function verifyStatic(root){
 const manifest=JSON.parse(readFileSync(join(root,'static-manifest.json'),'utf8'));
 if(manifest.format!=='wardnote-static/1'||manifest.profile!=='device-local-static'||manifest.backend!==false||manifest.rootPath!=='/'||!Array.isArray(manifest.files)||new Set(manifest.files.map(f=>f.path)).size!==manifest.files.length)throw new Error('Invalid static manifest');
 if(manifest.origin)validateOrigin(manifest.origin);
 const expected=[...manifest.files.map(f=>f.path),'static-manifest.json','SHA256SUMS.txt'].sort(),actual=tree(root).sort();
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error('Unexpected or missing static package files');
 const files=collectFiles(root,manifest.files.map(f=>f.path));
 for(let i=0;i<files.length;i++)if(files[i].size!==manifest.files[i].size||files[i].sha256!==manifest.files[i].sha256)throw new Error('Static file checksum mismatch: '+files[i].path);
 const checksums=files.map(f=>`${f.sha256}  ${f.path}`).concat(`${digest(readFileSync(join(root,'static-manifest.json')))}  static-manifest.json`).join('\n')+'\n';
 if(readFileSync(join(root,'SHA256SUMS.txt'),'utf8')!==checksums)throw new Error('Static checksum list mismatch');
 if(readFileSync(join(root,'site/deployment-profile.js'),'utf8')!==PROFILE)throw new Error('Static profile mismatch');
 return files.length;
}
export function previewServer(root){
 verifyStatic(root);const manifest=JSON.parse(readFileSync(join(root,'static-manifest.json'),'utf8')),headers=JSON.parse(readFileSync(join(root,'static-headers.json'),'utf8'));
 const allowed=new Map(manifest.files.filter(f=>f.path.startsWith('site/')&&MIME[extname(f.path)]).map(f=>['/'+f.path.slice(5),f.path]));
 return createServer((req,res)=>{
  for(const [key,value]of Object.entries(headers))res.setHeader(key,value);
  if(!/^(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(req.headers.host||'')){res.writeHead(403);res.end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  let path;try{path=new URL(req.url,'http://127.0.0.1').pathname;}catch{res.writeHead(400);res.end();return;}
  const name=allowed.get(path==='/'?'/index.html':path);if(!name){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':MIME[extname(name)]});res.end(req.method==='HEAD'?undefined:readFileSync(join(root,name)));
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);
 if(args[0]==='--verify'&&args.length===2)console.log(`Verified ${verifyStatic(resolve(args[1]))} static files`);
 else if(args[0]==='--preview'&&args.length===2){const server=previewServer(resolve(args[1]));server.listen(4173,'127.0.0.1',()=>console.log('Local preview only: http://127.0.0.1:4173/ (Ctrl+C to stop)'));}
 else {
  let zip=false,origin=null;for(let i=0;i<args.length;i++){if(args[i]==='--zip')zip=true;else if(args[i]==='--origin'&&args[i+1])origin=validateOrigin(args[++i]);else throw new Error('Usage: node scripts/deploy-static.mjs [--zip] [--origin https://domain/] | --verify <directory> | --preview <directory>');}
  const {version}=JSON.parse(readFileSync(join(ROOT,'app/package.json'),'utf8')),name=`wardnote-${version}-static-pwa`,destination=join(ROOT,'dist',name),manifest=createStatic(ROOT,destination,{origin});
  if(zip)writeZip(destination,destination+'.zip',[...manifest.files.map(f=>f.path),'static-manifest.json','SHA256SUMS.txt'],name);
  console.log(`Prepared ${manifest.files.length} public static files: ${destination}\nOpen admin-setup.html for the offline HTTPS setup assistant. No host, domain or certificate was created.`);
 }
}
