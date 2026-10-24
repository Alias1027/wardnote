// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
import {createHash} from 'node:crypto';
import {AppError} from './vault.mjs';
import {endpoint} from './integrations.mjs';
const uuid=/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
export function authorizationService(vault,mode,config={}){
 const destinations=config.authorizationDestinations||[];
 if(!Array.isArray(destinations)||destinations.length>5)throw new Error('Invalid authorization destinations');
 for(const d of destinations){endpoint(d.url);if(!['email','api','database'].includes(d.kind)||!d.id||d.id.length>60||(d.kind==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.recipient||'')))throw new Error('Invalid authorization destination');}
 if(new Set(destinations.map(d=>d.id)).size!==destinations.length)throw new Error('Duplicate destination ID');
 let active=Promise.resolve();
 const describe=()=>destinations.map(d=>({id:d.id,kind:d.kind,address:d.kind==='email'?d.recipient:new URL(d.url).origin}));
 async function submit(events){
  if(!Array.isArray(events)||events.length>100)throw new AppError(400,'授权记录格式无效');
  // Keep only the fixed event envelope. Never accept patient data or credential fields.
  const clean=events.map(e=>{if(!e||!uuid.test(e.id)||!uuid.test(e.accountId)||e.mode!==mode||e.method!=='password'||!['allowed','denied','cancelled','revoked','connection-failed'].includes(e.outcome)||!Number.isFinite(Date.parse(e.time)))throw new AppError(400,'授权记录格式无效');return {id:e.id,accountId:e.accountId,mode,method:'password',outcome:e.outcome,time:e.time};});
  for(const event of clean){const old=vault.authorizationGet(event.id);if(old&&JSON.stringify(old.event)!==JSON.stringify(event))throw new AppError(409,'授权记录标识冲突');}
  for(const event of clean)if(!vault.authorizationGet(event.id))vault.authorizationPut(event.id,{event,receivedAt:new Date().toISOString(),receipts:{}});
  const receipts=[],deadline=Date.now()+8000;
  for(const event of clean){let row=vault.authorizationGet(event.id);for(const d of destinations){const target=createHash('sha256').update(JSON.stringify([d.id,d.url,d.recipient||''])).digest('hex');if(row.receipts[target]?.accepted||Date.now()>deadline)continue;
    try{const headers={'Content-Type':'application/json','Idempotency-Key':`${mode}:${event.id}:${target}`};if(d.tokenEnv&&process.env[d.tokenEnv])headers.Authorization=`Bearer ${process.env[d.tokenEnv]}`;
      const r=await fetch(endpoint(d.url),{method:'POST',headers,redirect:'error',signal:AbortSignal.timeout(5000),body:JSON.stringify({format:'wardnote-authorization/1',destination:{kind:d.kind,recipient:d.recipient||null},event,receivedAt:row.receivedAt})});
      if(r.body)await r.body.cancel();row.receipts[target]={accepted:r.ok,status:r.status,attemptedAt:new Date().toISOString()};
    }catch{row.receipts[target]={accepted:false,attemptedAt:new Date().toISOString()};}
    vault.authorizationPut(event.id,row);
   }
   const accepted=destinations.length>0&&destinations.every(d=>row.receipts[createHash('sha256').update(JSON.stringify([d.id,d.url,d.recipient||''])).digest('hex')]?.accepted);
   receipts.push({id:event.id,state:accepted?'accepted':destinations.length?'pending':'unconfigured'});
  }
  return {receipts,destinations:describe()};
 }
 return {describe,submit(events){const job=active.then(()=>submit(events));active=job.catch(()=>{});return job;}};
}
