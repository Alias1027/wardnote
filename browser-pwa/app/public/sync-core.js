// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
export function syncRecord(record){const r=structuredClone(record);delete r.data.localParts;delete r.data.lastSavedAt;delete r.data.audioMissing;return r;}
export const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
export function compareRecord(local,remote,base){const a=canonical(syncRecord(local)),b=remote?canonical(syncRecord(remote)):null;if(a===b)return 'same';if(!base)return remote?'conflict':'new';if(!remote)return 'conflict';if(b===base)return 'push';if(a===base)return 'pull';return 'conflict';}
export function selectedRecords(records,ids){const selected=new Set(ids);return records.filter(r=>selected.has(r.id)||selected.has(r.encounterId)).filter(r=>!['voiceDraft','settings','reflection'].includes(r.type)).map(syncRecord);}
