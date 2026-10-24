// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {storageCapacity,recordingCapacityMessage} from './device-readiness.js';
const MiB=1024*1024;
// A conservative reserve for encrypted chunks/metadata, not a recording-duration guarantee.
export function captureCapacity(capacity,expectedBytes=0){
 const needed=16*MiB+(Number.isFinite(expectedBytes)&&expectedBytes>0?Math.ceil(expectedBytes*1.5):0);
 const level=capacity.available!==null&&Number.isFinite(capacity.available)&&capacity.available<needed?'critical':capacity.level;
 return {...capacity,level,message:recordingCapacityMessage(level)};
}
export async function checkCaptureStorage(expectedBytes=0,env=globalThis){return captureCapacity(await storageCapacity(env),expectedBytes);}
export function watchCaptureStorage({active,onCritical,onNotice,check=()=>checkCaptureStorage(),interval=10000,schedule=setInterval,cancel=clearInterval}){
 let closed=false,busy=false,last='';
 const tick=async()=>{if(closed||busy||!active())return;busy=true;try{const state=await check();if(closed||!active())return;if(state.level==='critical'){closed=true;cancel(timer);onCritical(state);}else if(state.level!==last){last=state.level;if(state.message)onNotice(state);}}catch{/* An estimate failure must not erase or stop saved audio. */}finally{busy=false;}};
 const timer=schedule(tick,interval);
 return ()=>{closed=true;cancel(timer);};
}
