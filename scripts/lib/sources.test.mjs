import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchStats, fetchActivity } from './sources.mjs'

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body })
const fail = (status) => async () => ({ ok: false, status, json: async () => ({}) })

test('fetchStats unwraps the ApiResponse envelope', async () => {
  const stats = await fetchStats({ fetchImpl: ok({ success: true, data: { total_candles: 5 } }) })
  assert.deepEqual(stats, { total_candles: 5 })
})
test('fetchStats accepts a bare object too', async () => {
  assert.deepEqual(await fetchStats({ fetchImpl: ok({ total_candles: 5 }) }), { total_candles: 5 })
})
test('fetchStats calls the bare endpoint when no key is supplied', async () => {
  let seen
  await fetchStats({ fetchImpl: async (url) => { seen = url; return { ok: true, status: 200, json: async () => ({ data: {} }) } } })
  assert.equal(seen, 'https://api.dexploit.dev/api/v1/stats')
})
test('fetchStats appends the key when one is supplied', async () => {
  let seen
  await fetchStats({ apiKey: 'secret-key', fetchImpl: async (url) => { seen = url; return { ok: true, status: 200, json: async () => ({ data: {} }) } } })
  assert.equal(seen, 'https://api.dexploit.dev/api/v1/stats?api_key=secret-key')
})
test('fetchStats never puts the key in an error message', async () => {
  await assert.rejects(() => fetchStats({ apiKey: 'secret-key', fetchImpl: fail(401) }),
    (err) => !err.message.includes('secret-key') && /401/.test(err.message))
})
test('fetchStats honours a url override', async () => {
  let seen
  await fetchStats({ url: 'https://staging.example/stats', fetchImpl: async (url) => { seen = url; return { ok: true, status: 200, json: async () => ({ data: {} }) } } })
  assert.equal(seen, 'https://staging.example/stats')
})
test('fetchStats propagates a network failure rather than swallowing it', async () => {
  await assert.rejects(() => fetchStats({ fetchImpl: async () => { throw new Error('ENOTFOUND') } }), /ENOTFOUND/)
})
test('fetchStats rejects a non-object payload', async () => {
  await assert.rejects(() => fetchStats({ fetchImpl: ok({ data: 'nope' }) }), /unexpected response shape/)
})
test('fetchActivity returns the event array', async () => {
  assert.equal((await fetchActivity('1tzkaos', 'tok', ok([{ type: 'PushEvent' }]))).length, 1)
})
test('fetchActivity throws on a non-2xx status', async () => {
  await assert.rejects(() => fetchActivity('1tzkaos', 'tok', fail(403)), /403/)
})
