#!/usr/bin/env bash
# OpenAI's Agents API quickstart, unchanged, for comparison.
# https://developers.openai.com/api/docs/guides/agents-api/quickstart
set -euo pipefail
: "${OPENAI_API_KEY:?set OPENAI_API_KEY}"

curl --no-buffer --fail-with-body https://api.openai.com/v1/agents/sessions \
  -H "OpenAI-Beta: agents=v1" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent": {
      "model": "gpt-6-astra",
      "instructions": "Write clean code, run it, and report the actual output."
    },
    "environment": { "type": "openai_hosted" },
    "input": "Create tree.py, a Python script that prints a readable tree of the files in the current directory. Run it and show me the output.",
    "stream": true
  }'
