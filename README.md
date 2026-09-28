# OpenAI Agents API alternative: the same session, on any model

OpenAI's [Agents API](https://developers.openai.com/api/docs/guides/agents-api/overview) runs a hosted
agent in a sandbox, on OpenAI models. This repository shows the same task running on
[Gobare](https://gobare.dev) — a hosted agent runtime that runs any model on your own key — with
the two requests side by side, so you can see exactly what changes if you move.

The full comparison, including every other alternative (Rebyte, Open Managed Agents, AstraBox,
DigitalOcean Managed Agents, Claude Managed Agents, Mistral, Bedrock AgentCore) and where each one
loses, is here:

**→ [OpenAI Agents API alternatives in 2026: hosted, compatible, and self-hosted](https://gobare.dev/blog/openai-agents-api-alternative)**

## Run it

| Script | What it does |
|---|---|
| [`examples/openai.sh`](examples/openai.sh) | OpenAI's quickstart request, unchanged: create a session on `gpt-6-astra` and stream it |
| [`examples/gobare.sh`](examples/gobare.sh) | The same task on Gobare with curl: connect a model key once, create the session, stream its events |
| [`examples/gobare-run.mjs`](examples/gobare-run.mjs) | The same again in Node 18+, no dependencies: create, wait for the turn to settle, print the agent's answer, delete the session |

```bash
export OPENAI_API_KEY=sk-...
./examples/openai.sh

export GOBARE_TOKEN=gbr_pat_...          # from https://app.gobare.dev
export MODEL_KEY=sk-ant-...              # any provider Gobare connects: Anthropic, OpenAI, xAI, OpenRouter, DeepSeek, Qwen, Kimi, GLM, MiniMax
./examples/gobare.sh
node examples/gobare-run.mjs
```

## What changes

`agent.model`, `agent.instructions` and `input` mean the same thing on both. The differences:

- **No beta header, no `environment` block.** Every Gobare session gets its own sandboxed computer.
- **The model is whatever key you connected.** It is verified when you save it and never enters the sandbox.
- **Events come from their own endpoint** (`GET /v1/sessions/{id}/events`, resumable with `Last-Event-ID`) or from signed webhooks, not from a `stream` flag on create.
- **Not wire-compatible.** Gobare is conceptually aligned with the Agents API but is not a drop-in for the `openai` package. If you need that, look at Rebyte or Open Managed Agents — the comparison above covers both.

The concept-by-concept map is in [MIGRATION.md](MIGRATION.md).

## Limits worth knowing before you switch

A sandbox is reclaimed two hours after it starts (paused time included; the workspace is snapshotted
first). 25 concurrent sessions per organization by default. One sandbox provider, no
bring-your-own-compute. Secrets other than the model key are injected into the sandbox. No
subagents. See [docs.gobare.dev/limits](https://docs.gobare.dev/limits).

## Links

- Gobare docs: <https://docs.gobare.dev> · quickstart: <https://docs.gobare.dev/quickstart>
- OpenAPI description (no token needed): <https://api.gobare.dev/v1/openapi.json>
- OpenAI Agents API docs: <https://developers.openai.com/api/docs/guides/agents-api/overview>

MIT licensed.
