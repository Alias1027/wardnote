// SPDX-License-Identifier: LicenseRef-WardNote-Personal-Noncommercial-1.0
// Quotes are checked against the supplied transcript, never against model confidence.
export function evidenceFor(proposal, source) {
 const quotes=Array.isArray(proposal.quotes)?proposal.quotes:typeof proposal.sourceQuote==='string'?[proposal.sourceQuote]:source.includes(proposal.text)?[proposal.text]:[];
 if(!quotes.length||quotes.length>5)return [];
 const out=[];
 for(const quote of [...new Set(quotes)]){
  if(typeof quote!=='string'||!quote.trim()||quote.length>100000)return [];
  const start=source.indexOf(quote);if(start<0)return [];
  const unique=source.indexOf(quote,start+1)<0;
  out.push({quote,start:unique?start:null,end:unique?start+quote.length:null});
 }
 return out;
}
export function groundCandidates(proposals,source){
 return proposals.map(p=>{const evidence=evidenceFor(p,source);if(!evidence.length)throw new Error('候选缺少有效原文依据，请重新生成');return {section:p.section,text:p.text,quotes:evidence.map(e=>e.quote),use:false};});
}
export function normalizeTranscript(result){
 if(!result||typeof result.text!=='string'||!result.text.trim()||result.text.length>200000)throw new Error('语音服务没有返回有效 text 字段');
 if(result.segments===undefined)return {text:result.text,segments:[]};
 if(!Array.isArray(result.segments)||result.segments.length>5000)throw new Error('语音片段格式无效，原始录音仍已保存');
 let cursor=0,lastStart=-1;
 const segments=result.segments.map(s=>{
  if(!s||typeof s.text!=='string'||!s.text.trim()||!Number.isFinite(s.start)||!Number.isFinite(s.end)||s.start<0||s.end<=s.start||s.end>86400||s.start<lastStart||s.speaker!==undefined&&(typeof s.speaker!=='string'||s.speaker.length>100))throw new Error('语音片段格式无效，原始录音仍已保存');
  const charStart=result.text.indexOf(s.text,cursor);if(charStart<0)throw new Error('语音片段格式无效，原始录音仍已保存');
  cursor=charStart+s.text.length;lastStart=s.start;
  return {text:s.text,start:s.start,end:s.end,speaker:s.speaker||'',charStart,charEnd:cursor};
 });
 return {text:result.text,segments};
}
export function audioEvidence(evidence,source,recording){
 if(!recording||recording.data.deletedAt||source!==recording.data.transcript)return [];
 let segments;try{segments=normalizeTranscript({text:source,segments:recording.data.transcriptSegments||[]}).segments;}catch{return [];}
 return evidence.flatMap(e=>{
  if(e.start===null)return [];
  const hits=segments.filter(s=>s.charEnd>e.start&&s.charStart<e.end);
  if(!hits.length||hits[0].charStart>e.start||hits.at(-1).charEnd<e.end)return [];
  const start=Math.min(...hits.map(s=>s.start)),end=Math.max(...hits.map(s=>s.end));
  if(recording.data.duration>0&&end>recording.data.duration+.5)return [];
  return [{start,end,speakers:[...new Set(hits.map(s=>s.speaker).filter(Boolean))]}];
 });
}
export function appliedEvidence(chosen,source,recording){
 return chosen.map(p=>{const evidence=evidenceFor(p,source);if(!evidence.length)throw new Error('候选缺少有效原文依据，请重新生成');return {section:p.section,text:p.text,quotes:evidence.map(e=>e.quote),audio:audioEvidence(evidence,source,recording)};});
}
