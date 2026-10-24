const CACHE='wardnote-shell-v0.6.15-r1';
const FILES=['/easy-start.js','/easy-start.css','/deployment-profile.js','/deployment-policy.js','/capture-storage.js','/device-readiness.js','/device-readiness-ui.js','/region-settings.js','/region-ui.js','/update-controller.css','/backup-segments.js','/update-controller.js','/continuity.js','/continuity-ui.js','/voice-routing.js','/project-info.js','/accounts.js','/patient-brief.js','/patient-brief-ui.js',"/languages.js","/locale-core.js","/locales/ar.js","/locales/fr.js","/locales/ru.js","/locales/es.js","/locales/hi.js","/locales/ur.js","/manifest-zh.webmanifest","/manifest-en.webmanifest","/manifest-ar.webmanifest","/manifest-fr.webmanifest","/manifest-ru.webmanifest","/manifest-es.webmanifest","/manifest-hi.webmanifest","/manifest-ur.webmanifest",'/','/index.html','/app.js','/domain.js','/i18n.js','/translations.js','/worksheet-ui.js','/voice-evidence.js','/panel-layout.js','/offline-store.js','/offline-api.js','/offline-ui.js','/offline-sync.js','/sync-core.js','/record-validation.js','/style.css','/manifest.webmanifest','/icons/icon.svg','/icons/icon-192.png','/icons/icon-512.png'];
const META='/__wardnote_shell_metadata__';
let repairing=false;
const assetRequests=()=>FILES.map(path=>new Request(new URL(path,self.location.origin),{cache:'reload',credentials:'same-origin'}));
async function completeShell(){const cache=await caches.open(CACHE),meta=await cache.match(META);if(meta&&(await meta.json()).repairIncomplete)return false;return (await Promise.all(FILES.map(path=>cache.match(path,{ignoreSearch:true})))).every(Boolean);}
function activeCache(worker){return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('active-unavailable'));},5000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data?.cache);};try{worker.postMessage({type:'WARDNOTE_CHECK_READINESS'},[channel.port2]);}catch(error){clearTimeout(timer);channel.port1.close();reject(error);}});}
async function repairCandidate(candidate){
 const active=self.registration.active;
 if(!candidate||candidate.state!=='installed'||!active||candidate!==self.registration.waiting)return false;
 const name=await activeCache(active);
 return typeof name==='string'&&name!==CACHE&&active===self.registration.active&&candidate===self.registration.waiting;
}
async function serverWorkerSource(signal){const response=await fetch(new Request(new URL('/sw.js',self.location.origin),{cache:'reload',credentials:'same-origin'}),{signal});if(!response.ok)throw Error('download-failed');return response.text();}
const advertisedCache=source=>source.match(/^const CACHE='([^']+)';\r?$/m)?.[1];
async function repairShell(signal){
 const candidate=self.registration.waiting;
 if(!await repairCandidate(candidate))return {ok:false,reason:'failed'};
 const before=await serverWorkerSource(signal);if(advertisedCache(before)!==CACHE)return {ok:false,reason:'version-changed'};
 // Keep complete responses in memory until every download and the second version check succeed.
 // Deployment must still publish an atomic, complete release; these checks are not per-file hashes.
 const entries=await Promise.all(assetRequests().map(async request=>{const response=await fetch(request,{signal});if(!response.ok||response.status===206)throw Error('download-failed');await response.clone().arrayBuffer();return {request,response};}));
 const after=await serverWorkerSource(signal);if(after!==before||advertisedCache(after)!==CACHE)return {ok:false,reason:'version-changed'};
 if(!await repairCandidate(candidate))return {ok:false,reason:'version-changed'};
 const cache=await caches.open(CACHE);
 // Never delete a shell here: a client may close while repair is in progress. A failed commit
 // remains explicitly incomplete, so Apply cannot activate a partially repaired candidate.
 await cache.put(META,new Response(JSON.stringify({initial:false,repairIncomplete:true}),{headers:{'Content-Type':'application/json'}}));
 const commits=await Promise.allSettled(entries.map(({request,response})=>cache.put(request,response)));
 if(commits.some(result=>result.status==='rejected'))throw Error('cache-write-failed');
 await cache.put(META,new Response(JSON.stringify({initial:false}),{headers:{'Content-Type':'application/json'}}));
 return {ok:await completeShell(),reason:undefined};
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const initial=!self.registration.active;
 const existed=(await caches.keys()).includes(CACHE),cache=await caches.open(CACHE);
 // Bypass the browser HTTP cache; servers/CDNs must still publish the complete current release.
 try{await cache.addAll(assetRequests());await cache.put(META,new Response(JSON.stringify({initial}),{headers:{'Content-Type':'application/json'}}));}
 catch(error){if(!existed)await caches.delete(CACHE);throw error;}
 // An update waits for the user's Apply action; the first installation activates normally.
})()));
self.addEventListener('message',event=>{
 if(event.data?.type==='WARDNOTE_CHECK_READINESS'&&event.ports?.[0]){
  event.waitUntil((async()=>{let ready=false;try{ready=await completeShell();}catch{}event.ports[0].postMessage({cache:CACHE,ready,files:FILES.length});})());return;
 }

 if(event.data?.type==='WARDNOTE_REPAIR_UPDATE'&&event.ports?.[0]){
  event.waitUntil((async()=>{const reply=value=>event.ports[0].postMessage(value),requester=event.source;
   if(repairing||!requester?.id||!requester.url.startsWith(self.registration.scope)){reply({ok:false,reason:'failed'});return;}
   const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),90000);repairing=true;try{const result=await repairShell(abort.signal);reply(result.ok?{ok:true}:{ok:false,reason:result.reason||'failed'});}catch{reply({ok:false,reason:'failed'});}finally{clearTimeout(timer);repairing=false;}
  })());return;
 }
 if(event.data?.type!=='WARDNOTE_APPLY_UPDATE'||!event.ports?.[0])return;
 event.waitUntil((async()=>{
  const reply=value=>event.ports[0].postMessage(value);
  const requester=event.source, scope=self.registration.scope;
  if(!requester?.id||!requester.url.startsWith(scope)||event.data.ready!==true){reply({ok:false,reason:'unready'});return;}
  const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  if(windows.some(client=>client.url.startsWith(scope)&&client.id!==requester.id)){reply({ok:false,reason:'other-windows'});return;}
  // Storage eviction may happen after install. Never switch to a now-incomplete shell.
  try{if(repairing||!await completeShell()){reply({ok:false,reason:'incomplete-cache'});return;}}catch{reply({ok:false,reason:'incomplete-cache'});return;}
  // A fresh check at the activation boundary also catches pages opened during the request.
  const finalWindows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  if(finalWindows.some(client=>client.url.startsWith(scope)&&client.id!==requester.id)){reply({ok:false,reason:'other-windows'});return;}
  reply({ok:true});await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE),meta=await cache.match(META),initial=meta&&(await meta.json()).initial;
 // Only the first install claims existing pages; an update never claims a newly opened page.
 if(initial)await self.clients.claim();
 const old=(await caches.keys()).filter(k=>k.startsWith('wardnote-shell-')&&k!==CACHE);
 // Shell caches are disposable resources, not encrypted patient data. Keep two prior releases.
 await Promise.all(old.slice(0,-2).map(key=>caches.delete(key)));
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(FILES.includes(url.pathname))event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreSearch:true})).then(r=>r||new Response('',{status:503,statusText:'Offline resource unavailable'})));
});
