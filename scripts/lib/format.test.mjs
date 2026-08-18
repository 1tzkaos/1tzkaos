import test from 'node:test'
import assert from 'node:assert/strict'
import { compactNumber, utcDateStamp, utcMinuteStamp } from './format.mjs'

test('compactNumber leaves values under 1000 alone', () => {
  assert.equal(compactNumber(0), '0')
  assert.equal(compactNumber(999), '999')
})
test('compactNumber abbreviates and drops trailing .0', () => {
  assert.equal(compactNumber(1000), '1K')
  assert.equal(compactNumber(1500), '1.5K')
  assert.equal(compactNumber(1_200_000), '1.2M')
  assert.equal(compactNumber(146_000_000), '146M')
  assert.equal(compactNumber(1_234_567_890), '1.2B')
})
test('compactNumber rejects junk rather than rendering it', () => {
  assert.throws(() => compactNumber('12'), TypeError)
  assert.throws(() => compactNumber(NaN), TypeError)
  assert.throws(() => compactNumber(-1), RangeError)
})
test('utcDateStamp renders YYYY-MM-DD in UTC', () => {
  assert.equal(utcDateStamp(new Date('2026-08-18T23:59:59Z')), '2026-08-18')
})
test('utcMinuteStamp renders a readable UTC timestamp', () => {
  assert.equal(utcMinuteStamp('2026-08-18T04:12:33.000Z'), '2026-08-18 04:12 UTC')
})
test('utcMinuteStamp rejects an unparseable timestamp', () => {
  assert.throws(() => utcMinuteStamp('not-a-date'), TypeError)
})
