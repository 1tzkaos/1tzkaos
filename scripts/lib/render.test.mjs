import test from 'node:test'
import assert from 'node:assert/strict'
import { renderStats, renderActivity } from './render.mjs'

const NOW = new Date('2026-08-18T12:00:00Z')
const STATS = {
  total_candles: 146_000_000, protocols: 7, pairs: 1_200_000,
  timeframes: ['1m', '5m', '1h'],
  oldest_candle: '2025-01-01T00:00:00Z', newest_candle: '2026-08-18T11:58:00Z',
}

test('renderStats renders every headline figure', () => {
  const out = renderStats(STATS, NOW)
  assert.match(out, /146M/)
  assert.match(out, /1\.2M/)
  assert.match(out, /\b7\b/)
  assert.match(out, /2026-08-18 11:58 UTC/)
})
test('renderStats stamps the update date', () => {
  assert.match(renderStats(STATS, NOW), /updated 2026-08-18/)
})
test('renderStats degrades when newest_candle is absent', () => {
  const out = renderStats({ ...STATS, newest_candle: null }, NOW)
  assert.match(out, /146M/)
  assert.doesNotMatch(out, /UTC/)
})
test('renderStats refuses to render a missing numeric field', () => {
  assert.throws(() => renderStats({ ...STATS, total_candles: undefined }, NOW), /total_candles/)
})
test('renderActivity lists each repo once, newest first', () => {
  const events = [
    { type: 'PushEvent', repo: { name: 'DexploitV1/Dexploit-MCP' } },
    { type: 'PushEvent', repo: { name: 'DexploitV1/Dexploit-MCP' } },
    { type: 'PullRequestEvent', repo: { name: '1tzkaos/PoGoBot' } },
  ]
  const out = renderActivity(events, NOW)
  const mentions = out.split('\n').filter((line) => line.includes('Dexploit-MCP'))
  assert.equal(mentions.length, 1)
  assert.match(out, /opened a PR in/)
  assert.ok(out.indexOf('Dexploit-MCP') < out.indexOf('PoGoBot'))
})
test('renderActivity shows a repo once even across different event types', () => {
  const events = [
    { type: 'PushEvent', repo: { name: 'o/same' } },
    { type: 'CreateEvent', repo: { name: 'o/same' } },
    { type: 'PullRequestEvent', repo: { name: 'o/same' } },
    { type: 'PushEvent', repo: { name: 'o/other' } },
  ]
  const listed = renderActivity(events, NOW).split('\n').filter((line) => line.startsWith('- '))
  assert.equal(listed.length, 2)
  assert.match(listed[0], /pushed to .*o\/same/)
})

test('renderActivity ignores unknown event types and malformed entries', () => {
  const events = [{ type: 'WatchEvent', repo: { name: 'a/b' } }, { type: 'PushEvent' }, null]
  assert.match(renderActivity(events, NOW), /No public activity/)
})
test('renderActivity honours the limit', () => {
  const events = Array.from({ length: 10 }, (_, i) => ({ type: 'PushEvent', repo: { name: `o/r${i}` } }))
  const listed = renderActivity(events, NOW).split('\n').filter((line) => line.startsWith('- '))
  assert.equal(listed.length, 5)
})
test('renderActivity rejects a non-array', () => {
  assert.throws(() => renderActivity(null, NOW), TypeError)
})
