import {isSpeechLanguage} from '../public/languages.js';
import { AppError } from './vault.mjs';
import {normalizeTranscript} from '../public/voice-evidence.js';
export function endpoint(value) {
  let u; try { u=new URL(value); } catch { throw new AppError(400,'服务地址配置无效'); }
  if(u.username||u.password||u.hash) throw new AppError(400,'服务地址不能包含凭据或片段');
  if(u.protocol!=='https:' && !(u.protocol==='http:' && ['127.0.0.1','localhost','[::1]'].includes(u.hostname))) throw new AppError(400,'非本机服务必须使用 HTTPS');
  return u.href;
}
export async function transcribe(bytes,mime,config) {
  if(!config.transcribeUrl) throw new AppError(503,'尚未配置院内语音服务。可先录音保存，并粘贴经核对的转写文本。');
  const body=new FormData();
  body.set('file',new Blob([bytes],{type:mime}),`recording.${mime.includes('mp4')?'m4a':mime.includes('wav')?'wav':mime.includes('mpeg')?'mp3':mime.includes('ogg')?'ogg':'webm'}`);
  if(config.language&&config.language!=='auto'){if(!isSpeechLanguage(config.language))throw new AppError(400,'识别语言无效');body.set('language',config.language);} if(config.transcribeModel) body.set('model',config.transcribeModel);
  const headers={}; if(config.transcribeToken) headers.Authorization=`Bearer ${config.transcribeToken}`;
  const response=await fetch(endpoint(config.transcribeUrl),{method:'POST',body,headers,redirect:'error',signal:AbortSignal.timeout(180000)});
  if(!response.ok) throw new AppError(502,`语音服务返回 ${response.status}，原始录音仍已保存`);
  let size=0,parts=[];for await(const chunk of response.body){size+=chunk.length;if(size>4*1024*1024)throw new AppError(502,'语音片段格式无效，原始录音仍已保存');parts.push(chunk);}
  try{return normalizeTranscript(JSON.parse(Buffer.concat(parts).toString('utf8')));}catch(error){throw new AppError(502,error.message==='语音服务没有返回有效 text 字段'?error.message:'语音片段格式无效，原始录音仍已保存');}
}
export async function sendExport(payload,config) {
  if(!config.exportUrl) throw new AppError(503,'尚未配置医院接收接口');
  const headers={'Content-Type':'application/json'}; if(config.exportToken) headers.Authorization=`Bearer ${config.exportToken}`;
  const response=await fetch(endpoint(config.exportUrl),{method:'POST',headers,body:JSON.stringify(payload),redirect:'error',signal:AbortSignal.timeout(30000)});
  if(!response.ok) throw new AppError(502,`接收接口返回 ${response.status}，未确认成功`);
  return {status:response.status};
}
