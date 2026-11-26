import assert from 'node:assert/strict'
import test from 'node:test'
import {imageAspectRatio, imageFocus} from '../src/sanity/image.ts'

test('a cover image positions its focal point within the editorial crop', () => {
  const image = {
    asset: {_ref: 'image-0123456789abcdef0123456789abcdef01234567-800x400-jpg'},
    crop: {left: 0.25, right: 0.25, top: 0, bottom: 0},
    hotspot: {x: 0.625, y: 0.25},
  }
  assert.equal(imageAspectRatio(image), 1)
  assert.equal(imageFocus(image), '75% 25%')
  assert.equal(imageFocus({...image, hotspot: {x: 0.95, y: 0.5}}), '100% 50%')
  assert.equal(imageFocus({...image, hotspot: undefined}), undefined)
  assert.equal(imageFocus({...image, crop: {left: 1}}), undefined)
})
