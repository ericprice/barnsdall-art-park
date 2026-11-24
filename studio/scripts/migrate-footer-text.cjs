// Run from studio with: sanity exec scripts/migrate-footer-text.cjs --with-user-token
const console = require('node:console')
const process = require('node:process')
const {getCliClient} = require('sanity/cli')
const {footerFromPlainText} = require('../../shared/footer-text.ts')

async function migrate() {
  const client = getCliClient({apiVersion: '2026-10-23', perspective: 'raw', useCdn: false})
  const draft = await client.getDocument('drafts.siteSettings')
  if (!draft || draft.footer) return
  await client
    .patch(draft._id)
    .ifRevisionId(draft._rev)
    .setIfMissing({footer: footerFromPlainText(draft)})
    .commit()
  console.log('Copied the existing footer text into the Site settings draft.')
}

migrate().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
