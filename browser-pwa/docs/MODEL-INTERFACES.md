# Optional model interfaces / 可选模型接口

Version 0.6.15. Optional speech and text model services remain server-mediated. Device recording and editing work offline; requesting a model requires the corresponding mode to authorize a connection and separately confirm the content submission. Institutional mode has separate, disabled-by-default service configuration. No vendor keys are sent to the browser. The shipped configuration makes no model calls. Enable only endpoints approved for the intended clinical data by the deploying institution.

## Two independent capabilities

1. **Speech to text**: the existing `transcribeUrl` adapter sends one saved audio file as multipart `file`, optional `model` and `language` (`zh` or `en`; auto omits it). It expects `{ "text": "source transcript" }`. The original audio remains saved on error. This is a file transcription interface, not realtime streaming.
2. **Text drafting**: the new compatible Chat Completions adapter sorts a submitted transcript into the worksheet sections, or compiles/translates a stage summary. It returns candidates only. No tool calling, browsing, automated diagnosis, orders or automatic form insertion is enabled.

界面语言、识别语言、报告语言独立。报告可保留原文，或在启用文本模型后选择中、英、西、法、俄、阿拉伯、印地、乌尔都语；模型输出仍须人工核对。语音接口当前验证契约为自动识别／中文／英语，其他语种须先完成适配器验证。修改原文、目标记录或报告语言后，原候选失效；需重新生成和核对。语音草稿加密保存在当前本机工作区，排除在临床导出及阶段汇总之外。已有摘要保留生成语言与显示方向，重新生成创建独立记录。

## Configuration

Merge the following into the local server configuration; retain the existing host, port, TLS, data receiver and audio settings:

```json
{
  "llm": {
    "enabled": false,
    "provider": "custom",
    "baseUrl": "",
    "model": "",
    "jsonMode": true
  }
}
```

Set the secret as server environment variable `NOTE_LLM_TOKEN`. Set `model` to an actual model/deployment ID available in your account, and set `enabled` to `true` only after institutional approval and testing. `baseUrl` is the API base, without `/chat/completions`. Leave it blank to use the selected provider's default below. Use `custom` for a hospital gateway. Remote services require HTTPS; redirects and embedded URL credentials are rejected. No fallback to another provider occurs on failure.

| Provider key | Default text API base | Audio integration |
| --- | --- | --- |
| `openai` | `https://api.openai.com/v1` | Multipart transcription endpoint can be configured independently |
| `deepseek` | `https://api.deepseek.com` | Use a separately configured ASR service; this adapter does not assume a DeepSeek audio endpoint |
| `doubao` | `https://ark.cn-beijing.volces.com/api/v3` | Native Doubao speech protocols require an institutional adapter returning the speech contract above |
| `qwen` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | Qwen ASR protocols require an institutional adapter unless the selected endpoint explicitly supports the multipart contract |
| `custom` | Administrator supplies it | Hospital-hosted ASR and compatible text gateways |

For OpenAI-compatible file transcription, configure `transcribeUrl` as the full transcription endpoint, `transcribeModel` as an available transcription model, and `NOTE_TRANSCRIBE_TOKEN` in the server environment. ChatGPT the consumer application is not used as an API endpoint. A ChatGPT subscription is not an API credential.

模型 ID 不写死，以免把文本模型误当作语音模型或绑定已停用型号。接口预留与模拟验证不等于四家语音服务均已完成原生对接。豆包、千问语音还需按所选产品的鉴权、音频格式、时长限制和返回结构完成适配。长录音是否需要分段，应按实际服务限制确定；失败时原声保留，不自动丢弃或静默切换厂商。

## Review and provenance

The clinician explicitly submits the selected transcript, sees the destination, reviews generated passages alongside the source, chooses sections and checks the passages to append. Note and draft updates commit in one database transaction with encounter and version validation; repeated requests cannot append twice. Inserted notes become unreviewed. Provider, model, generation language/time and clinician-review metadata remain linked to the note. Source recording versions are checked before insertion.

