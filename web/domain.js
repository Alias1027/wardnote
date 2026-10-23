import {handoffStale} from './continuity.js';
import {translate,dictionaries} from './locale-core.js';
import {PRE_ROUND} from './worksheet-ui.js';
export const VERSION = '0.6.15';
export const SCHEMAS = {
  initial: [
    ["hpi", "就诊诉求与现病史", "相关背景 → 时间线 → 关键阳性／阴性；患者优先关切。 症状及影响；诱发／缓解因素；既往评估／治疗反应。"],
    ["pmh", "既往病史", "诊断／并发症；专科诊疗；既往检查。 跌倒／意识丧失。"],
    ["procedures", "手术操作与重大医疗事件", "手术／住院／急诊就诊；外伤； 装置／支持治疗；并发症。"],
    ["medications", "用药史", "处方药／非处方药／补充剂；实际使用／依从性／疗效；近期调整／用药差异。 相关用药详情；处方医生／药房／核实来源。"],
    ["allergies", "过敏与不良反应", "相关药物或物质／反应／严重程度；无已知过敏、不明或未评估。"],
    ["family", "家族史", "亲属关系／疾病／发病年龄；遗传模式。 如家族史不明，请注明。"],
    ["social", "社会背景与暴露史", "居住／支持／资源可及性；职业／旅行／暴露； 烟酒及其他物质使用；饮食／活动／睡眠。"],
    ['contacts','联系与转诊信息','患者联系方式、基层医生、转诊医生及照护者'],
    ['source','病史来源与沟通支持','患者 / 照护者 / 既往记录；可靠性、翻译与沟通支持'],
    ['vitals','生命体征','血压 / 心率 / 呼吸 / 体温 / 血氧及氧疗 / 体重；记录实际测量'],
    ["ros", "系统回顾", "全身／皮肤／头眼耳鼻咽喉／心血管／呼吸／消化／泌尿生殖； 肌肉骨骼／神经／内分泌／血液／淋巴／精神。"],
    ["exam", "体格检查", "一般情况／皮肤／头眼耳鼻咽喉／颈部／心肺／腹部； 四肢／肌肉骨骼／神经／精神状态／重点发现。"],
    ["reproductive", "性与生育史", "月经／绝经／妊娠；避孕／生育计划； 性伴侣／性行为／性传播感染史／防护。"],
    ["function", "功能与精神状态", "日常活动／行动能力／跌倒；认知／情绪； 用药管理；安全／自伤风险。"],
    ["vaccines", "预防接种核查", "流感／新冠／RSV；Td/Tdap；肺炎球菌／带状疱疹； HPV／乙肝／麻腮风／水痘；按风险或旅行需要接种。"],
    ["prevention", "预防保健核查", "肿瘤；心血管／代谢；骨骼；HIV/HCV； 心理／物质使用。核对适用条件与既往结果。"],
    ["results", "关键检查结果与补充资料", "相关检验／影像及其他结果；日期／来源／临床意义。 缺失资料／下一步；必要时继续补充记录。"],
    ['communication','共同决策与随访','患者理解、偏好、复查和返回就诊条件'],
    ['continuation','续页记录','其他未归类信息；可自由扩展']
  ],
  daily: [
    ['goal','今日目标与优先级','需要优先解决的问题；今天希望达到的结果'],
    ["course", "住院病程与近期变化", "入院情况／病程；近期事件；患者关切；与患者／家属沟通要点。"],
    ['vitals','生命体征、氧疗与出入量','完整复核；注明时间、意识状态、氧疗方式与流量、输入输出；按本院要求记录监测频率'],
    ["medications", "每日用药与管路／装置复核", "当前用药：必要性／安全性／疗效；入院前用药核对。 抗菌药复评；管路／导管必要性；调整及依据。"],
    ["exam", "重点查体与系统回顾", "变化及关键阳性／阴性发现。 一般情况／心肺／腹部／皮肤／四肢／神经。"],
    ['results','关键结果与趋势','与检查表对照，注明采样时间和单位。危急结果：通知对象与时间 → 已采取行动 → 复评时间（按本院流程）'],
    ["safety", "每日安全与支持治疗复核", "生命体征／氧疗／出入量；营养／吞咽； 疼痛／睡眠；排便／排尿；活动／康复； 静脉血栓栓塞／出血；跌倒／皮肤／谵妄。"],
    ["discharge", "出院计划", "尚未达到的出院医疗条件 去向／照护／设备／资源可及性／随访"],
    ['communication','患者 / 家属沟通','讨论内容、患者意愿、理解情况与分歧'],
    ['handoff','应变预案与交接','如果…则…；升级条件、负责／上级医师及联系方式、复核时间、照护限制、接收方确认（按本院流程）'],
    ['continuation','补充记录','复杂患者可继续添加，不限纸张长度']
  ],
  background: [
    ["pmh", "相关既往病史", "诊断／并发症；专科诊疗； 既往检查／治疗反应。"],
    ["procedures", "手术操作与重大医疗事件", "手术／住院／急诊就诊；外伤； 装置／支持治疗；并发症。"],
    ["medications", "入院前用药史", "处方药／非处方药／补充剂；用药详情／实际使用／依从性； 信息来源／药房；用药差异。每日调整见每日查房。"],
    ["allergies", "过敏史及反应", "致敏物／反应／严重程度。 无已知过敏／不明／未评估。"],
    ["social", "社会与家庭背景", "居住／支持／资源可及性；家族史；职业／暴露； 烟酒及其他物质使用；按需采集性与生育史。"],
    ["function", "基线功能与精神状态", "日常活动／行动能力／辅具／跌倒；认知／情绪； 沟通能力／安全风险。"],
    ["goals", "诊疗目标与决策", "目标／决策能力／代理决策人；预立医疗指示。 当前复苏医嘱状态及治疗范围限制见查房页。"],
    ["contacts", "联系人与照护资源", "照护者／基层医生／专科医生／药房；口译； 居家服务／设备／沟通偏好。"],
    ["support", "持续照护需求与资料", "基线营养／吞咽／氧疗及其他支持；康复／居家服务／资源可及性；缺失资料。"],
    ["updates", "背景信息更新（注明日期）", "日期／来源／更新内容／已告知的医生；信息冲突。"]
  ]
};
export const PROBLEM_FIELDS = [
  ['title','问题'], ['assessment','当前判断 / 状态'], ['evidence','支持与反对的依据'],
  ['alternative','替代解释 / 不确定性'], ['plan','主要计划'], ['monitor','预期反应 / 监测与复核'], ['contingency','如果…则… / 升级条件']
];
export function dateLocal(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function blankNote(kind='daily') { return {kind,date:dateLocal(),fields:{},problems:[],sources:[],review:null}; }
export function classify(text, kind='daily') {
  const valid = new Set(SCHEMAS[kind].map(s=>s[0]));
  const rules = [
    ['allergies',/^(过敏|allerg)/i], ['medications',/^(药物|用药|抗菌药|管路|导管|medication|meds|devices|daily medication|home medication)/i],
    ['vitals',/^(生命体征|血压|心率|体温|血氧|出入量|vitals|bp\b|hr\b|spo2)/i],
    ['results',/^(检验|检查结果|化验|影像|关键结果|labs?\b|results?\b|imaging)/i],
    ['exam',/^(查体|体检|physical|exam|focused examination)/i], ['hpi',/^(主诉|现病史|hpi|chief|presenting concerns)/i],
    ['pmh',/^(既往史|既往病史|pmh)/i], ['family',/^(家族史|family)/i], ['social',/^(社会史|social)/i],
    ['course',/^(病程|间期事件|患者诉|患者说|subjective|interval|hospital course)/i], ['communication',/^(沟通|患者意愿|家属|communication|patient \/ family communication|shared decisions)/i],
    ['discharge',/^(出院|discharge)/i], ['handoff',/^(交接|预案|handoff|如果|contingency plan)/i], ['safety',/^(安全|营养|康复|safety|daily safety)/i],
    ['source',/^(病史来源|history source)/i], ['contacts',/^(联系与转诊|contact \/ pcp)/i], ['procedures',/^(手术|procedures and major events)/i],
    ['reproductive',/^(性与生育|sexual and reproductive)/i], ['function',/^(功能与精神|function and mental status)/i],
    ['ros',/^(系统回顾|review of systems)/i], ['vaccines',/^(预防接种|immunization review)/i], ['prevention',/^(预防保健|preventive care review)/i],
    ['results',/^(key results|selected data trends)/i]
  ];
  return text.split(/\n+/).map(s=>s.trim()).filter(Boolean).map(line=>{
    const heading=line.split(/[:：]/,1)[0].trim().toLowerCase();
    const labelled=SCHEMAS[kind].find(([,label])=>[label,...Object.values(dictionaries).map(d=>d[label])].some(s=>s&&s.toLowerCase()===heading));
    let section = labelled?.[0] || rules.find(([,r])=>r.test(line))?.[0] || 'continuation';
    if (!valid.has(section)) section = section==='hpi'&&kind==='daily'?'course':'continuation';
    return {section,text:line,quotes:[line],reason:section==='continuation'?'未明确归类，保留原文待选择':'按明确的段首标签建议，待人工确认'};
  });
}
export function sourcesChanged(summary, records) {
  if(summary.data.format==='wardnote-sbar/1')return handoffStale(summary.data,records);
  const map = new Map(records.map(r=>[r.id,r]));
  if ((summary.data.sources||[]).some(s=> !map.has(s.id) || map.get(s.id).version!==s.version)) return true;
  const snapshot = summary.data.pendingTaskSnapshot;
  if (!snapshot) return false; // Older summaries keep their original source contract.
  const current = records.filter(r=>r.encounterId===snapshot.encounterId&&r.type==='task'&&!r.data.done&&!r.data.deletedAt);
  return current.length!==snapshot.ids.length || current.some(r=>!snapshot.ids.includes(r.id));
}
export function composeSummary(encounter, records, from='', to='9999-12-31', labelLanguage='zh') {
  const t=text=>translate(text,labelLanguage);
  const ui=(parts,...values)=>parts.reduce((out,part,i)=>out+t(part)+(i<values.length?values[i]:''),'');
  const same = records.filter(r=>r.encounterId===encounter.id&&!r.data.deletedAt);
  const chosen = same.filter(r=> r.type==='background' || (['note','lab','task','recording','memo'].includes(r.type) && (r.type!=='task'||r.data.done) && (r.data.date||r.createdAt.slice(0,10))>=from && (r.data.date||r.createdAt.slice(0,10))<=to));
  // Pending work is a current snapshot, separate from the selected narrative period.
  const pending = same.filter(r=>r.type==='task'&&!r.data.done).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
  const pendingTaskSnapshot = {encounterId:encounter.id,asOf:new Date().toISOString(),ids:pending.map(r=>r.id)};
  const taskLine = d=>ui`【${t(d.kind==='result'?'待回报':'待办')} · ${t(d.done?'已完成':'待跟进')}】${d.title}；负责人：${d.owner||t('未指定')}；期限：${d.due||t('未填')}；下一步 / 联系方式：${d.next||t('未填')}${d.outcome?'；'+t('结果 / 完成依据')+'：'+d.outcome:''}${d.done&&d.completedAt?'；'+t('完成时间')+'：'+d.completedAt:''}`;
  const lines = [`${encounter.data.displayName} · ${encounter.data.caseId||t('未填住院标识')}`, ui`覆盖日期：${from||encounter.data.admitted||t('入院')} 至 ${to==='9999-12-31'?dateLocal():to}`, ''];
  for (const r of chosen.sort((a,b)=>(a.data.date||a.createdAt).localeCompare(b.data.date||b.createdAt))) {
    const d=r.data;
    if(r.type==='note') {
      lines.push(`【${d.date} ${t(d.kind==='initial'?'初诊':'查房')} · ${t(d.review?'医生已复核':'待医生复核')}】`);
      if(d.preRound){const checks=PRE_ROUND.filter(([key])=>d.preRound[key]?.checkedAt).map(([key,label])=>t(label)+' '+d.preRound[key].checkedAt);if(checks.length)lines.push(t('查房前信息核对')+'：'+checks.join('；'));if(d.preRound.notes)lines.push(t('来源时间与待核实事项')+'：'+d.preRound.notes);}
      for (const [key,label] of SCHEMAS[d.kind]||[]) if(d.fields?.[key]) lines.push(`${t(label)}：${d.fields[key]}`);
      for (const p of d.problems||[]) lines.push(...PROBLEM_FIELDS.filter(([k])=>p[k]).map(([k,l])=>`${t(l)}：${p[k]}`));
    }
    if(r.type==='lab') lines.push(ui`【检查】${d.sampledAt||d.date} ${d.name} ${d.value} ${d.unit||''}；来源：${d.source||t('未填')}；${t(d.verified?'原报告已核对':'未核对原报告')}`);
    if(r.type==='background') { lines.push(t('【住院背景 · 当前已保存内容】')); for(const [k,l]of SCHEMAS.background)if(d.fields?.[k])lines.push(`${t(l)}：${d.fields[k]}`); }
    if(r.type==='memo') lines.push(ui`【备忘】${d.title}：${d.text}`);
    if(r.type==='task') lines.push(taskLine(d));
    if(r.type==='recording' && (d.important || d.memo)) lines.push(ui`【语音备忘】${d.title||t('查房录音')}：${d.memo||t('需回听原声')}；${d.hold?t('暂停清理'):''}`);
    lines.push('');
  }
  lines.push(t('【当前未完成事项快照】'),`${t('截至时间（UTC）')}：${pendingTaskSnapshot.asOf}`,t('不受上述日期范围限制；交接时请核对当前状态。'));
  lines.push(...(pending.length?pending.map(r=>taskLine(r.data)):[t('没有未完成事项。')]));
  return {text:lines.join('\n'),labelLanguage,from,to:to==='9999-12-31'?dateLocal():to,pendingTaskSnapshot,sources:[{id:encounter.id,version:encounter.version},...[...chosen,...pending].map(r=>({id:r.id,version:r.version}))],review:null};
}
export function retentionDecision(recording, records, policy, now=Date.now()) {
  const d=recording.data;
  if(d.deletedAt) return {eligible:false,reason:'已清理',deleted:true};
  if(!d.finalized) return {eligible:false,reason:'录音未完成或上传待恢复'};
  if(d.important || d.parentId) return {eligible:false,reason:'重要原声 / 独立片段，持续保留'};
  if(d.hold) return {eligible:false,reason:'存在保留事项'};
  if(now-new Date(recording.createdAt).getTime() < policy.days*86400000) return {eligible:false,reason:`未满 ${policy.days} 天`};
  if(!d.audioReviewed) return {eligible:false,reason:'原录音尚未复核'};
  if(!d.noFurtherNeed) return {eligible:false,reason:'尚未确认无进一步回听需要'};
  const same=records.filter(r=>r.encounterId===recording.encounterId || r.id===recording.encounterId);
  if(same.some(r=>r.type==='review'&&r.data.status==='corrections'&&!same.some(x=>x.type==='resolution'&&x.data.reviewId===r.id))) return {eligible:false,reason:'本次住院仍有未处理的医患核对意见'};
  if(!same.some(r=>r.type==='note'&&r.data.review&&r.data.sources?.some(s=>s.id===recording.id))) return {eligible:false,reason:'缺少关联本录音的已复核临床记录'};
  const summary=same.find(r=>r.type==='summary' && r.data.review && !sourcesChanged(r,records) && r.data.sources?.some(s=>s.id===recording.id && s.version===recording.version));
  if(!summary) return {eligible:false,reason:'缺少覆盖本录音且来源未变的已审核摘要'};
  return {eligible:true,reason:'达到候选条件，仍需手动确认清理',summaryId:summary.id};
}

export function clinicalRecords(records, encounterId) {
  return records.filter(r=>(r.id===encounterId||r.encounterId===encounterId)&&!['reflection','voiceDraft'].includes(r.type));
}
export function pendingReviews(records, encounterId=null) {
  return records.filter(r=>(encounterId===null||r.encounterId===encounterId)&&(
    (r.type==='note'&&!r.data.review)||
    (r.type==='summary'&&(!r.data.review||sourcesChanged(r,records)))||
    (r.type==='review'&&r.data.status==='corrections'&&!records.some(x=>x.type==='resolution'&&x.encounterId===r.encounterId&&x.data.reviewId===r.id))
  ));
}

// Admission date is hospital day 1; calendar arithmetic avoids DST offsets.
export function hospitalDay(admitted, until=dateLocal()) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(admitted||''))return null;
 const end=until||dateLocal();if(!/^\d{4}-\d{2}-\d{2}$/.test(end))return null;
 const startMs=Date.parse(admitted+'T00:00:00Z'),endMs=Date.parse(end+'T00:00:00Z');
 if(!Number.isFinite(startMs)||!Number.isFinite(endMs)||new Date(startMs).toISOString().slice(0,10)!==admitted||new Date(endMs).toISOString().slice(0,10)!==end||endMs<startMs)return null;
 return Math.floor((endMs-startMs)/86400000)+1;
}

