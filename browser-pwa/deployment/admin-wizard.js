// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Classic script deliberately works when admin-setup.html is opened as file://.
// No fetch, telemetry, credentials, server launch, certificate or account changes.
(function(root){
 'use strict';
 const headers={
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  'Permissions-Policy':'microphone=(self), camera=(), geolocation=()',
  'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Cache-Control':'no-cache','Service-Worker-Allowed':'/'
 };
 function configuration(value){
  const input=String(value).trim();let url;
  try{url=new URL(input.includes('://')?input:'https://'+input);}catch{throw new Error('请输入有效的专用域名 / Enter a valid dedicated domain.');}
  const valid=url.hostname.length<=253&&url.hostname.split('.').length>1&&url.hostname.split('.').every(p=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(p));
  if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'||url.search||url.hash||url.port||!valid||/^\d+(?:\.\d+){3}$/.test(url.hostname))throw new Error('须为专用 HTTPS 域名根路径，不含端口、子路径或账号信息 / Use an HTTPS domain at / without a port, subpath or credentials.');
  const config=`# Run from this package directory. Serve only ./site; no backend or database.\n${url.hostname} {\n\troot * ./site\n\tencode zstd gzip\n\theader {\n${Object.entries(headers).map(([key,value])=>'\t\t'+key+' "'+value+'"').join('\n')}\n\t}\n\t@api path /api /api/*\n\trespond @api 404\n\t@unsupported not method GET HEAD\n\trespond @unsupported 405\n\tfile_server {\n\t\thide _headers\n\t}\n}\n`;
  return {origin:url.origin,config,start:'caddy validate --config Caddyfile --adapter caddyfile\ncaddy run --config Caddyfile --adapter caddyfile',verify:`curl.exe -I ${url.origin}/\ncurl.exe -i ${url.origin}/api/status`};
 }
 root.WardNoteDeployment=Object.freeze({configuration});
 if(!root.document)return;
 const $=selector=>root.document.querySelector(selector);let result=null;
 $('#setup-form').addEventListener('submit',event=>{event.preventDefault();$('#setup-error').textContent='';$('#result').hidden=true;result=null;try{result=configuration($('#domain').value);for(const key of ['origin','config','start','verify'])$('#'+key).textContent=result[key];$('#result').hidden=false;$('#result').scrollIntoView({behavior:'smooth',block:'start'});}catch(error){$('#setup-error').textContent=error.message;}});
 $('#download').addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([result.config],{type:'application/octet-stream'})),link=root.document.createElement('a');link.href=url;link.download='Caddyfile';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})(globalThis);
