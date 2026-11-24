// Run with "sanity exec scripts/apply-editorial-audit.cjs --with-user-token" from studio.
// Set BARNSDALL_AUDIT_SNAPSHOT to a private, new JSON file, then use
// BARNSDALL_AUDIT_PHASE=stage or finish. With no phase this only prepares the backup and plan.
const fs = require('node:fs')
const process = require('node:process')
const console = require('node:console')
const assert = require('node:assert/strict')
const {isDeepStrictEqual: equal} = require('node:util')
const {getCliClient} = require('sanity/cli')
const {editorialDocuments} = require('../../shared/migrations/editorial-audit.mjs')
const client = getCliClient({apiVersion: '2026-10-23', perspective: 'raw', useCdn: false})
const fetchDocs = () =>
  client.fetch(
    '*[_type in ["page","place","siteSettings","organization","event","article","homePage"]]',
  )
function stageValue(old, next) {
  if (Array.isArray(next))
    return next.map((item) =>
      stageValue(
        old?.find((value) => value._key && value._key === item._key),
        item,
      ),
    )
  if (!next || typeof next !== 'object') return next
  const both = {...old}
  for (const [key, value] of Object.entries(next)) both[key] = stageValue(old?.[key], value)
  return both
}
async function run() {
  const file = process.env.BARNSDALL_AUDIT_SNAPSHOT
  assert.ok(file, 'Set BARNSDALL_AUDIT_SNAPSHOT to a private backup path.')
  const phase = process.env.BARNSDALL_AUDIT_PHASE || 'plan'
  assert.ok(['plan', 'stage', 'finish'].includes(phase))
  const live = await fetchDocs()
  if (!fs.existsSync(file)) {
    assert.equal(phase, 'plan', 'Prepare a backup and plan first.')
    fs.writeFileSync(file, JSON.stringify(live), {flag: 'wx', mode: 0o600})
  }
  const before = JSON.parse(fs.readFileSync(file, 'utf8'))
  const after = editorialDocuments(before)
  assert.deepEqual(editorialDocuments(after), after, 'Migration must be idempotent')
  const tx = client.transaction()
  const changes = []
  for (const doc of after) {
    const old = before.find((item) => item._id === doc._id)
    const current = live.find((item) => item._id === doc._id)
    assert.ok(current, 'Record removed during migration: ' + doc._id)
    const staged = stageValue(old, doc)
    if (doc.contentSections && !old.contentSections) {
      staged.migrationIntro = doc.body
      staged.body = old.body
    }
    const expected = phase === 'finish' ? staged : old
    const desired = phase === 'finish' ? doc : staged
    const set = {},
      unset = []
    for (const key of new Set([...Object.keys(desired), ...Object.keys(expected)])) {
      if (key.startsWith('_') || equal(current[key], desired[key])) continue
      assert.ok(equal(current[key], expected[key]), 'Concurrent edit to ' + doc._id + '.' + key)
      if (key in desired) set[key] = desired[key]
      else unset.push(key)
    }
    if (!Object.keys(set).length && !unset.length) continue
    changes.push({id: doc._id, fields: [...Object.keys(set), ...unset]})
    tx.patch(doc._id, (patch) => {
      let checked = patch.ifRevisionId(current._rev)
      if (Object.keys(set).length) checked = checked.set(set)
      if (unset.length) checked = checked.unset(unset)
      return checked
    })
  }
  if (phase !== 'plan' && changes.length) await tx.commit({visibility: 'sync'})
  console.log(JSON.stringify({phase, changed: changes.length, changes}))
}
run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
