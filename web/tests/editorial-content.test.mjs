import assert from 'node:assert/strict'
import test from 'node:test'
import {resolveInternalLinks} from '../src/lib/internal-links.ts'
import {pageSections} from '../src/lib/body-layout.ts'

test('nested links follow a changed slug, preserve fragments and handle an unpublished target', async () => {
  const source = {
    children: [
      {internal: {_ref: 'visit'}},
      {markDefs: [{internal: {_ref: 'visit'}}, {href: '#subscribe'}]},
      {internal: {_ref: 'gone'}},
      {internal: {_ref: 'promotion'}},
    ],
  }
  let requests = 0
  const result = await resolveInternalLinks(source, async (ids) => {
    requests++
    assert.deepEqual(ids, ['visit', 'gone', 'promotion'])
    return [
      {_id: 'visit', _type: 'page', slug: 'visitor-information'},
      {
        _id: 'promotion',
        _type: 'article',
        slug: 'campaign',
        targetPageId: 'unpublished',
        targetSlug: null,
      },
    ]
  })
  assert.equal(requests, 1)
  assert.equal(result.children[0].href, '/visitor-information')
  assert.equal(result.children[1].markDefs[0].href, '/visitor-information')
  assert.equal(result.children[1].markDefs[1].href, '#subscribe')
  assert.equal(result.children[2].href, undefined)
  assert.equal(result.children[3].href, undefined)
  assert.equal(source.children[0].href, undefined)
})
test('section roles and anchors survive reordering and renaming', () => {
  const sections = pageSections([
    {
      _key: 'drawer',
      role: 'past',
      anchor: 'past-initiatives',
      title: 'Earlier projects',
      entries: [{_key: 'one', title: 'First project'}],
    },
    {_key: 'plan', role: 'plan', anchor: 'restoration-plan', title: 'New plan heading'},
  ])
  assert.deepEqual(
    sections.map((s) => [s.role, s.anchor, s.collapsible, s.entries.length]),
    [
      ['past', 'past-initiatives', true, 1],
      ['plan', 'restoration-plan', false, 0],
    ],
  )
})
