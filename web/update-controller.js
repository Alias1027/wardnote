// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Same-origin program resources only; never uploads clinical data or authorizes sync.
export const UPDATE_MESSAGES={
 available:'发现可用版本',
 explanation:'更新会保存当前记录并重新打开页面；请先结束录音，并关闭其他 WardNote 页面或窗口。',
 apply:'保存并更新',later:'稍后',show:'查看更新',working:'正在保存并更新…',
 recording:'请先结束并保存当前录音，再应用更新。',
 busy:'请先完成或取消当前操作，再应用更新。',
 save:'保存未完成，更新已取消；当前草稿仍保留在此页面。',
 other:'请先关闭其他 WardNote 浏览器页面或 PWA 窗口，再重试更新。',
 failed:'更新尚未应用；当前页面和记录仍保留，请稍后重试。',
 expired:'待更新版本已变化，请重新打开更新提示后重试。',
 check:'检查更新',checking:'正在检查更新…',current:'当前可取得的版本已是最新；未更改记录。',
 unreachable:'暂时无法检查更新；请确认此地址可连接后重试。',
 incomplete:'新版下载未完成，仍可继续使用当前版本。',
 unsupported:'此浏览器无法使用自动更新；请先保存记录并结束录音，再重新打开页面。',
 close:'关闭提示',title:'程序更新',privacy:'仅检查本应用的程序文件，不上传记录或录音，也不启用资料同步。',
 policy:'有新版时提示，由你决定何时保存并更新。',
 resumed:'页面已恢复，请先保存记录并结束录音，再应用更新。',repair:'重新下载更新',repairing:'正在重新下载程序文件…'
};
export const UPDATE_INTERVAL=5*60*1000,UPDATE_THROTTLE=30*1000;
export function updateEntryHTML(translate=x=>x){return `<div class="update-entry"><button type="button" class="btn small" data-check-update>${translate(UPDATE_MESSAGES.check)}</button><small>${translate(UPDATE_MESSAGES.policy)}</small></div>`;}
export function updateBlocker({recording,busy,saved}){return recording?'recording':busy?'busy':saved===false?'save':null;}
function askWorker(worker,type='WARDNOTE_APPLY_UPDATE'){return new Promise((resolve,reject)=>{
 const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('timeout'));},type==='WARDNOTE_REPAIR_UPDATE'?120000:8000);
 channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data);};
 try{worker.postMessage({type,ready:true},[channel.port2]);}catch(error){clearTimeout(timer);channel.port1.close();reject(error);}
});}
export function setupUpdates({translate=x=>x,flush=async()=>true,recording=()=>false,busy=()=>false,saved=()=>true}={}){
 const supported='serviceWorker'in navigator;
 let registration,registering,waiting,applying=false,compact=false,reason='',reloadTimer,checking=false,repairing=false,lastCheck=-Infinity,manual=false,status='',installedFailure=false,loadedController=supported?navigator.serviceWorker.controller:null;
 const watched=new WeakSet();
 const host=document.createElement('section');host.id='update-notice';host.hidden=true;host.setAttribute('aria-live','polite');
 const style=document.createElement('link');style.rel='stylesheet';style.href='/update-controller.css';
 document.head.append(style);document.body.append(host);
 const label=key=>translate(UPDATE_MESSAGES[key]);
 const makeButton=(id,key,fn)=>{const button=document.createElement('button');button.id=id;button.type='button';button.className='btn small';button.textContent=label(key);button.disabled=applying||(['apply','repair','check'].includes(key)&&repairing)||(key==='check'&&checking);button.addEventListener('click',fn);return button;};
 function paint(){host.hidden=!waiting&&!manual;host.classList.toggle('compact',!!waiting&&compact&&!applying);host.replaceChildren();if(host.hidden)return;
  if(waiting&&compact&&!applying){host.append(makeButton('update-show','show',()=>{compact=false;paint();}));return;}
  const title=document.createElement('strong');title.textContent=label(applying?'working':waiting?'available':'title');host.append(title);
  const description=document.createElement('p');description.textContent=label(waiting?'explanation':'privacy');host.append(description);
  if(reason||status){const text=document.createElement('p');text.id='update-check-status';text.className=reason?'update-error':'';text.textContent=label(reason||status);host.append(text);}
  const actions=document.createElement('div');actions.className='actions';
  if(waiting){actions.append(makeButton('update-apply','apply',apply),makeButton('update-later','later',()=>{compact=true;manual=false;paint();}));if(reason==='incomplete'||repairing)actions.append(makeButton('update-repair','repair',repair));else if(reason)actions.append(makeButton('update-check','check',()=>check(true)));}
  else actions.append(makeButton('update-check','check',()=>check(true)),makeButton('update-close','close',()=>{manual=false;paint();}));
  host.append(actions);
 }
 function dirtyForm(){return [...document.querySelectorAll('form[data-update-dirty]')].some(form=>form.getClientRects().length>0);}
 function freeze(on){applying=on;document.body.classList.toggle('update-applying',on);for(const element of document.body.children)if(element!==host&&element.tagName!=='STYLE'){if(on){element.dataset.updateWasInert=element.inert?'1':'0';element.inert=true;}else if(element.hasAttribute('data-update-was-inert')){element.inert=element.dataset.updateWasInert==='1';delete element.dataset.updateWasInert;}}paint();}
 function blocked(checkSaved=false){return updateBlocker({recording:recording(),busy:busy()||dirtyForm(),saved:checkSaved?saved():undefined});}
 function candidateForPage(){return registration?.waiting||(loadedController&&registration?.active&&registration.active!==loadedController?registration.active:null);}
 async function repair(){if(applying||repairing)return;const candidate=registration?.waiting;if(!candidate||candidate!==waiting){reason='expired';paint();return;}repairing=true;reason='';status='repairing';paint();
  try{const result=await askWorker(candidate,'WARDNOTE_REPAIR_UPDATE');if(!result?.ok)reason=result?.reason==='version-changed'?'expired':'incomplete';else status='';}
  catch{reason='incomplete';}finally{repairing=false;if(reason)status='';paint();}
 }
 async function apply(){if(applying||repairing)return;reason=blocked();if(reason){paint();return;}
  const candidate=candidateForPage();if(!candidate||candidate!==waiting||!['installed','activated'].includes(candidate.state)){reason='expired';showWaiting(candidate);paint();return;}
  freeze(true);let acknowledged=false;
  const finish=()=>{if(!applying||!acknowledged||candidate.state!=='activated')return;clearTimeout(reloadTimer);candidate.removeEventListener('statechange',finish);reason=blocked(true);if(reason){freeze(false);return;}location.reload();};
  try{
   if(!await flush()){reason='save';freeze(false);return;}
   await new Promise(resolve=>setTimeout(resolve,0));
   reason=blocked(true);if(reason){freeze(false);return;}
   if(candidateForPage()!==candidate){reason='expired';freeze(false);return;}
   // A restored old page may face an already active new worker. Still require save + explicit Apply.
   if(candidate.state==='activated'){location.reload();return;}
   if(candidate.state!=='installed'){reason='expired';freeze(false);return;}
   candidate.addEventListener('statechange',finish);
   const result=await askWorker(candidate);
   if(!result?.ok){candidate.removeEventListener('statechange',finish);reason=result?.reason==='other-windows'?'other':result?.reason==='incomplete-cache'?'incomplete':'failed';freeze(false);return;}
   acknowledged=true;
   reloadTimer=setTimeout(()=>{candidate.removeEventListener('statechange',finish);if(applying){reason='failed';freeze(false);}},12000);
   finish();
  }catch{candidate.removeEventListener('statechange',finish);clearTimeout(reloadTimer);reason='failed';freeze(false);}
 }
 // Unsolicited controller changes NEVER reload this page. Only acknowledged, guarded Apply does.
 if(supported)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!loadedController)loadedController=navigator.serviceWorker.controller;else if(!applying)showWaiting(candidateForPage());});
 document.addEventListener('input',event=>{const form=event.target.closest?.('form');if(form&&!event.target.dataset.record)form.dataset.updateDirty='1';},true);
 document.addEventListener('change',event=>{const form=event.target.closest?.('form');if(form&&!event.target.dataset.record)form.dataset.updateDirty='1';},true);
 function showWaiting(worker){if(!worker){if(waiting&&waiting.state!=='installed'){waiting=null;reason='';}paint();return;}if(waiting!==worker){waiting=worker;compact=false;reason='';status='';}paint();}
 function observeWorker(worker){if(!worker||watched.has(worker))return;watched.add(worker);let activated=worker.state==='activated';worker.addEventListener('statechange',()=>{
  if(worker.state==='activated')activated=true;
  if(worker.state==='installed'&&registration?.active)showWaiting(registration.waiting||worker);
  if(worker.state==='redundant'){if(worker===waiting)showWaiting(candidateForPage());if(!activated){installedFailure=true;if(!applying){status='incomplete';manual=true;reason='';paint();}}}
 });}
 async function registered(){if(registration)return registration;if(registering)return registering;
  registering=navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(value=>{registration=value;showWaiting(candidateForPage());observeWorker(value.installing);value.addEventListener('updatefound',()=>observeWorker(value.installing));return value;}).finally(()=>{registering=null;});return registering;
 }
 function settled(worker){return new Promise((resolve,reject)=>{if(!worker||['installed','activated'].includes(worker.state)){resolve();return;}const done=()=>{if(!['installed','activated','redundant'].includes(worker.state))return;clearTimeout(timer);worker.removeEventListener('statechange',done);worker.state==='redundant'?reject(Error('incomplete')):resolve();};const timer=setTimeout(()=>{worker.removeEventListener('statechange',done);reject(Error('timeout'));},30000);worker.addEventListener('statechange',done);done();});}
 async function check(explicit=false){if(applying||repairing)return;if(explicit){manual=true;compact=false;paint();}if(checking)return;
  if(!explicit&&(document.hidden||Date.now()-lastCheck<UPDATE_THROTTLE))return;
  lastCheck=Date.now();checking=true;installedFailure=false;status='checking';reason='';paint();
  try{if(!supported){status='unsupported';return;}const reg=await registered();await reg.update();await settled(reg.installing);showWaiting(candidateForPage());status=waiting?'':installedFailure?'incomplete':'current';}
  catch{status=installedFailure?'incomplete':'unreachable';}
  finally{checking=false;paint();}
 }
 document.addEventListener('click',event=>{if(event.target.closest?.('[data-check-update]')){event.preventDefault();check(true);}});
 window.addEventListener('focus',()=>check());window.addEventListener('online',()=>{lastCheck=-Infinity;check();});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 window.addEventListener('pageshow',event=>{if(event.persisted){clearTimeout(reloadTimer);freeze(false);if(waiting){reason='resumed';compact=false;paint();}lastCheck=-Infinity;check();}});
 setInterval(()=>check(),UPDATE_INTERVAL);
 new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
 check();
 return {refresh:paint,check:()=>check(true)};
}
