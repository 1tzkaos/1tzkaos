import { compactNumber, utcDateStamp, utcMinuteStamp } from './format.mjs'

const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"
const SANS = "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

// Monochrome, matching 1tzkaos.github.io. `mint` is retained as the accent
// slot name; it now carries the ink colour rather than a hue.
export const THEMES = {
  dark:  { bg: '#050505', card: '#0C0C0C', border: '#242424', ink: '#FFFFFF', dim: '#A1A1AA', faint: '#888888', mint: '#FFFFFF' },
  light: { bg: '#FFFFFF', card: '#FAFAFA', border: '#E4E4E4', ink: '#050505', dim: '#575757', faint: '#8A8A8A', mint: '#050505' },
}

const CELL_X = [64, 332, 600, 868]
const DIVIDER_X = [316, 584, 852]

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]
  ))
}

export function statsCells(stats) {
  for (const field of ['total_candles', 'protocols', 'pairs']) {
    if (typeof stats?.[field] !== 'number') {
      throw new TypeError(`statsCells: missing numeric field "${field}"`)
    }
  }
  return [
    { label: 'CANDLES STORED', value: compactNumber(stats.total_candles) },
    { label: 'TRADING PAIRS', value: compactNumber(stats.pairs) },
    { label: 'DEX PROTOCOLS', value: compactNumber(stats.protocols) },
    {
      label: 'LATEST CANDLE',
      value: stats.newest_candle ? utcMinuteStamp(stats.newest_candle).slice(11) : 'n/a',
    },
  ]
}

export function renderStatsSvg(stats, now, themeName) {
  const t = THEMES[themeName]
  if (!t) throw new TypeError(`renderStatsSvg: unknown theme "${themeName}"`)
  const cells = statsCells(stats)

  const parts = [
    `<rect width="1200" height="210" rx="10" fill="${t.card}"/>`,
    `<rect x="0.5" y="0.5" width="1199" height="209" rx="9.5" fill="none" stroke="${t.border}"/>`,
  ]

  cells.forEach((cell, i) => {
    const x = CELL_X[i]
    parts.push(
      `<rect x="${x}" y="56" width="7" height="7" fill="${t.mint}"/>`,
      `<text x="${x + 18}" y="63" font-family="${MONO}" font-size="13" letter-spacing="1.6" fill="${t.dim}">${escapeXml(cell.label)}</text>`,
      `<text x="${x}" y="126" font-family="${SANS}" font-size="42" font-weight="600" letter-spacing="-1" fill="${t.ink}">${escapeXml(cell.value)}</text>`,
    )
  })

  DIVIDER_X.forEach((x) => parts.push(`<rect x="${x}" y="46" width="1" height="96" fill="${t.border}"/>`))

  parts.push(
    `<text x="64" y="176" font-family="${MONO}" font-size="13" fill="${t.faint}">live from api.dexploit.dev &#183; updated ${utcDateStamp(now)}</text>`,
  )

  const alt = statsAltText(stats, now)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 210" width="1200" height="210" role="img" aria-label="${escapeXml(alt)}">
${parts.join('\n')}
</svg>
`
}

export function statsAltText(stats, now) {
  const cells = statsCells(stats)
  const summary = cells.map((c) => `${c.label.toLowerCase()} ${c.value}`).join(', ')
  return `Dexploit live stats: ${summary}. Updated ${utcDateStamp(now)}`
}
