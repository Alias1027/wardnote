import {nativeReady,nativeCall,writeNativeFile,nt} from './android-platform.js';
import {STATIC_ONLY,STATIC_NOTICE,requireNetworkDeployment} from './deployment-policy.js';
import {authenticateAccount,accountStatus} from './accounts.js';
// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {t} from './i18n.js';
import {device,localApi,setExternalRequest} from './offline-api.js';
import {remote} from './offline-sync.js';
import {requestPersistentStorage} from './device-readiness.js';
import {readinessButton,readinessHTML,capacityHTML,backupStatusHTML,migrationHTML} from './device-readiness-ui.js';
import {canonical,syncRecord,selectedRecords} from './sync-core.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(id,label)=>`<button type="button" class="btn" data-action="${id}">${esc(t(label))}</button>`;
const field=(name,label,type='text')=>`<div class="field"><label for="offline-${name}">${esc(t(label))}</label><input id="offline-${name}" name="${name}" type="${type}" required ${type==='password'?'minlength="12" autocomplete="off"':''}></div>`;
const check=(id,label)=>`<label class="check"><input type="checkbox" name="${id}"> ${esc(label)}</label>`;
let hooks,local=false,online=false,busy=false;
const urls=new Set();
export const isLocal=()=>local;
export const isOfflineBusy=()=>busy;
export function setupOfflineUI(h){
 hooks=h;setExternalRequest((...args)=>remote.request(...args));
 const revoke=()=>{online=false;remote.controller.abort();remote.authorized=false;remote.csrf='';remote.remoteId=null;};
 const refreshMode=()=>{document.querySelectorAll('.device-mode').forEach(el=>el.textContent=modeLabel());const panel=document.querySelector('#offline-settings');if(panel)panel.outerHTML=networkPanel();};
 device.onChange=()=>{
  if(!local||!device.key)return;
  const context=device.context();
  device.allowed().then(allowed=>{device.assertContext(context);if(!allowed){revoke();refreshMode();}}).catch(error=>{
   // A background permission read may finish after another page signs out.
   if(context.generation!==device.generation||context.mode!==device.mode)return;
   revoke();refreshMode();hooks.notice(t(error.message),true);
  });
  hooks.notice(t('本机资料可能已在其他页面更新；保存时将核对版本。'));
 };
 device.onLock=()=>{if(local){revoke();clearAudio();hooks.locked();}};
}
export async function bootOffline(){local=true;online=false;if(await device.status())await device.network(false);return true;}
export function accountPicker(){return `<fieldset class="account-modes"><legend>${t('账号模式')}</legend>${['personal','institution'].map(mode=>`<button type="button" class="btn ${device.mode===mode?'primary':''}" data-action="offline-mode" data-id="${mode}" aria-pressed="${device.mode===mode}">${t(mode==='personal'?'个人':'机构／医院')}</button>`).join('')}</fieldset><p class="muted">${t('默认脱机；登录后须先注销才能切换账号模式。')}</p>`;}
export function authExtras(initialized=true){return local?`<p class="notice">${t('本机加密工作区；使用创建此本机工作区时设置的密码。')}</p>${initialized?`<p class="muted">${t('旧版工作区可输入新账号名及原密码，绑定并保留已有资料。')}</p>`:''}<div class="actions">${button(initialized?'account-create':'account-login',initialized?'新建账号':'已有账号登录')}${button('offline-restore','恢复本机加密备份')}${readinessButton()}</div>`:`<div class="divider"></div><p>${t('也可建立独立的本机脱机工作区；服务器原有资料保留，可稍后手动下载。')}</p><div class="actions">${button('offline-create','建立本机脱机工作区')}${button('offline-restore','恢复本机加密备份')}${readinessButton()}</div>`;}
export function networkPanel(){
 const context=device.context();if(local&&device.key)queueMicrotask(()=>refreshBackupSummary(context));
 return `<section class="panel" id="offline-settings"><h2>${t('脱机与联网')}</h2>${STATIC_ONLY?`<p class="notice">${t(STATIC_NOTICE)}</p>`:''}<p class="notice">${t(local?(online?'联网已允许；记录仍先保存到本机，资料不自动上传。':'脱机模式：记录与录音仅保存到本机。'):'当前使用服务器工作区；本机服务可以不依赖互联网运行。')}</p><div class="actions">${local?(STATIC_ONLY?'':button(online?'offline-disconnect':'offline-connect',online?'切换为脱机':'切换为联网')):button('offline-create','建立本机脱机工作区')}${local&&online?button('offline-authorization','授权发送状态')+button('offline-pull','下载服务器资料')+button('offline-push','上传本机资料'):''}${local?button('offline-backup','下载本机加密备份')+button('offline-verify-backup','核验备份文件')+button('offline-storage','检查本机存储'):''}${readinessButton()}${button('offline-migrate','换设备或地址')}</div><p class="muted">${t('本机资料不等于备份。清除浏览器数据会删除本机工作区；请定期下载加密备份。')}</p>${local?`<details><summary>${t('备份状态与资料位置')}</summary><p>${t('当前资料位置')}：<bdi>${esc(location.origin)}</bdi> · ${esc(t(device.mode==='personal'?'个人':'机构／医院'))} · <bdi>${esc(device.username)}</bdi></p><div data-backup-status aria-live="polite"></div></details>`:''}</section>`;
}
export async function refreshBackupSummary(context=device.context()){
 try{const status=await device.backupStatus(context);device.assertContext(context);const target=document.querySelector('[data-backup-status]');if(target)target.innerHTML=backupStatusHTML(status);}catch{try{device.assertContext(context);const target=document.querySelector('[data-backup-status]');if(target)target.textContent=t('备份状态暂不可读；已保存文件不受影响。');}catch{}}
}
// Recording evidence is separate from clinical records. A metadata failure must
// never reclassify a successfully written/verified backup as unusable.
export async function rememberBackupResult(kind,counts,context=device.context()){
 try{const matched=await device.rememberBackup(kind,counts,context);await refreshBackupSummary(context);return matched?'':t('已核验外来备份；未标记当前账号已备份。');}catch{return t('备份文件已完成，但本机备份状态未能更新；请保留文件并重新核验。');}
}
export function modeLabel(){return local?`${t(device.mode==='personal'?'个人':'机构／医院')} · ${t(online?'本机保存 · 联网已允许':'本机保存 · 脱机')}`:t('服务器工作区');}
export async function ask(title,content,submit='确认'){
 const d=document.querySelector('#modal');if(d.open)d.close();d.innerHTML=`<form id="offline-form"><div class="modal-head"><h2>${esc(t(title))}</h2></div><div class="modal-body">${content}</div><div class="modal-foot">${button('close-modal','取消')}<button type="submit" class="btn primary">${esc(t(submit))}</button></div></form>`;d.showModal();const file=d.querySelector('#offline-file'),count=d.querySelector('#backup-file-count');if(file&&count){d.querySelector('#backup-pick-file')?.addEventListener('click',()=>file.click());file.addEventListener('change',()=>{count.textContent=`${t('文件数量')}：${file.files.length}`;});}
 return new Promise(resolve=>{let complete=false;const onClose=()=>{if(!d.open)done(null);};const done=v=>{if(complete)return;complete=true;d.removeEventListener('close',onClose);resolve(v);};d.addEventListener('close',onClose);d.querySelector('form').addEventListener('submit',e=>{e.preventDefault();e.stopPropagation();done(new FormData(e.target));d.close();});});
}
export async function ready(){await nativeReady();}

