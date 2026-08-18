import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { fetchStats, fetchActivity } from './lib/sources.mjs'
import { renderStats, renderActivity } from './lib/render.mjs'
import { injectBlock } from './lib/inject.mjs'

const DEFAULT_README = fileURLToPath(new URL('../README.md', import.meta.url))
const GITHUB_USER = '1tzkaos'

export async function updateReadme({ readmePath, stats, events, now }) {
  const original = await readFile(readmePath, 'utf8')

  // Render before writing: any failure throws here, leaving the file alone.
  let next = injectBlock(original, 'STATS', renderStats(stats, now))
  next = injectBlock(next, 'ACTIVITY', renderActivity(events, now))

  if (next === original) return false
  await writeFile(readmePath, next)
  return true
}

async function main() {
  const now = new Date()
  const [stats, events] = await Promise.all([
    fetchStats({ url: process.env.DEXPLOIT_STATS_URL, apiKey: process.env.DEXPLOIT_API_KEY }),
    fetchActivity(GITHUB_USER, process.env.GITHUB_TOKEN),
  ])
  const changed = await updateReadme({ readmePath: DEFAULT_README, stats, events, now })
  console.log(changed ? 'README updated' : 'no changes')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`update failed: ${error.message}`)
    process.exit(1)
  })
}
