// From studio: sanity exec scripts/simplify-news.cjs --with-user-token
// Set BARNSDALL_APPLY_NEWS=1 after the web release to apply the migration with a backup.
const assert = require('node:assert/strict')
const console = require('node:console')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const process = require('node:process')
const {isDeepStrictEqual} = require('node:util')
const {getCliClient} = require('sanity/cli')

const client = getCliClient({apiVersion: '2026-10-23', perspective: 'raw', useCdn: false})
const articleQuery = '*[_type == "article"]'
const baseId = (id) => id.replace(/^drafts\./, '')

function withoutImageAlt(value) {
  if (Array.isArray(value)) return value.map(withoutImageAlt)
  if (!value || typeof value !== 'object') return value
  const result = Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, withoutImageAlt(child)]),
  )
  if (result._type === 'parkImage' || result._type === 'editorialImage') {
    assert.ok(!result.asset || !result.alt || result.caption, 'News image needs a caption')
    delete result.alt
    delete result.decorative
  }
  return result
}

function hasReference(value, ids) {
  return value && typeof value === 'object' &&
    (ids.has(value._ref) || Object.values(value).some((child) => hasReference(child, ids)))
}

async function run() {
  const articles = await client.fetch(articleQuery)
  const retired = articles.filter((doc) => doc.slug?.current === 'olive-grove')
  assert.ok(
    articles.every((doc) => (!doc.excludeFromNews && !doc.targetPage) || retired.includes(doc)),
    'A promotional record needs a destination audit before it can be retired',
  )
  const ids = new Set(retired.map((doc) => baseId(doc._id)))
  if (ids.size) {
    const references = await client.fetch('*[references($ids)]', {ids: [...ids]})
    for (const {relatedStories: _relatedStories, ...doc} of references) {
      assert.equal(doc._type, 'article', 'Check a non-News reference to the retired card')
      assert.ok(!hasReference(doc, ids), 'Check a reference outside See also in ' + doc._id)
    }
  }

  const changed = []
  for (const doc of articles.filter((article) => !ids.has(baseId(article._id)))) {
    const date = doc.date ?? doc.publishedAt
    assert.ok(typeof date === 'string' && Number.isFinite(Date.parse(date)), 'Missing Date for ' + doc._id)
    const fields = {}
    if (date !== doc.date) fields.date = date
    for (const field of ['image', 'gallery', 'body']) {
      const cleaned = withoutImageAlt(doc[field])
      if (!isDeepStrictEqual(cleaned, doc[field])) fields[field] = cleaned
    }
    const related = doc.relatedStories?.filter((story) => !ids.has(story._ref))
    if (related && related.length !== doc.relatedStories.length) fields.relatedStories = related
    const obsolete = ['publishedAt', 'excludeFromNews', 'targetPage', 'sourceLink'].filter(
      (field) => Object.hasOwn(doc, field),
    )
    if (Object.keys(fields).length || obsolete.length) changed.push({doc, fields, obsolete})
  }

  console.log(changed.length, 'News versions to update;', retired.length, 'old promo versions to retire.')
  if (process.env.BARNSDALL_APPLY_NEWS !== '1' || !(changed.length || retired.length)) return

  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'barnsdall-news-backup-'))
  await fs.writeFile(path.join(directory, 'before.json'), JSON.stringify(articles, null, 2), {
    flag: 'wx',
    mode: 0o600,
  })
  const tx = client.transaction()
  for (const {doc, fields, obsolete} of changed) {
    tx.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set(fields).unset(obsolete))
  }
  for (const doc of retired) {
    tx.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).unset(['excludeFromNews', 'targetPage']))
    tx.delete(doc._id)
  }
  await tx.commit({visibility: 'sync'})

  const updated = await client.fetch(articleQuery)
  assert.equal(updated.length, articles.length - retired.length)
  for (const doc of updated) {
    assert.ok(!ids.has(baseId(doc._id)) && !hasReference(doc, ids))
    assert.ok(doc.date && !Object.hasOwn(doc, 'publishedAt'))
    for (const field of ['image', 'gallery', 'body'])
      assert.deepEqual(doc[field], withoutImageAlt(doc[field]))
  }
  console.log('Verified the News migration. Backup:', directory)
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
