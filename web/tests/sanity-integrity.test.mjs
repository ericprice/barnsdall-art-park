import assert from 'node:assert/strict'
import test from 'node:test'
import {
  hostsDetailPage,
  organizationDocuments,
  organizationTheme,
} from '../../shared/organizations.ts'
import {contentRoute, validateContentSlug} from '../../shared/routes.ts'
import {migrateEditorialImages} from '../../shared/migrate-editorial-images.mjs'
import {
  migrationSourceGuards,
  planSiteRepairs,
} from '../../shared/migrations/public-organizations.mjs'

test('page slugs round-trip through their owning route and preserve nested editorial paths', () => {
  for (const path of [
    'news',
    'news/summer',
    'whats-on',
    'park/art',
    'map',
    'timeline',
    'dev/loading',
    'api/search',
    'search',
    'sitemap.xml',
    'robots.txt',
    '../park',
    'visit/./hours',
    'visit//x',
  ]) {
    assert.notEqual(validateContentSlug(path, 'page'), true, path)
  }
  assert.equal(validateContentSlug('support/initiatives/olive-grove', 'page'), true)
  assert.deepEqual(contentRoute('/whats-on/summer/show'), {type: 'event', slug: 'summer/show'})
  assert.equal(validateContentSlug('summer/show', 'event'), true)
})

test('legacy and public organization IDs share destination policy and fallback colors', () => {
  for (const org of organizationDocuments) {
    const old = org._id.replace('organization-', 'organization.')
    assert.equal(hostsDetailPage(old), hostsDetailPage(org._id))
    assert.deepEqual(organizationTheme(null, old), {
      title: org.title,
      light: org.light,
      dark: org.dark,
    })
    assert.deepEqual(organizationTheme(null, org._id), organizationTheme(null, old))
  }
})

test('historical image migration preserves editorial alt text and current feature treatments', () => {
  const source = {
    _type: 'homePage',
    features: [
      {
        image: {
          _type: 'editorialImage',
          asset: {_ref: 'image-a'},
          alt: 'Alt',
          caption: 'Credit',
          presentation: 'closeCutout',
        },
      },
    ],
    heroSlides: [
      {
        image: {
          _type: 'image',
          asset: {_ref: 'image-b'},
          alt: 'Original alt',
          credit: 'Archive',
          treatment: 'cutout',
        },
      },
    ],
  }
  const moved = migrateEditorialImages(source)
  assert.deepEqual(source.features, moved.features)
  assert.equal(moved.heroSlides[0].image._type, 'editorialImage')
  assert.equal(moved.heroSlides[0].image.alt, 'Original alt')
  assert.equal(moved.heroSlides[0].image.presentation, 'roseCutout')
  assert.deepEqual(migrateEditorialImages(moved), moved)
})

test('migration stages preserve draft status, use stored public colors, and are idempotent', () => {
  const originals = organizationDocuments.map((org) => ({
    ...org,
    _id: org._id.replace('organization-', 'organization.'),
  }))
  originals[0].light = '#000000'
  const draftOrg = {...originals[0], _id: 'drafts.organization.park', light: '#222222'}
  const source = {
    _id: 'drafts.homePage',
    _type: 'homePage',
    heroSlides: [
      {
        _key: 'slide',
        organizationRef: {_type: 'reference', _weak: true, _ref: 'organization.park'},
      },
    ],
  }
  const before = [...originals, draftOrg, source]
  const plan = planSiteRepairs(before)
  assert.equal(plan.missing.length, 7)
  assert.equal(plan.missing.find((o) => o._id === 'organization-park').light, '#000000')
  assert.equal(plan.missing.find((o) => o._id === 'drafts.organization-park').light, '#222222')
  assert.equal(plan.repoint.length, 1)
  const change = plan.repoint[0]
  assert.equal(change.doc._id, source._id)
  assert.deepEqual(change.set.heroSlides[0].organizationRef, {
    _type: 'reference',
    _weak: true,
    _ref: 'organization-park',
  })
  assert.equal(source.heroSlides[0].organizationRef._ref, 'organization.park')
  const after = [...originals, draftOrg, ...plan.missing, {...source, ...change.set}]
  const edited = after.map((doc) =>
    doc._id === 'organization-park' ? {...doc, light: '#abcdef'} : doc,
  )
  assert.deepEqual(planSiteRepairs(edited).conflicts, [])
  assert.deepEqual(planSiteRepairs(after), {
    missing: [],
    conflicts: [],
    repoint: [],
    repairs: [],
    eventUrl: [],
  })
  assert.deepEqual(planSiteRepairs([...before, {...plan.missing[0], light: '#ffffff'}]).conflicts, [
    'organization-park',
  ])
})

