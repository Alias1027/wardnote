// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Conservative review routing. No audio editing, speaker authentication or clinical inference.
export const INPUT_MODES=Object.freeze(['dictation','conversation']);
export const inputMode=value=>value===undefined?'dictation':value;
export const validInputMode=value=>INPUT_MODES.includes(inputMode(value));
export const REVIEW_LABELS={smalltalk:'疑似寒暄 · 请回看',context:'语境或人物待核对',uncovered:'模型未采用的原文 · 请回看'};

// Only a whole short utterance matches; mixed sentences and unknown languages stay in context review.
const greeting=/^(?:hello|hi|good (?:morning|afternoon|evening)|thank you|thanks|nice to see you|nice weather today|你好|您好|早上好|谢谢|今天天气真不错|hola|buenos días|gracias|bonjour|bonsoir|merci|здравствуйте|доброе утро|спасибо|مرحبا|مرحبًا|صباح الخير|شكرا|شكرًا|नमस्ते|धन्यवाद|سلام|شکریہ)[.!?。！？،،۔\s]*$/iu;
const speaker=/^\s*(?:doctor|dr\.?|clinician|patient|relative|daughter|son|wife|husband|speaker\s*[\w-]+|[A-Z]|医生|医师|患者|家属|女儿|儿子|妻子|丈夫|说话人\s*\w*)\s*[:：]\s*/iu;
export function reviewReason(text){return greeting.test(text.replace(speaker,''))?'smalltalk':'context';}
const held=(text,reason)=>({section:'',text,quotes:[text],use:false,reviewOnly:true,reviewReason:reason||reviewReason(text)});
export function conversationCandidates(source){
 const lines=[...source.matchAll(/[^\r\n]+/gu)].filter(m=>m[0].trim()),out=[];
 // Bound the number of controls without dropping the remaining text.
 for(let i=0;i<lines.length;i++){if(i===99){out.push(held(source.slice(lines[i].index).trim(),'context'));break;}out.push(held(lines[i][0].trim()));}
 return out;
}

// Model output may omit small talk or important context. Keep every uncovered character range for review.
// Ambiguous repeated quotes do not prove which occurrence was used, so all such occurrences stay visible.
export function completeConversationReview(proposals,source,raw=[]){
 const intervals=[];
 const out=proposals.map((p,i)=>{
  const quotes=p.quotes||[],review=raw[i]?.reviewOnly===true||quotes.some(q=>reviewReason(q)==='smalltalk')||quotes.some(q=>/^\s*(?:doctor|dr\.?|clinician|医生|医师|speaker\s*[\w-]+|[A-Z])\s*[:：]/iu.test(q));
  for(const q of quotes){const start=source.indexOf(q);if(start>=0&&source.indexOf(q,start+1)<0)intervals.push([start,start+q.length]);}
  return {...p,use:false,...(review?{reviewOnly:true,reviewReason:'context'}:{})};
 });
 intervals.sort((a,b)=>a[0]-b[0]);let cursor=0;
 const add=(start,end)=>{const text=source.slice(start,end).trim();if(text)out.push(held(text,reviewReason(text)==='smalltalk'?'smalltalk':'uncovered'));};
 for(const [start,end] of intervals){if(start>cursor)add(cursor,start);cursor=Math.max(cursor,end);}add(cursor,source.length);
 return out;
}