function patientChecks(patients){return `<fieldset><legend>${t('选择本次资料范围')}</legend>${patients.map(p=>check(`patient:${p.id}`,`${p.bed||''} · ${p.displayName||p.data?.displayName||''} · ${p.caseId||p.data?.caseId||''}`)).join('')}</fieldset>${check('audio',t('同时包含原始录音（默认不选）'))}<p>${t('学习复盘和语音候选草稿不参与同步。')}</p>`;}
const ids=f=>[...f.keys()].filter(k=>k.startsWith('patient:')).map(k=>k.slice(8));
async function resolvePull(snapshot){let result=await remote.importSnapshot(snapshot);if(!result.conflicts)return true;const f=await ask('存在不同版本，请逐条核对',result.conflicts.map(({local:l,remote:r})=>`<section><strong>${esc(l.type)} · ${esc(l.id)}</strong><div class="two-col"><div><h3>${t('本机版本')}</h3><pre class="sync-diff">${esc(JSON.stringify(l.data,null,2))}</pre></div><div><h3>${t('服务器版本')}</h3><pre class="sync-diff">${esc(JSON.stringify(r.data,null,2))}</pre></div></div><label>${t('采用版本')}<select name="${l.id}" required><option value="">${t('请选择')}</option><option value="local">${t('保留本机版本，稍后手动上传')}</option><option value="remote">${t('采用服务器版本，本机旧版保留在修改历史')}</option></select></label></section>`).join(''),'确认版本选择');if(!f)return false;result=await remote.importSnapshot(snapshot,Object.fromEntries([...f].map(([id,choice])=>[id,{choice,expected:canonical(syncRecord(result.conflicts.find(x=>x.local.id===id).local))}])));if(result.conflicts)throw new Error('记录已变化，请重新载入后核对');return true;}
function backupFilesField(legacy=true){return `<div class="field"><label for="offline-file">${t('本机备份文件')}</label><div class="actions"><button type="button" class="btn" id="backup-pick-file" aria-label="${t('选择')} ${t('本机备份文件')}">${t('选择')}</button><span id="backup-file-count" aria-live="polite">${t('文件数量')}：0</span></div><input class="sr-only" tabindex="-1" id="offline-file" name="file" type="file" multiple accept=".wnmanifest,.wnpart${legacy?',.json':''}" aria-describedby="backup-file-count" required></div><p class="muted">${t(legacy?'请选择同一备份的清单及全部分卷；也可选择一份旧版JSON备份。':'请选择同一备份的清单及全部分卷。')}</p>`;}
function backupProgress(){const d=document.querySelector('#modal');if(d.open)d.close();d.innerHTML=`<div class="modal-head"><h2>${t('分卷加密备份')}</h2></div><div class="modal-body"><p>${t('备份期间请保持本页打开；完成前生成的部分文件不能用于恢复。')}</p><p id="backup-progress" aria-live="polite"></p></div><div class="modal-foot"><button type="button" class="btn" id="backup-cancel">${t('取消')}</button></div>`;let cancelled=false;const cancel=e=>{e.preventDefault();cancelled=true;d.querySelector('#backup-cancel').disabled=true;};d.addEventListener('cancel',cancel);d.querySelector('#backup-cancel').addEventListener('click',cancel);d.showModal();return {update:name=>{if(cancelled)throw new Error('备份已取消；已生成的部分文件不能用于恢复。');d.querySelector('#backup-progress').textContent=name;},close:()=>{d.removeEventListener('cancel',cancel);d.close();}};}
function backupCounts(c){return `<p>${t('文件数量')}：${c.files} · ${t('记录数量')}：${c.records} · ${t('录音数量')}：${c.recordings}</p><p>${t('录音数据量')}：${(c.audioBytes/1048576).toFixed(2)} MiB · ${t('备份数据量')}：${(c.bytes/1048576).toFixed(2)} MiB</p>`;}
export async function offlineAction(a,id){if(['offline-connect','offline-pull','offline-push','offline-authorization'].includes(a))requireNetworkDeployment();if(!a.startsWith('offline-')&&!a.startsWith('account-'))return false;if(busy)throw new Error('正在处理资料，请等待当前操作完成。');if(hooks.recording())throw new Error('请先结束并保存当前录音。');busy=true;try{
 if(a==='account-create'||a==='account-login'){if(device.key||device.authenticating)throw new Error('请先注销当前账号后再切换模式。');hooks.auth(a==='account-login');return true;}
 if(a==='offline-mode'){device.selectMode(id);online=false;hooks.auth(await accountStatus(device.mode));return true;}
 if(a==='offline-create'){
  await ready();if(await device.status()){local=true;online=false;hooks.locked();return true;}
  const f=await ask('建立本机脱机工作区',`<p>${t('本机密码与服务器密码可以不同；原有服务器资料不会自动复制或删除。')}</p>${field('clinician','记录者姓名')}${field('password','本机工作区密码','password')}${field('repeat','再次输入密码','password')}`,'建立本机工作区');if(!f)return true;if(f.get('password')!==f.get('repeat'))throw new Error('两次密码不一致');
  const workspace=await device.setup(f.get('password'),f.get('clinician'));local=true;online=false;await hooks.enter(workspace);hooks.notice(t('本机工作区已建立；可在设置中联网并手动下载已有资料。'));
 }
 if(a==='offline-restore'){await ready();const f=await ask('恢复本机加密备份',`<p>${t('恢复到新账号；不会覆盖已有账号资料。')}</p>${field('username','账号')}${backupFilesField()}${field('password','备份密码','password')}`,'核验并恢复');if(!f)return true;const workspace=await authenticateAccount(device,{username:f.get('username'),password:f.get('password'),file:f.getAll('file')});local=true;online=false;await hooks.enter(workspace);}
 if(a==='offline-connect'){
  const s=await device.state();const f=await ask('确认切换为联网',`<p>${t('连接目标')}：<bdi>${esc(location.origin)}</bdi></p><p>${t('本次只允许连接，不自动上传记录或录音。')}</p><p>${t('云端识别和外部发送仍须另行确认。')}</p><p>${t('本机记录数量')}：${s.records.filter(r=>!['voiceDraft','reflection'].includes(r.type)).length}</p><p><b>${t(device.mode==='personal'?'个人联网授权':'机构／医院联网授权')}</b></p>${field('password','独立联网授权密码','password')}<details><summary>${t('首次配置本机服务器')}</summary>${check('create',t('在本机建立此模式的服务器工作区'))}<p>${t('机构服务器由管理员预先配置；不能从远程浏览器建立。')}</p></details><p>${t('本次授权记录及此前待发送记录将提交到本模式的预留接收端；不包含患者资料和密码。')}</p>`,'确认联网');if(!f){await device.authorization('cancelled');return true;}await remote.connect(f.get('password'),f.has('create'));online=true;await hooks.refresh();
 }
 if(a==='offline-disconnect'){online=false;const saved=await remote.disconnect();await hooks.refresh();if(!saved)hooks.notice(t('本机保存未完成。'),true);}
 if(a==='offline-pull'){
  const census=await remote.census();const f=await ask('选择下载到本机的资料',patientChecks(census.patients),'预览并下载');if(!f)return true;if(!ids(f).length)throw new Error('请选择患者');const snapshot=await remote.snapshot(ids(f));if(await resolvePull(snapshot)){if(f.has('audio'))await remote.downloadAudio(snapshot);await hooks.refresh();hooks.notice(t('所选资料已保存到本机。'));}
 }
 if(a==='offline-push'){
  const s=await device.state();const f=await ask('选择上传到服务器的资料',patientChecks(s.records.filter(r=>r.type==='encounter').map(r=>({id:r.id,...r.data}))),'预览同步范围');if(!f)return true;if(!ids(f).length)throw new Error('请选择患者');const count=selectedRecords(s.records,ids(f)).length;const approved=await ask('确认同步所选资料',`<p>${t('连接目标')}：<bdi>${esc(location.origin)}</bdi></p><p>${t('记录数量')}：${count}</p><p>${t(f.has('audio')?'包含所选患者的原始录音。':'不包含原始录音。')}</p><p>${t('只发送所选范围，不调用云端识别，不自动写入医院正式病历。')}</p>`,'确认同步');if(!approved)return true;const plan=await remote.plan(ids(f),f.has('audio'));
  if(plan.conflicts?.length){const snapshot=await remote.snapshot(ids(f));await resolvePull(snapshot);await hooks.refresh();hooks.notice(t('版本已保留，请重新预览上传范围。'));return true;}
  const result=await remote.commit(plan);if(result.conflicts?.length)throw new Error('服务器记录已变化，请重新下载并核对版本。');await hooks.refresh();hooks.notice(t(result.localChanged?'版本已保留，请重新预览上传范围。':'所选资料已同步；本机副本仍保留。'));
 }
 if(a==='offline-authorization'){try{await remote.flushAuthorizations();}catch{}const s=await device.state(),items=s.authorizations||[];await ask('授权发送状态',`<p>${t('接收端接受数')}：${items.filter(x=>x.state==='accepted').length} · ${t('待发送或待配置')}：${items.filter(x=>x.state!=='accepted').length}</p><p>${esc((remote.destinations||[]).map(x=>x.address).join(' · ')||t('未配置接收端，记录继续保留。'))}</p><p>${t('接收端接受不代表邮件已入箱或数据库业务处理已完成。')}</p>`,'关闭');}
 if(a==='offline-backup'){
  const context=device.context();
  const accepted=await ask('分卷加密备份',`<p>${nt('backup')}</p>`,'开始备份');if(!accepted)return true;
  device.assertContext(context);const folder=await nativeCall('chooseBackupFolder',{},0),progress=backupProgress();
  try{const counts=await device.backupSegmented(async(blob,name)=>{device.assertContext(context);progress.update(name);await writeNativeFile(blob,name,{folder:folder.token,check:()=>{device.assertContext(context);progress.update(name);}});});
   const warning=await rememberBackupResult('written',counts,context);progress.close();await ask('分卷备份结果',`<p>${nt('saved')}</p>${warning?`<p>${esc(warning)}</p>`:''}${backupCounts(counts)}`,'关闭');
  }finally{progress.close();await nativeCall('releaseFolder',{token:folder.token}).catch(()=>{});}return true;
 }
 if(a==='offline-verify-backup'){const context=device.context();const f=await ask('核验备份文件',`${backupFilesField(false)}${field('password','备份密码','password')}<p>${t('只核验备份，不更改当前工作区。')}</p>`,'开始核验');if(!f)return true;device.assertContext(context);const counts=await device.verifyBackup(f.getAll('file'),f.get('password'));const markerNotice=await rememberBackupResult('verified',counts,context);await ask('备份核验通过',`${markerNotice?`<p class="notice">${esc(markerNotice)}</p>`:''}${backupCounts(counts)}<p>${t('清单、全部分卷、记录及录音校验通过；当前工作区未更改。')}</p>`,'关闭');}
 if(a==='offline-device-state'){await ask('设备与脱机状态',await readinessHTML(),'关闭');}
 if(a==='offline-migrate'){await ask('换设备或地址',migrationHTML({mode:device.mode,username:device.username}),'关闭');}
 if(a==='offline-storage'){const u=await device.usage();const yes=await ask('本机存储状态',`${capacityHTML(u)}${check('persistent',t('请求浏览器保留本机资料（仍需备份）'))}`,'确认');if(yes?.has('persistent')){await requestPersistentStorage();await ask('本机存储状态',capacityHTML(await device.usage()),'关闭');}}
 if(a==='offline-recover'){const yes=await ask('恢复已保存的录音片段',`<p>${t('只恢复中断前已经保存的片段；未保存声音无法恢复。时长为估算，恢复后请回听核对。')}</p>`,'保留已保存片段');if(yes){await localApi(`/recordings/${id}/recover`,'POST',{});await hooks.refresh();}}
 if(a==='offline-audio'){const blob=await device.audio(id),url=URL.createObjectURL(blob);urls.add(url);const audio=document.querySelector(`#memo-${CSS.escape(id)} audio`);audio.src=url;await audio.play();}
 return true;
 }finally{busy=false;}}
export async function logoutOffline(){if(local){online=false;const saved=await remote.disconnect();try{await localApi('/logout','POST',{});}catch{device.lock();hooks.notice(t('本机保存未完成。'),true);}finally{clearAudio();}if(!saved)hooks.notice(t('本机保存未完成。'),true);}}
export function clearAudio(){for(const u of urls)URL.revokeObjectURL(u);urls.clear();}
