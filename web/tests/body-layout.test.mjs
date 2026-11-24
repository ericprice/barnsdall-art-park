import assert from 'node:assert/strict'
import test from 'node:test'
import {createHistoryPage} from '../../shared/history-timeline.ts'
import {migrateSectionsToBody} from '../../shared/migrate-sections.ts'
import {bodyForLayout} from '../../shared/migrations/legacy-layout.ts'
import {standaloneLink} from '../src/lib/body-layout.ts'

const paragraph = (_key, text, style = 'normal') => ({
  _type: 'block',
  _key,
  style,
  markDefs: [],
  children: [{_type: 'span', _key: 'text', text, marks: []}],
})
const linkedParagraph = (_key, text, href) => ({
  ...paragraph(_key, text),
  markDefs: [{_key: 'link', _type: 'link', href}],
  children: [{_type: 'span', _key: 'text', text, marks: ['link']}],
})

test('a Visit map file and its public anchor survive migration and a subsequent heading rename', () => {
  const asset = 'file-4821178d166e1478946553b304524a749221c966-pdf'
  const document = {
    body: [paragraph('intro', 'Welcome')],
    sections: [
      {
        _key: 'map',
        anchor: 'map',
        title: 'Map',
        links: [
          {
            _key: 'pdf',
            label: 'Download PDF',
            attachment: {asset: {_type: 'reference', _ref: asset}},
          },
        ],
      },
      {
        _key: 'arrival',
        anchor: 'getting-here',
        title: 'Park entrance',
        body: [paragraph('intro', 'Transit')],
      },
    ],
  }
  const migrated = migrateSectionsToBody(document)
  assert.equal(document.sections.length, 2)
  assert.ok(!('sections' in migrated))
  assert.deepEqual(migrateSectionsToBody(migrated), migrated)
  assert.equal(new Set(migrated.body.map(({_key}) => _key)).size, migrated.body.length)
  migrated.body[1].children[0].text = 'Park map'
  const {body, sections} = bodyForLayout(migrated.body, '/visit')
  assert.deepEqual(body, document.body)
  assert.deepEqual(
    sections.map(({anchor}) => anchor),
    ['map', 'getting-here'],
  )
  assert.equal(sections[0].title, 'Park map')
  assert.match(sections[0].links[0].href, /4821178d166e1478946553b304524a749221c966\.pdf$/)
})

test('standard headings form Support columns and the Olive Grove disclosure from newly authored text', () => {
  const body = [
    paragraph('a', 'Our vision', 'h2'),
    paragraph('b', 'Advancement', 'h3'),
    paragraph('c', 'The first column'),
    paragraph('d', 'Engagement', 'h3'),
    linkedParagraph('e', 'Learn more', '/support'),
  ]
  const support = bodyForLayout(body, '/support').sections
  assert.equal(support[0].entries.length, 2)
  assert.deepEqual(support[0].entries[0].body, [body[2]])
  assert.equal(support[0].entries[1].links[0].href, '/support')

  const olive = bodyForLayout(
    [paragraph('first', 'The plan', 'h2'), ...body],
    '/support/olive-grove',
  ).sections
  assert.equal(olive[1].collapsible, true)
  assert.deepEqual(
    olive[1].entries.map(({title}) => title),
    ['Advancement', 'Engagement'],
  )
  assert.deepEqual(bodyForLayout(body, '/whats-on/fridays'), {body, sections: undefined})
})

test('paragraph order, inline links, numbered lists and duplicate heading fragments survive layout', () => {
  const first = paragraph('a', 'Directions', 'h2')
  const inline = linkedParagraph('b', 'Map', '/visit')
  inline.children.unshift({_type: 'span', _key: 'opening', text: 'Download the ', marks: []})
  const standAlone = linkedParagraph('c', 'Read the policies', '/visit/policies')
  const listItem = {
    ...linkedParagraph('d', 'Get directions', '/visit'),
    listItem: 'number',
    level: 1,
  }
  const ending = linkedParagraph('e', 'See more', '/park')
  const body = [first, inline, standAlone, listItem, ending, paragraph('f', 'Directions', 'h2')]
  const {sections} = bodyForLayout(body, '/visit')
  assert.deepEqual(
    sections.map(({anchor}) => anchor),
    ['directions', 'directions-2'],
  )
  assert.deepEqual(sections[0].body, [inline, standAlone, listItem])
  assert.deepEqual(
    sections[0].links.map(({label}) => label),
    ['See more'],
  )
})

test('an explicitly dotted paragraph stays in the prose and resolves only a whole-paragraph link', () => {
  const dotted = {...linkedParagraph('read-more', 'Read more', '/visit'), style: 'dotLink'}
  const {sections} = bodyForLayout([paragraph('heading', 'Transit', 'h2'), dotted], '/visit')
  assert.deepEqual(sections[0].body, [dotted])
  assert.deepEqual(sections[0].links, [])
  assert.deepEqual(standaloneLink(dotted), {href: '/visit', label: 'Read more', download: false})

  const inline = {
    ...dotted,
    children: [...paragraph('intro', 'For details, ').children, ...dotted.children],
  }
  assert.equal(standaloneLink(inline), undefined)
})

test('the initial History template has editable heading blocks and individual dated milestones', () => {
  const history = createHistoryPage(({path}) => path)
  assert.equal(history.sections, undefined)
  assert.deepEqual(
    history.body.map(({style}) => style),
    ['h2', 'normal', 'h2', 'normal'],
  )
  const {sections} = bodyForLayout(history.body, '/history')
  assert.deepEqual(
    sections.map(({anchor}) => anchor),
    ['historic-grove', 'preservation'],
  )
  assert.ok(history.timelineEntries.length > 10)
  assert.ok(
    history.timelineEntries.every(
      (entry) => entry._type === 'timelineEntry' && entry.dateLabel && entry.description,
    ),
  )
  assert.equal(
    new Set(history.timelineEntries.map(({_key}) => _key)).size,
    history.timelineEntries.length,
  )
})
