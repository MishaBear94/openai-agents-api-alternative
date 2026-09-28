// The same task on Gobare in Node 18+, no dependencies.
// Create a session, wait for its turn to settle, print the agent's answer, delete the session.
// Docs: https://docs.gobare.dev/quickstart · spec: https://api.gobare.dev/v1/openapi.json

const API = process.env.GOBARE_API ?? 'https://api.gobare.dev'
const TOKEN = process.env.GOBARE_TOKEN
const MODEL = process.env.GOBARE_MODEL ?? 'claude-sonnet-4-6' // a model your connected key runs
if (!TOKEN) throw new Error('set GOBARE_TOKEN (https://app.gobare.dev)')

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`)
  return text ? JSON.parse(text) : null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const session = await call('POST', '/v1/sessions', {
  agent: { model: MODEL, instructions: 'Write clean code, run it, and report the actual output.' },
  input:
    'Create tree.py, a Python script that prints a readable tree of the files in the current directory. Run it and show me the output.',
})
console.error(`session ${session.id}`)

try {
  // A turn is `working` until it settles as completed, failed or cancelled.
  // The session can also fail before any turn exists — a model connection it
  // cannot use, for instance — so watch both, and give up after 15 minutes.
  const deadline = Date.now() + 15 * 60_000
  let turn
  for (;;) {
    turn = (await call('GET', `/v1/sessions/${session.id}/turns?limit=1`)).data[0]
    if (turn && turn.status !== 'working') break
    const current = await call('GET', `/v1/sessions/${session.id}`)
    if (current.status === 'failed') {
      const items = await call('GET', `/v1/sessions/${session.id}/items?limit=20`)
      const error = items.data.find((i) => i.type === 'error')
      throw new Error(`session failed: ${error?.detail?.message ?? 'no error item'}`)
    }
    // A turn parked on a function call you declared shows up here, not on the
    // turn. This example declares none, so it should never happen.
    if (current.status === 'requires_action') throw new Error('the agent is waiting on a required action')
    if (Date.now() > deadline) throw new Error('gave up after 15 minutes')
    await sleep(3000)
  }
  if (turn.status !== 'completed') throw new Error(`turn ${turn.status}: ${JSON.stringify(turn.error)}`)

  // The answer is the newest assistant message item.
  const items = await call('GET', `/v1/sessions/${session.id}/items?limit=50`)
  const answer = items.data.find((i) => i.type === 'message' && i.role === 'assistant')
  console.log(answer?.content ?? '(no assistant message)')
} finally {
  await call('DELETE', `/v1/sessions/${session.id}`)
}
