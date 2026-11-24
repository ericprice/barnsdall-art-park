// Run with "sanity exec scripts/simplify-editorial-content.cjs --with-user-token" from studio.
// Add BARNSDALL_EDITORIAL_BACKUP with a new private file path to apply the migration.
const assert = require('node:assert/strict')
const console = require('node:console')
const fs = require('node:fs')
const process = require('node:process')
const {isDeepStrictEqual} = require('node:util')
const {getCliClient} = require('sanity/cli')

const client = getCliClient({apiVersion: '2026-10-23', perspective: 'raw', useCdn: false})

const titleCorrections = new Map([
  ['The park', 'The Park'],
  ['Support the park', 'Support the Park'],
  ['100 years of Barnsdall Art Park', '100 Years of Barnsdall Art Park'],
  [
    'Hollyhock House becomes UNESCO World Heritage Site',
    'Hollyhock House Becomes UNESCO World Heritage Site',
  ],
  ['Investing in the park’s future', 'Investing in the Park’s Future'],
  ['Restore the olive grove', 'Restore the Olive Grove'],
  ['Make your mark\non the park', 'Make Your Mark\non the Park'],
  ['Restore the\nolive grove', 'Restore the\nOlive Grove'],
  ['Barnsdall\nturns 100', 'Barnsdall\nTurns 100'],
  ['Getting here', 'Getting Here'],
  ['Contact us', 'Contact Us'],
  ['What’s on', 'What’s On'],
])

function correctTitle(item, field = 'title') {
  const title = titleCorrections.get(item[field])
  return title ? {...item, [field]: title} : item
}

function textBlock(key, text, {style = 'normal', marks = [], markDefs = []} = {}) {
  return {
    _type: 'block',
    _key: key,
    style,
    children: [{_type: 'span', _key: 'text', text, marks}],
    markDefs,
  }
}

function moveQuote(block) {
  if (block._type !== 'quotation' || !block.text) return [block]
  const result = [textBlock(block._key, '“' + block.text + '”', {style: 'lead', marks: ['em']})]
  if (block.attribution) {
    const text = block.attribution.trimStart().replace(/^—\s*/, '')
    result.push(textBlock(block._key + '-attribution', '—' + text))
  }
  return result
}

function flatten(doc) {
  const body = (doc.body || []).flatMap(moveQuote)
  for (const section of doc.contentSections || []) {
    assert.ok(
      (!section.role || section.role === 'prose') && !section.entries?.length,
      'The Park contains a structured section that needs individual review: ' + section._key,
    )
    const headingKey = section.anchor ? 'heading-' + section.anchor : 'heading-' + section._key
    // Keep the latest Body edits when an editor has already moved a section there.
    if (body.some((block) => block._key === headingKey && block.style === 'h2')) continue
    body.push(
      textBlock(headingKey, section.title, {style: 'h2'}),
      ...(section.body || []).flatMap(moveQuote),
    )
    for (const {_key, label, ...destination} of section.links || []) {
      body.push(
        textBlock('link-' + section._key + '-' + _key, label, {
          style: 'dotLink',
          marks: ['destination'],
          markDefs: [{...destination, _key: 'destination'}],
        }),
      )
    }
    if (section.image) body.push({...section.image, _key: 'image-' + section._key})
  }
  assert.equal(
    new Set(body.map((block) => block._key)).size,
    body.length,
    'Duplicate Body block keys: ' + body.map((block) => block._key).join(', '),
  )
  return body
}

function changes(doc) {
  const set = {},
    unset = []
  if (titleCorrections.has(doc.title)) set.title = titleCorrections.get(doc.title)
  if (doc._type === 'homePage') {
    const heroSlides = doc.heroSlides?.map((item) => correctTitle(item))
    const celebration = doc.celebration && correctTitle(doc.celebration)
    if (!isDeepStrictEqual(heroSlides, doc.heroSlides ?? undefined)) set.heroSlides = heroSlides
    if (celebration !== doc.celebration) set.celebration = celebration
  }
  if (doc._type === 'siteSettings') {
    const navigation = doc.navigation?.map((item) => {
      const parent = correctTitle(item)
      return parent.children
        ? {...parent, children: parent.children.map((link) => correctTitle(link, 'label'))}
        : parent
    })
    const footerLinks = doc.footerLinks?.map((link) => correctTitle(link, 'label'))
    if (!isDeepStrictEqual(navigation, doc.navigation ?? undefined)) set.navigation = navigation
    if (!isDeepStrictEqual(footerLinks, doc.footerLinks ?? undefined)) set.footerLinks = footerLinks
  }
  if (doc._type === 'place' && doc.summary !== null) {
    if (!doc.subtitle?.trim() && doc.summary.trim()) set.subtitle = doc.summary
    unset.push('summary')
  }
  if (
    doc.slug === 'the-park' &&
    doc._id.startsWith('drafts.') &&
    (doc.contentSections?.length || doc.body?.some((block) => block._type === 'quotation'))
  ) {
    set.body = flatten(doc)
    unset.push('contentSections')
  }
  return {doc, set, unset}
}

async function run() {
  const docs = await client.fetch(
    `*[_type in ["place", "page", "event", "article", "homePage", "siteSettings"]]{
      _id, _rev, _type, title, "slug": slug.current,
      _type == "place" => {subtitle, summary, body, contentSections},
      _type == "homePage" => {heroSlides, celebration},
      _type == "siteSettings" => {navigation, footerLinks}
    }`,
  )
  const updates = docs
    .map(changes)
    .filter(({set, unset}) => Object.keys(set).length || unset.length)
  const backup = process.env.BARNSDALL_EDITORIAL_BACKUP
  if (backup && updates.length) {
    fs.writeFileSync(backup, JSON.stringify(docs, null, 2), {flag: 'wx', mode: 0o600})
    const transaction = client.transaction()
    for (const {doc, set, unset} of updates) {
      transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(set).unset(unset))
    }
    await transaction.commit({visibility: 'sync'})
  }
  console.log(
    JSON.stringify({
      applied: Boolean(backup),
      updates: updates.map(({doc, set, unset}) => ({
        id: doc._id,
        fields: [...Object.keys(set), ...unset],
      })),
    }),
  )
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
