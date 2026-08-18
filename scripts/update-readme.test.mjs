import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { updateReadme } from './update-readme.mjs'

const TEMPLATE = ['# Nick', '<!-- STATS:START -->', '<!-- STATS:END -->',
                  '<!-- ACTIVITY:START -->', '<!-- ACTIVITY:END -->'].join('\n')
const STATS = { total_candles: 10, protocols: 2, pairs: 3, newest_candle: '2026-08-18T04:12:00Z' }
const EVENTS = [{ type: 'PushEvent', repo: { name: 'o/r' } }]
const NOW = new Date('2026-08-18T12:00:00Z')

async function scratchReadme(contents = TEMPLATE) {
  const path = join(await mkdtemp(join(tmpdir(), 'profile-')), 'README.md')
  await writeFile(path, contents)
  return path
}

test('updateReadme fills both regions and reports a change', async () => {
  const path = await scratchReadme()
  assert.equal(await updateReadme({ readmePath: path, stats: STATS, events: EVENTS, now: NOW }), true)
  const out = await readFile(path, 'utf8')
  assert.match(out, /Candles stored/); assert.match(out, /pushed to/)
})
test('updateReadme is idempotent — a second identical run reports no change', async () => {
  const path = await scratchReadme()
  await updateReadme({ readmePath: path, stats: STATS, events: EVENTS, now: NOW })
  const first = await readFile(path, 'utf8')
  assert.equal(await updateReadme({ readmePath: path, stats: STATS, events: EVENTS, now: NOW }), false)
  assert.equal(await readFile(path, 'utf8'), first)
})
test('updateReadme leaves the file untouched when rendering throws', async () => {
  const path = await scratchReadme()
  const before = await readFile(path, 'utf8')
  await assert.rejects(() => updateReadme({ readmePath: path, stats: {}, events: EVENTS, now: NOW }))
  assert.equal(await readFile(path, 'utf8'), before)
})
test('updateReadme leaves the file untouched when a marker is missing', async () => {
  const path = await scratchReadme('# Nick\nno markers here')
  const before = await readFile(path, 'utf8')
  await assert.rejects(() => updateReadme({ readmePath: path, stats: STATS, events: EVENTS, now: NOW }), /missing start marker/)
  assert.equal(await readFile(path, 'utf8'), before)
})
