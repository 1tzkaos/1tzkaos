import test from 'node:test'
import assert from 'node:assert/strict'
import { injectBlock } from './inject.mjs'

const DOC = ['# Title', '', '<!-- STATS:START -->', 'old content', '<!-- STATS:END -->', '', 'footer'].join('\n')

test('injectBlock replaces only the fenced region', () => {
  const out = injectBlock(DOC, 'STATS', 'new content')
  assert.match(out, /new content/)
  assert.doesNotMatch(out, /old content/)
  assert.match(out, /^# Title/)
  assert.match(out, /footer$/)
})
test('injectBlock keeps both markers intact', () => {
  const out = injectBlock(DOC, 'STATS', 'new content')
  assert.match(out, /<!-- STATS:START -->/)
  assert.match(out, /<!-- STATS:END -->/)
})
test('injectBlock is idempotent for identical content', () => {
  const once = injectBlock(DOC, 'STATS', 'same')
  assert.equal(once, injectBlock(once, 'STATS', 'same'))
})
test('injectBlock trims padding off the injected content', () => {
  const out = injectBlock(DOC, 'STATS', '\n\n  body  \n\n')
  assert.ok(out.includes('<!-- STATS:START -->\nbody\n<!-- STATS:END -->'))
})
test('injectBlock preserves internal line structure', () => {
  const out = injectBlock(DOC, 'STATS', 'line one\nline two')
  assert.ok(out.includes('<!-- STATS:START -->\nline one\nline two\n<!-- STATS:END -->'))
})
test('injectBlock throws when a marker is missing', () => {
  assert.throws(() => injectBlock(DOC, 'ACTIVITY', 'x'), /missing start marker/)
  assert.throws(() => injectBlock('<!-- X:START -->', 'X', 'y'), /missing end marker/)
})
test('injectBlock throws when markers are reversed', () => {
  assert.throws(() => injectBlock('<!-- X:END -->\n<!-- X:START -->', 'X', 'y'), /end marker precedes/)
})
