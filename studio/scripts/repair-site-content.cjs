// Run from Studio with sanity exec scripts/repair-site-content.cjs --with-user-token.
// The default prints a read-only plan. Applying one phase requires a new private backup path.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const console = require('node:console')
const {getCliClient} = require('sanity/cli')
const {createClient} = require('@sanity/client')
const {
  oldOrganizationIds,
  migrationSourceGuards,
  planSiteRepairs,
} = require('../../shared/migrations/public-organizations.mjs')

async function run() {
  const client = getCliClient({apiVersion: '2026-10-23', perspective: 'raw', useCdn: false})
  const docs = await client.fetch(
    '*[_type in ["organization","place","page","event","siteSettings"] || references($legacyIds)]',
    {legacyIds: oldOrganizationIds},
  )
  const phase = process.env.BARNSDALL_REPAIR_PHASE || 'plan'
  const plan = planSiteRepairs(docs)
  console.log(
    JSON.stringify(
      {
        phase,
        rootCopies: plan.missing.map(({_id}) => _id),
        organizationConflicts: plan.conflicts,
        repointDocuments: plan.repoint.length,
        references: plan.repoint.reduce((sum, item) => sum + item.references, 0),
        draftRepairs: plan.repairs.map(({doc, set, unset}) => ({
          id: doc._id,
          set: Object.keys(set),
          unset,
        })),
        publishedUrlProposal: plan.eventUrl.map(({doc, set}) => ({
          id: doc._id,
          url: set.externalUrl,
        })),
      },
      null,
      2,
    ),
  )
  if (phase === 'plan') return
  assert.ok(['prepare', 'repoint', 'repair', 'event-url'].includes(phase), 'Unknown repair phase')
  let creates = []
  let patches = []
  if (phase === 'prepare') {
    assert.equal(
      plan.conflicts.length,
      0,
      'Existing root organization differs from its original. Review before proceeding.',
    )
    creates = plan.missing
  } else if (phase === 'repoint') {
    assert.equal(plan.missing.length, 0, 'Prepare the root organization copies first.')
    patches = plan.repoint
    if (patches.length) {
      assert.equal(
        plan.conflicts.length,
        0,
        'Resolve conflicting organization edits before moving references.',
      )
      const {projectId, dataset, apiVersion} = client.config()
      const anon = createClient({
        projectId,
        dataset,
        apiVersion,
        perspective: 'published',
        useCdn: false,
      })
      const ids = oldOrganizationIds.map((id) => id.replace('organization.', 'organization-'))
      const readable = await anon.fetch('*[_type == "organization" && _id in $ids]._id', {ids})
      assert.deepEqual(
        readable.sort(),
        ids.sort(),
        'Verify all six root IDs through the anonymous published perspective.',
      )
    }
  } else if (phase === 'repair') {
    patches = plan.repairs
  } else {
    patches = plan.eventUrl
    if (patches.length)
      assert.equal(
        process.env.BARNSDALL_APPROVED_EVENT_URL,
        patches[0].set.externalUrl,
        'Supply the approved public event URL to apply this field in isolation.',
      )
  }
  if (!creates.length && !patches.length) return

  const guards = migrationSourceGuards(phase, docs, creates, patches)
  const file = process.env.BARNSDALL_REPAIR_BACKUP
  assert.ok(
    file && path.isAbsolute(file),
    'Provide a new absolute backup path outside the repository.',
  )
  const repo = path.dirname(require.resolve('../../package.json'))
  const directory = path.dirname(file)
  assert.ok(
    !fs.realpathSync(directory).startsWith(repo + path.sep) && fs.realpathSync(directory) !== repo,
    'Keep dataset backups outside the repository.',
  )
  fs.writeFileSync(
    file,
    JSON.stringify({
      phase,
      creates,
      guards,
      before: patches.map(({doc}) => doc),
      patches: patches.map(({doc, set, unset}) => ({id: doc._id, revision: doc._rev, set, unset})),
    }),
    {flag: 'wx', mode: 0o600},
  )
  const transaction = client.transaction()
  // A revision-only patch makes an editor's concurrent change to a source abort the whole transaction.
  for (const {id, revision} of guards)
    transaction.patch(id, (patch) => patch.ifRevisionId(revision))
  for (const copy of creates) transaction.create(copy)
  for (const {doc, set, unset} of patches) {
    transaction.patch(doc._id, (patch) => {
      let checked = patch.ifRevisionId(doc._rev)
      if (Object.keys(set).length) checked = checked.set(set)
      if (unset.length) checked = checked.unset(unset)
      return checked
    })
  }
  await transaction.commit({visibility: 'sync'})
  console.log('Applied', phase, 'and saved the pre-change records to', file)
}
run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
