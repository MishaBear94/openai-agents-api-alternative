#!/usr/bin/env bash
# The same task on Gobare, with curl. Docs: https://docs.gobare.dev/quickstart
set -euo pipefail
: "${GOBARE_TOKEN:?set GOBARE_TOKEN (https://app.gobare.dev)}"
API="${GOBARE_API:-https://api.gobare.dev}"
MODEL="${GOBARE_MODEL:-claude-sonnet-4-6}"   # must be a model your connected key runs

# 1. Once per organization: connect a model key. Verified on save; never enters a sandbox.
#    Skip if you have already connected one.
if [ -n "${MODEL_KEY:-}" ]; then
  curl -s --fail-with-body -X POST "$API/v1/model-credentials" \
    -H "Authorization: Bearer $GOBARE_TOKEN" \
    -H "content-type: application/json" \
    -d "{\"key\":\"$MODEL_KEY\"}" > /dev/null
fi

# 2. Create the session with its opening message. Same three fields as OpenAI's request.
SESSION=$(curl -s --fail-with-body -X POST "$API/v1/sessions" \
  -H "Authorization: Bearer $GOBARE_TOKEN" \
  -H "content-type: application/json" \
  -d "{
    \"agent\": {
      \"model\": \"$MODEL\",
      \"instructions\": \"Write clean code, run it, and report the actual output.\"
    },
    \"input\": \"Create tree.py, a Python script that prints a readable tree of the files in the current directory. Run it and show me the output.\"
  }" | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
echo "session: $SESSION" >&2

# 3. Stream what the agent does. Server-sent events; reconnect with Last-Event-ID to resume.
#    Ctrl-C when you have seen enough, then delete the session:
#    curl -X DELETE "$API/v1/sessions/$SESSION" -H "Authorization: Bearer $GOBARE_TOKEN"
curl --no-buffer -s "$API/v1/sessions/$SESSION/events" \
  -H "Authorization: Bearer $GOBARE_TOKEN" \
  -H "accept: text/event-stream"
