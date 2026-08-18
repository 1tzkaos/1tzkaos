import { compactNumber, utcDateStamp, utcMinuteStamp } from './format.mjs'

const VERBS = {
  PushEvent: 'pushed to',
  CreateEvent: 'created',
  PullRequestEvent: 'opened a PR in',
  IssuesEvent: 'opened an issue in',
  ReleaseEvent: 'released',
}

export function renderStats(stats, now) {
  for (const field of ['total_candles', 'protocols', 'pairs']) {
    if (typeof stats?.[field] !== 'number') {
      throw new TypeError(`renderStats: missing numeric field "${field}"`)
    }
  }
  const latest = stats.newest_candle ? `\`${utcMinuteStamp(stats.newest_candle)}\`` : '—'
  return [
    '| Candles stored | Trading pairs | DEX protocols | Latest candle |',
    '|---|---|---|---|',
    `| **${compactNumber(stats.total_candles)}** | **${compactNumber(stats.pairs)}** | **${compactNumber(stats.protocols)}** | ${latest} |`,
    '',
    `<sub>Live from \`api.dexploit.dev\` · updated ${utcDateStamp(now)}</sub>`,
  ].join('\n')
}

export function renderActivity(events, now, limit = 5) {
  if (!Array.isArray(events)) throw new TypeError('renderActivity: expected an array of events')

  const seen = new Set()
  const lines = []
  for (const event of events) {
    const verb = VERBS[event?.type]
    const repo = event?.repo?.name
    if (!verb || !repo) continue
    // Dedupe on the repo alone: GitHub emits several event types per push,
    // and listing one repo three times under three verbs reads as noise.
    if (seen.has(repo)) continue
    seen.add(repo)
    lines.push(`- ${verb} [\`${repo}\`](https://github.com/${repo})`)
    if (lines.length === limit) break
  }

  if (lines.length === 0) {
    return `<sub>No public activity in the current window · updated ${utcDateStamp(now)}</sub>`
  }
  return [...lines, '', `<sub>updated ${utcDateStamp(now)}</sub>`].join('\n')
}
