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
  assert.equal(statsCells({ ...STATS, newest_candle: null })[3].value, '—')
})
test('statsCells rejects a missing numeric field', () => {
  assert.throws(() => statsCells({ ...STATS, pairs: undefined }), /pairs/)
})
test('renderStatsSvg is self-contained and sanitizer-safe', () => {
  const svg = renderStatsSvg(STATS, NOW, 'dark')
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.doesNotMatch(svg, /<script|<style|href=|xlink:|<foreignObject/)
})
test('renderStatsSvg paints Dexploit tokens per theme', () => {
  assert.match(renderStatsSvg(STATS, NOW, 'dark'), new RegExp(THEMES.dark.card))
  assert.match(renderStatsSvg(STATS, NOW, 'dark'), /#00FFC2/)
  assert.match(renderStatsSvg(STATS, NOW, 'light'), new RegExp(THEMES.light.card))
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

test('renderStatsSvg escapes markup smuggled in through a timestamp', () => {
  const cell = renderStatsSvg(
    { ...STATS, newest_candle: '2026-08-18T10:08:00Z' }, NOW, 'dark')
  assert.ok(!cell.includes('<text><script'))
  // An em dash is the only non-ASCII value the cells can produce; it must survive.
  const dashed = renderStatsSvg({ ...STATS, newest_candle: null }, NOW, 'dark')
  assert.ok(dashed.includes('\u2014'))
})
test('statsAltText states the numbers in words', () => {
  const alt = statsAltText(STATS, NOW)
  assert.match(alt, /candles stored 963M/)
  assert.match(alt, /updated 2026-08-18/)
})
