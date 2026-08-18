import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchStats, fetchActivity } from './lib/sources.mjs'
import { renderStatsBlock, renderActivity } from './lib/render.mjs'
import { renderStatsSvg } from './lib/svg.mjs'
import { injectBlock } from './lib/inject.mjs'

const DEFAULT_README = fileURLToPath(new URL('../README.md', import.meta.url))
const DEFAULT_ASSETS = fileURLToPath(new URL('../assets', import.meta.url))
const GITHUB_USER = '1tzkaos'

export async function updateReadme({ readmePath, assetsDir, stats, events, now }) {
  const original = await readFile(readmePath, 'utf8')

  // Render everything before writing anything. A failure throws here, so no
  // file is left half-updated and the last good state survives intact.
  let next = injectBlock(original, 'STATS', renderStatsBlock(stats, now))
  next = injectBlock(next, 'ACTIVITY', renderActivity(events, now))
  const cards = {
    'stats-light.svg': renderStatsSvg(stats, now, 'light'),
    'stats-dark.svg': renderStatsSvg(stats, now, 'dark'),
  }

  let changed = false
  for (const [name, body] of Object.entries(cards)) {
    const path = join(assetsDir, name)
    const previous = await readFile(path, 'utf8').catch(() => null)
    if (previous === body) continue
    await writeFile(path, body)
    changed = true
  }
  if (next !== original) {
    await writeFile(readmePath, next)
    changed = true
  }
  return changed
}

async function main() {
  const now = new Date()
  const [stats, events] = await Promise.all([
    fetchStats({ url: process.env.DEXPLOIT_STATS_URL, apiKey: process.env.DEXPLOIT_API_KEY }),
    fetchActivity(GITHUB_USER, process.env.GITHUB_TOKEN),
  ])
  const changed = await updateReadme({
    readmePath: DEFAULT_README, assetsDir: DEFAULT_ASSETS, stats, events, now,
  })
  console.log(changed ? 'profile updated' : 'no changes')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`update failed: ${error.message}`)
    process.exit(1)
  })
}
