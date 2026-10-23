// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Layout preferences only: never store patient identifiers, drafts, or audio here.
const key='wardnote-panel-layout';
const names=['voice','tasks'];
let positions={};try{positions=JSON.parse(localStorage.getItem(key)||'{}');}catch{}
export function clampPosition(x,y,width,height,vw,vh){return {x:Math.max(8,Math.min(Number.isFinite(x)?x:8,Math.max(8,vw-width-8))),y:Math.max(8,Math.min(Number.isFinite(y)?y:90,Math.max(8,vh-height-90)))};}
function save(){try{localStorage.setItem(key,JSON.stringify(positions));}catch{}}
export function placePanels(){
 document.querySelectorAll('[data-floating]').forEach(el=>{
  if(innerWidth<=700){el.style.left='';el.style.top='';return;}
  const name=el.dataset.floating,p=positions[name]||{x:document.documentElement.dir==='rtl'?24+names.indexOf(name)*32:innerWidth-el.offsetWidth-24-names.indexOf(name)*32,y:110+names.indexOf(name)*24};
  const next=clampPosition(p.x,p.y,el.offsetWidth,el.offsetHeight,innerWidth,innerHeight);el.style.left=next.x+'px';el.style.top=next.y+'px';
 });
}
export function dockPanel(name,side){const el=document.querySelector(`[data-floating="${name}"]`);if(!el)return;positions[name]={x:side==='left'?16:innerWidth-el.offsetWidth-16,y:100};if(side==='reset')delete positions[name];save();placePanels();}
export function bindPanelDragging(){
 let drag=null;
 document.addEventListener('pointerdown',e=>{const handle=e.target.closest('[data-drag-handle]');if(!handle||e.target.closest('button')||innerWidth<=700||e.button!==0)return;const el=handle.closest('[data-floating]'),r=el.getBoundingClientRect();drag={el,handle,id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};handle.setPointerCapture(e.pointerId);});
 document.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const {el}=drag,p=clampPosition(e.clientX-drag.dx,e.clientY-drag.dy,el.offsetWidth,el.offsetHeight,innerWidth,innerHeight);el.style.left=p.x+'px';el.style.top=p.y+'px';positions[el.dataset.floating]=p;});
 const end=()=>{if(drag){save();drag=null;}};document.addEventListener('pointerup',end);document.addEventListener('pointercancel',end);
 window.addEventListener('resize',placePanels);window.visualViewport?.addEventListener('resize',()=>{document.documentElement.style.setProperty('--available-height',window.visualViewport.height+'px');placePanels();});
}