For translated summaries, the selected encounter/date-range compilation is submitted only when the clinician chooses a target language and generates the summary. The original compilation and source versions remain stored, and changed source versions during generation abort saving. Existing summaries are never changed by UI locale switching.

## Verification limits

Local tests use fictional content and mock endpoints for all four provider profiles, including invalid JSON, disallowed section keys, truncated output, missing consent, disabled service and duplicate insertion checks. No real vendor account, real patient recording, recognition accuracy or cross-language clinical fidelity has been tested. A successful adapter test does not establish clinical accuracy. Evaluate representative accents, background noise, multiple speakers, negation, medication names, units and dates before clinical deployment.

## Official references consulted

- [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text)
- [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
- [DeepSeek Chat Completions](https://api-docs.deepseek.com/api/create-chat-completion/)
- [Qwen OpenAI compatibility](https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope)
- [Doubao OpenAI compatibility](https://docs.volcengine.com/docs/ark/compatible-with-openai-sdk?lang=zh)
- [Doubao file speech recognition](https://docs.volcengine.com/docs/DoubaoVoice/AudioFileRecognitionStandardEdition?lang=zh)

Model availability, regional endpoints and native speech protocols must be checked against the configured service at deployment time.


## 0.6.3: transcript evidence and optional time positions

Encrypted original audio remains part of the product. **The no-audio-persistence proposal is not adopted.** Existing manual retention and important-clip rules remain unchanged; this release does not add silent deletion or send recordings to a model automatically.

The existing speech result {"text":"..."} remains supported. An institutional adapter may additionally return segments: [{"text":"exact contiguous passage from text","start":3,"end":8,"speaker":"A"}]. Times are seconds from the start of the submitted original recording, not from a stripped-silence or resampled fragment timeline. Segment texts must occur in transcript order; times must be finite, nonnegative and ordered, with end greater than start. Speaker labels are unverified service labels, not authenticated doctor/patient identities. No provider-native adapter, VAD, diarization engine or offline ASR is bundled by this change.

Malformed optional segments reject the response without replacing a saved transcript or recording. Valid segments are retained as transcriptSegments. If absent, ambiguous, outside the known recording duration, or the draft text differs from the saved transcript, the UI offers full-recording playback rather than inventing a position. Replay starts one second before an available segment and lets the user hear surrounding context. ASR time positions are aids to review, not verified clinical timestamps.

Text classification now requests proposals: [{"section":"allowed key","text":"candidate","quotes":["verbatim source passage"]}]. Each quote must match the supplied transcript exactly. Missing quotes are accepted only when candidate text itself is a verbatim source passage; translated or reformulated candidates need explicit original-language quotes. Unmatched quotes fail the request. Repeated passages may remain valid quotes but do not receive a guessed unique timestamp. This checks source correspondence, not semantic entailment: a matching quote does not prove that the candidate is clinically correct.

Candidates remain unselected by default. Editing a candidate or target section cancels its selection; changing source text, report language or target note invalidates generated candidates. Reviewed insertion stores the selected text, original quotes, available source time ranges, recording identity/version and provider/reviewer metadata in the note's assistance field. It is included in the note export and preserved when the working draft is reused. Existing source-version and atomic insertion guards still apply. Older reformulated drafts without matching quotes must be regenerated.

Medication names, amounts, units, routes, frequencies, duration and formulation must not be inferred from typical practice. Preserve active, past, proposed, stopped and withheld status, negation, uncertainty, event time and the person concerned. The review reminder is shown once per candidate group. No confidence percentage grants automatic approval; formal prescribing and EHR signing remain external.

Privacy and evaluation: no-training commitments do not mean no processing by a provider. For strict institutional data residency, assess an institution-operated ASR/model service; reaching that server still requires network access. Test authorized representative audio for drug/dose/unit errors, negation, person/time attribution, omissions, unsupported additions and correction time before adopting a model or fine-tuning. Existing speech-language limits remain explicit. SOAP may later be an export view; any DART mapping requires an agreed local definition.
