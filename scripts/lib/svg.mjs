import { compactNumber, utcDateStamp, utcMinuteStamp } from './format.mjs'

const SANS = "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

// Monochrome, matching 1tzkaos.github.io. No card, no border, no accent colour:
// the readout there is bare cells divided by hairlines, which is what this
// mirrors. Tokens are the site's own.
export const THEMES = {
  dark:  { bg: '#050505', ink: '#FFFFFF', dim: '#A1A1AA', faint: '#888888', rule: '#242424' },
  light: { bg: '#FFFFFF', ink: '#050505', dim: '#575757', faint: '#8A8A8A', rule: '#E4E4E4' },
}

// Sentence captions above the figure, as on the site, rather than shouted
// uppercase labels. Pre-split because SVG text does not wrap.
const CAPTIONS = [
  ['Candles held in ClickHouse', 'across every indexed pair'],
  ['Distinct trading pairs', 'currently indexed'],
  ['Token mints seen across', 'all protocols'],
  ['DEX protocols parsed', 'on-chain'],
]

const W = 1200
const H = 210
const PAD = 30                       // the site has page padding; this is full-bleed
const COL = (W - PAD * 2) / 4
const CELL_X = [0, 1, 2, 3].map((i) => PAD + i * COL)

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
    { label: 'candles stored', value: compactNumber(stats.total_candles) },
    { label: 'trading pairs', value: compactNumber(stats.pairs) },
    { label: 'token mints', value: Number.isFinite(stats.mints) ? compactNumber(stats.mints) : 'n/a' },
    { label: 'dex protocols', value: compactNumber(stats.protocols) },
  ]
}

export function renderStatsSvg(stats, now, themeName) {
  const t = THEMES[themeName]
  if (!t) throw new TypeError(`renderStatsSvg: unknown theme "${themeName}"`)
  const cells = statsCells(stats)

  const parts = [`<rect width="${W}" height="${H}" fill="${t.bg}"/>`]

  cells.forEach((cell, i) => {
    const x = CELL_X[i]
    if (i > 0) parts.push(`<rect x="${(x - 22).toFixed(1)}" y="6" width="1" height="132" fill="${t.rule}"/>`)
    const [l1, l2] = CAPTIONS[i]
    parts.push(
      `<text x="${x}" y="30" font-family="${SANS}" font-size="15" fill="${t.dim}">${escapeXml(l1)}</text>`,
      `<text x="${x}" y="52" font-family="${SANS}" font-size="15" fill="${t.dim}">${escapeXml(l2)}</text>`,
      `<text x="${x - 3}" y="126" font-family="${SANS}" font-size="46" font-weight="600" letter-spacing="-1.4" fill="${t.ink}">${escapeXml(cell.value)}</text>`,
    )
  })

  const latest = stats.newest_candle ? `Latest candle ${utcMinuteStamp(stats.newest_candle)}. ` : ''
  parts.push(
    `<text x="${PAD}" y="180" font-family="${SANS}" font-size="14" font-style="italic" fill="${t.faint}">` +
    `${escapeXml(latest)}Snapshot from api.dexploit.dev, cached server-side. Last synced ${utcDateStamp(now)}.</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(statsAltText(stats, now))}">
${parts.join('\n')}
</svg>
`
}

export function statsAltText(stats, now) {
  const summary = statsCells(stats).map((c) => `${c.label} ${c.value}`).join(', ')
  return `Dexploit live stats: ${summary}. Updated ${utcDateStamp(now)}`
}