test('draft cleanup requires the same target and the complete earlier quotation and attribution', () => {
  const visit = {_id: 'drafts.visit', _type: 'page', slug: {current: 'visit'}}
  const old = {
    _id: 'drafts.park',
    _type: 'place',
    migrationIntro: [{_type: 'quotation', text: 'An old oak', attribution: 'Park staff'}],
    body: [{children: [{text: 'An old oak'}, {text: 'Park staff'}]}],
    sidebarLinks: [
      {href: '/visit', internal: {_ref: 'visit'}},
      {href: '/visit#map', internal: {_ref: 'visit'}},
    ],
  }
  const {repairs} = planSiteRepairs([...organizationDocuments, visit, old])
  assert.deepEqual(repairs[0].unset, ['migrationIntro'])
  assert.deepEqual(repairs[0].set.sidebarLinks, [{internal: {_ref: 'visit'}}, old.sidebarLinks[1]])
  assert.deepEqual(
    planSiteRepairs([...organizationDocuments, visit, {...old, body: []}]).repairs[0].unset,
    [],
  )
})

test('initiative cleanup preserves differing titles, links, and unknown link fields', () => {
  const archived = {label: 'Volunteer', href: '/volunteer'}
  const detail = {
    _id: 'drafts.initiative',
    _type: 'page',
    title: 'Grove',
    slug: {current: 'grove'},
    body: [
      {
        _type: 'block',
        children: [
          {text: 'Volun', marks: ['mark']},
          {text: 'teer', marks: ['mark']},
        ],
        markDefs: [{_type: 'link', _key: 'mark', href: '/volunteer'}],
      },
    ],
  }
  const reference = {page: {_ref: 'initiative'}}
  const doc = {
    _id: 'drafts.overview',
    _type: 'page',
    template: 'initiatives',
    initiativeCards: [
      {...reference, title: 'Grove', link: archived},
      {...reference, title: 'Alternate heading', link: {...archived, label: 'Join'}},
      {...reference, link: {...archived, credit: 'different'}},
      {page: {_ref: 'missing'}, title: 'Archived', link: archived},
    ],
  }
  const result = planSiteRepairs([...organizationDocuments, doc, detail])
  const updated = {...doc, ...result.repairs[0].set}
  assert.deepEqual(updated.initiativeCards, [reference, ...doc.initiativeCards.slice(1)])
  assert.deepEqual(planSiteRepairs([...organizationDocuments, updated, detail]).repairs, [])
})

test('footer cleanup removes exact rich-text duplicates and keeps a distinct historical value', () => {
  const block = (text) => ({_type: 'block', children: [{_type: 'span', text}]})
  const doc = {
    _id: 'drafts.siteSettings',
    _type: 'siteSettings',
    address: 'Park',
    footerText: 'One\nTwo',
    landAcknowledgment: 'Land',
    footer: {
      address: [block('Park'), block('New phone number')],
      footerText: [block('One'), block('Two')],
      landAcknowledgment: [block('Land')],
    },
  }
  const result = planSiteRepairs([...organizationDocuments, doc])
  assert.deepEqual(result.repairs[0].unset, ['footerText', 'landAcknowledgment'])
  const updated = {...doc}
  for (const key of result.repairs[0].unset) delete updated[key]
  assert.deepEqual(planSiteRepairs([...organizationDocuments, updated]).repairs, [])
})

test('copy and reference transactions guard the source revisions they depend on', () => {
  const originals = organizationDocuments.map((doc, i) => ({
    ...doc,
    _id: doc._id.replace('organization-', 'organization.'),
    _rev: 'published-' + i,
  }))
  const drawer = {_id: 'drafts.story', _rev: 'draft-story'}
  const publicCopy = {...organizationDocuments[0], _rev: 'canonical-editor-revision'}
  assert.deepEqual(migrationSourceGuards('prepare', originals, [publicCopy], []), [
    {id: 'organization.park', revision: 'published-0'},
  ])
  const repoint = migrationSourceGuards(
    'repoint',
    [...originals, publicCopy, drawer],
    [],
    [{doc: drawer}],
  )
  assert.ok(repoint.some(({revision}) => revision === publicCopy._rev))
  assert.ok(repoint.some(({revision}) => revision === originals[0]._rev))
  assert.deepEqual(
    migrationSourceGuards(
      'repair',
      [publicCopy, drawer],
      [],
      [{doc: drawer, guards: [publicCopy._id, drawer._id]}],
    ),
    [{id: publicCopy._id, revision: publicCopy._rev}],
  )
})
