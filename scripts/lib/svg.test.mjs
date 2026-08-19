import test from 'node:test'
import assert from 'node:assert/strict'
import { renderStatsSvg, statsCells, statsAltText, THEMES } from './svg.mjs'

const NOW = new Date('2026-08-18T12:00:00Z')
const STATS = { total_candles: 963_373_016, protocols: 10, pairs: 3_999_937, newest_candle: '2026-08-18T10:08:00Z' }

test('statsCells abbreviates each figure', () => {
  const cells = statsCells(STATS)
  assert.deepEqual(cells.map((c) => c.value), ['963M', '4M', '10', '10:08 UTC'])
})
test('statsCells falls back when newest_candle is absent', () => {
  assert.equal(statsCells({ ...STATS, newest_candle: null })[3].value, 'n/a')
})
test('statsCells rejects a missing numeric field', () => {
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
  assert.match(dark, new RegExp(THEMES.dark.card))
  assert.match(dark, new RegExp(THEMES.dark.ink))
  assert.match(light, new RegExp(THEMES.light.card))
  assert.doesNotMatch(dark, new RegExp(THEMES.light.card))
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
test('renderStatsSvg carries the figures and its own date stamp', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  for (const v of ['963M', '4M', '10:08 UTC']) assert.ok(svg.includes(v), `missing ${v}`)
  assert.match(svg, /updated 2026-08-18/)
})
test('renderStatsSvg rejects an unknown theme', () => {
  assert.throws(() => renderStatsSvg(STATS, NOW, 'solarized'), /unknown theme/)
})
test('renderStatsSvg keeps the aria-label attribute well formed', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  const label = svg.match(/aria-label="([^"]*)"/)
  assert.ok(label, 'aria-label attribute missing')
  assert.doesNotMatch(label[1], /[<>&](?!(amp|lt|gt|quot|apos);)/)
  assert.match(label[1], /^Dexploit live stats:/)
})

test('renderStatsSvg never emits an em dash', () => {
  assert.ok(!renderStatsSvg(STATS, NOW, 'dark').includes('\u2014'))
  assert.ok(!renderStatsSvg({ ...STATS, newest_candle: null }, NOW, 'light').includes('\u2014'))
})
test('statsAltText states the numbers in words', () => {
  const alt = statsAltText(STATS, NOW)
  assert.match(alt, /candles stored 963M/)
  assert.match(alt, /Updated 2026-08-18/)
})
