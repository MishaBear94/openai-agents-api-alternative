# Moving from the OpenAI Agents API to Gobare

Checked against both sides' public documentation on 28 September 2026. The reasoning behind each
row, and the other alternatives, are in
[OpenAI Agents API alternatives](https://gobare.dev/blog/openai-agents-api-alternative).

| OpenAI Agents API | Gobare |
|---|---|
| `POST /v1/agents/sessions` | `POST /v1/sessions` |
| `agent.model`, `agent.instructions`, `input` | Same fields |
| `OpenAI-Beta: agents=v1` header | None |
| `environment: { type: "openai_hosted" }` | None — every session has a sandbox |
| Streamed response on create | `GET /v1/sessions/{id}/events` (SSE, resumable with `Last-Event-ID`), or signed webhooks |
| `/workspace/outputs` becomes artifacts | Same path, same rule; `GET /v1/sessions/{id}/artifacts` |
| Keep-alives; sandbox deletable after an hour idle | Paused after 5 idle minutes, woken by the next input; reclaimed two hours after start, snapshot first |
| Vault credentials keep secrets out of the sandbox | The model key never enters the sandbox; other secrets are environment variables inside it |
| Subagents inside a session | None; run several sessions from your service as a crew (`parent_session_id`) |
| Function tools | Function tools as `required_actions`, plus approvals and questions |
| Model tokens and containers billed by OpenAI | Tokens billed by your model provider; sandbox compute by Gobare |
