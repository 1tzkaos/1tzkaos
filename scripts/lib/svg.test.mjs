import test from 'node:test'
import assert from 'node:assert/strict'
import { renderStatsSvg, statsCells, statsAltText, THEMES } from './svg.mjs'

const NOW = new Date('2026-08-24T02:30:00Z')
const STATS = {
  total_candles: 1_022_490_694,
  protocols: 10,
  pairs: 4_190_960,
  mints: 3_860_730,
  newest_candle: '2026-08-24T02:29:36Z',
}

test('statsCells abbreviates each figure', () => {
  assert.deepEqual(statsCells(STATS).map((c) => c.value), ['1B', '4.2M', '3.9M', '10'])
})

test('statsCells degrades when mints is absent rather than throwing', () => {
  const { mints, ...without } = STATS
  assert.equal(statsCells(without)[2].value, 'n/a')
})

test('statsCells rejects a missing required field', () => {
  assert.throws(() => statsCells({ ...STATS, pairs: undefined }), /pairs/)
})

test('renderStatsSvg is self-contained and sanitizer-safe', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.doesNotMatch(svg, /<script|<style|href=|xlink:|<foreignObject/)
})

test('renderStatsSvg paints each theme from its own token set', () => {
  const dark = renderStatsSvg(STATS, NOW, 'dark')
  const light = renderStatsSvg(STATS, NOW, 'light')
  assert.match(dark, new RegExp(THEMES.dark.bg))
  assert.match(light, new RegExp(THEMES.light.bg))
  assert.doesNotMatch(dark, new RegExp(THEMES.light.rule))
})

test('the palette stays monochrome: no saturated hue survives', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark') + renderStatsSvg(STATS, NOW, 'light')
  for (const hex of svg.match(/#[0-9A-Fa-f]{6}/g) || []) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    // #A1A1AA, the supplied secondary-text token, is deliberately a touch cool
    // (spread 9). Anything past ~12 would be an actual hue rather than a grey.
    assert.ok(Math.max(r, g, b) - Math.min(r, g, b) <= 12, `${hex} is not neutral`)
  }
})

test('renderStatsSvg has no card, border or accent shape', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  assert.doesNotMatch(svg, /rx=/, 'rounded card container is gone')
  assert.doesNotMatch(svg, /stroke=/, 'bordered box is gone')
  // Only the background plus the three divider hairlines.
  assert.equal((svg.match(/<rect /g) || []).length, 4)
})

test('renderStatsSvg carries the figures and its own date stamp', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  for (const v of ['1B', '4.2M', '3.9M']) assert.ok(svg.includes(v), `missing ${v}`)
  assert.match(svg, /Last synced 2026-08-24/)
})

test('renderStatsSvg rejects an unknown theme', () => {
  assert.throws(() => renderStatsSvg(STATS, NOW, 'solarized'), /unknown theme/)
})

test('renderStatsSvg keeps the aria-label attribute well formed', () => {
  const label = renderStatsSvg(STATS, NOW, 'dark').match(/aria-label="([^"]*)"/)
  assert.ok(label, 'aria-label attribute missing')
  assert.doesNotMatch(label[1], /[<>&](?!(amp|lt|gt|quot|apos);)/)
  assert.match(label[1], /^Dexploit live stats:/)
})

test('renderStatsSvg never emits an em dash', () => {
  assert.ok(!renderStatsSvg(STATS, NOW, 'dark').includes('—'))
  const { mints, ...without } = STATS
  assert.ok(!renderStatsSvg(without, NOW, 'light').includes('—'))
})

test('statsAltText states the numbers in words', () => {
  const alt = statsAltText(STATS, NOW)
  assert.match(alt, /candles stored 1B/)
  assert.match(alt, /Updated 2026-08-24/)
})
