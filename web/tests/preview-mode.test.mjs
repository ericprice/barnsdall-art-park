import test from 'node:test'
import assert from 'node:assert/strict'
import {allowsDraftPreview} from '../src/lib/preview-mode.ts'

test('production always reads the published perspective', () => {
  assert.equal(allowsDraftPreview('production', 'production', 'true'), false)
  assert.equal(allowsDraftPreview('production', undefined, 'true'), false)
})
test('protected preview and local development each require explicit opt-in for drafts', () => {
  assert.equal(allowsDraftPreview('production', 'preview', 'true'), true)
  assert.equal(allowsDraftPreview('development', undefined, 'true'), true)
  assert.equal(allowsDraftPreview('production', 'preview'), false)
  assert.equal(allowsDraftPreview('development'), false)
})
