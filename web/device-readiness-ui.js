// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {t,locale} from './i18n.js';
import {inspectDevice} from './device-readiness.js';
import {formatDateTime,formatQuantity} from './region-settings.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show=v=>t(v===true?'可用':v===false?'不可用':'未知');
const amount=v=>Number.isFinite(v)?`${formatQuantity(v/1048576,locale())} MiB`:t('未知');
export const readinessButton=()=>`<button type="button" class="btn" data-action="offline-device-state">${t('设备与脱机状态')}</button>`;
export async function readinessHTML(){
 const r=await inspectDevice();
 return `<p class="notice">${t(r.level==='ready'?'可以使用':r.level==='prepare'?'需要准备':'暂不支持')}</p><p class="muted">${t('仅检查本机，不发送患者资料。')}</p><dl><dt>${t('安全访问')}</dt><dd>${show(r.secure)}</dd><dt>${t('加密与账号锁')}</dt><dd>${show(r.crypto&&r.locks)}</dd><dt>${t('本机读写')}</dt><dd>${show(r.storage.writable)}</dd><dt>${t('离线资源')}</dt><dd>${t(r.offline.ready&&r.offline.controlled?'可以使用':'需要准备')}</dd><dt>${t('录音支持（可选）')}</dt><dd>${show(r.microphone)}</dd></dl>${capacityHTML(r.capacity)}<p>${t('检查通过不代表已备份；录音权限仍由浏览器另行请求。')}</p>${r.level==='prepare'?`<p>${t('保持连接完成首次准备，再关闭并重新打开本页面；患者资料不会自动上传。')}</p>`:''}${r.level==='unsupported'?`<p>${t('请使用支持加密存储的普通浏览器及可信地址；不会改用明文保存。')}</p>`:''}<p><bdi>${esc(location.origin)}</bdi></p>`;
}
export function capacityHTML(u){return `<p>${t('已使用约')} ${amount(u.usage)} / ${amount(u.quota)}</p><p>${t('估计可用空间')}：${amount(u.available)}</p><p>${t(u.persistent===true?'浏览器已允许持久存储；仍需备份。':u.persistent===false?'浏览器未保证持久存储；请及时备份。':'存储状态未知，请及时备份。')}</p><p>${t(u.level==='critical'?'存储空间紧张，请先备份。已保存片段保留，暂停新增录音。':u.level==='warning'?'存储空间较少，请尽快结束录音并备份。':'容量为浏览器估计，不代表可长期保存的承诺。')}</p>`;}
export function backupStatusHTML(status){
 const time=value=>`<time datetime="${esc(value)}">${esc(formatDateTime(value,locale()))}</time>`;
 const line=(kind,label)=>{const value=status[kind];return `<p>${t(label)}：${value?`${time(value.at)} · ${t(value.matchesCurrent?'对应当前已保存资料':'之后已有修改，请再次备份核验')}<br><small class="muted">${t('备份生成时间')}：${time(value.createdAt)}</small>`:t('暂无记录')}</p>`;};
 return line('offered','最近提供下载')+line('written','最近文件夹写入完成')+line('verified','最近核验通过')+`<p class="muted">${t('下载提示不等于文件已保存；核验记录仅属于当前账号及所核验版本。')}</p>`;
}
export function migrationHTML({mode,username}={}){return `<p><b>${t('当前资料位置')}</b>：<bdi>${esc(location.origin)}</bdi>${username?` · ${t(mode==='institution'?'机构／医院':'个人')} · <bdi>${esc(username)}</bdi>`:''}</p><ol><li>${t('在原浏览器完成并核验加密备份，保留全部分卷和清单。')}</li><li>${t('在新设备或新地址准备程序，选择相同账号模式并恢复到新账号。')}</li><li>${t('检查记录、历史与原声后，再决定是否清理旧副本。')}</li></ol><p>${t('地址、端口或浏览器不同，资料不会自动共享；同名账号不等于跨设备账号。')}</p><p>${t('本机资料不等于备份。清除浏览器数据会删除本机工作区；请定期下载加密备份。')}</p>`;}
