import assert from 'node:assert/strict'
import test from 'node:test'
import {createSearchRanker, indexSearchFields} from '../src/lib/search-terms.ts'

function score(query, fields) {
  return createSearchRanker(query)?.(indexSearchFields(fields))
}

test('related word forms match without a topic-specific list', () => {
  assert.ok(score('Making a donation', {title: 'Donate'}))
  assert.ok(score('I want to make a reservation', {title: 'Reserve a Table'}))
  assert.ok(score('taking an art class', {title: 'Arts Classes'}))
  assert.ok(score('picnicking', {text: 'This is a picnic area.'}))
  assert.ok(score('sculptures', {title: 'Modern Sculpture'}))
})

test('title matches outrank body references and tolerate punctuation, accents and word order', () => {
  const place = {title: 'Hollyhock House'}
  const reference = {title: 'Story', text: 'The Hollyhock House was designed in 1919.'}
  const event = {title: 'Sunday Tours at Hollyhock House'}
  for (const query of ['Hollyhock—House!', 'house hollyhock']) {
    assert.ok(score(query, place) > score(query, reference))
    assert.ok(score(query, place) > score(query, event))
  }
  assert.ok(score('Jose Okeeffe', {title: 'José O’Keeffe'}))
})

test('typos can substitute, add, remove, or transpose a letter in longer words', () => {
  const title = {title: 'Municipal Gallery'}
  for (const query of ['gallary', 'galllery', 'gallry', 'gallrey']) {
    assert.ok(score(query, title), query)
  }
  assert.ok(score('gall', title))
  assert.ok(score('theater', {title: 'Gallery Theatre'}))
  assert.equal(score('city', {title: 'Pity'}), undefined)
  assert.equal(score('2027', {title: 'Exhibition 2026'}), undefined)
})

test('an exact word in another field beats a stem match in a title', () => {
  const source = {title: 'Visit', text: 'Visitor parking is available.'}
  assert.ok(score('parking', source) > score('parking', {title: 'Support the Park'}))
})

test('a meaningful majority can match, with complete matches ranked first', () => {
  const query = 'coyotes in the olive grove'
  const partial = score(query, {title: 'Olive Grove Restoration'})
  assert.ok(partial)
  assert.ok(
    score(query, {title: 'Animal life', text: 'Coyotes live in the olive grove.'}) > partial,
  )
  assert.equal(score(query, {title: 'Olive Oil'}), undefined)
  assert.equal(score('theatre unicorn', {title: 'Gallery Theatre'}), undefined)
})

test('empty, English filler and punctuation-only input do not match', () => {
  for (const query of ['', 'a and the', '*** " - !']) {
    assert.equal(createSearchRanker(query), undefined)
  }
})
