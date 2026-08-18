import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdtemp, mkdir, readdir } from 'node:fs/promises'

import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { updateReadme } from './update-readme.mjs'

const TEMPLATE = ['# Nick', '<!-- STATS:START -->', '<!-- STATS:END -->',
                  '<!-- ACTIVITY:START -->', '<!-- ACTIVITY:END -->'].join('\n')
const STATS = { total_candles: 10, protocols: 2, pairs: 3, newest_candle: '2026-08-18T04:12:00Z' }
const EVENTS = [{ type: 'PushEvent', repo: { name: 'o/r' } }]
const NOW = new Date('2026-08-18T12:00:00Z')

async function scratch(contents = TEMPLATE) {
  const dir = await mkdtemp(join(tmpdir(), 'profile-'))
  const assetsDir = join(dir, 'assets')
  await mkdir(assetsDir)
  const readmePath = join(dir, 'README.md')
  await writeFile(readmePath, contents)
  return { readmePath, assetsDir }
}

test('updateReadme fills both regions and reports a change', async () => {
  const { readmePath: path, assetsDir } = await scratch()
  assert.equal(await updateReadme({ readmePath: path, assetsDir, stats: STATS, events: EVENTS, now: NOW }), true)
  const out = await readFile(path, 'utf8')
  assert.match(out, /assets\/stats-dark\.svg/)
  assert.match(out, /alt="Dexploit live stats:/)
  assert.match(out, /pushed to/)
})
test('updateReadme is idempotent: a second identical run reports no change', async () => {
  const { readmePath: path, assetsDir } = await scratch()
  await updateReadme({ readmePath: path, assetsDir, stats: STATS, events: EVENTS, now: NOW })
  const first = await readFile(path, 'utf8')
  assert.equal(await updateReadme({ readmePath: path, assetsDir, stats: STATS, events: EVENTS, now: NOW }), false)
  assert.equal(await readFile(path, 'utf8'), first)
})
test('updateReadme leaves the file untouched when rendering throws', async () => {
  const { readmePath: path, assetsDir } = await scratch()
  const before = await readFile(path, 'utf8')
  await assert.rejects(() => updateReadme({ readmePath: path, assetsDir, stats: {}, events: EVENTS, now: NOW }))
  assert.equal(await readFile(path, 'utf8'), before)
})
test('updateReadme leaves the file untouched when a marker is missing', async () => {
  const { readmePath: path, assetsDir } = await scratch('# Nick\nno markers here')
  const before = await readFile(path, 'utf8')
  await assert.rejects(() => updateReadme({ readmePath: path, assetsDir, stats: STATS, events: EVENTS, now: NOW }), /missing start marker/)
  assert.equal(await readFile(path, 'utf8'), before)
})

test('updateReadme writes both theme cards into assets', async () => {
  const { readmePath, assetsDir } = await scratch()
  await updateReadme({ readmePath, assetsDir, stats: STATS, events: EVENTS, now: NOW })
  const written = (await readdir(assetsDir)).sort()
  assert.deepEqual(written, ['stats-dark.svg', 'stats-light.svg'])
})

test('updateReadme writes no card when rendering throws', async () => {
  const { readmePath, assetsDir } = await scratch()
  await assert.rejects(() => updateReadme({ readmePath, assetsDir, stats: {}, events: EVENTS, now: NOW }))
  assert.deepEqual(await readdir(assetsDir), [])
})

test('the published README carries no em dashes', async () => {
  const published = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  const offenders = published.split('\n')
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => line.includes('—'))
  assert.deepEqual(offenders, [], `em dash on line(s): ${offenders.map(([n]) => n).join(', ')}`)
})
