// Run in studio with: sanity exec scripts/link-initiative-pages.cjs --with-user-token
// Set BARNSDALL_LINK_INITIATIVES=1 to save the planned changes to drafts.
const assert = require('node:assert/strict')
const console = require('node:console')
const {randomUUID} = require('node:crypto')
const process = require('node:process')
const {getCliClient} = require('sanity/cli')

const client = getCliClient({apiVersion: '2026-10-23', perspective: 'drafts', useCdn: false})

function paragraph(text, style = 'normal', annotation) {
  return {
    _key: randomUUID(),
    _type: 'block',
    style,
    markDefs: annotation ? [annotation] : [],
    children: [
      {_key: randomUUID(), _type: 'span', text, marks: annotation ? [annotation._key] : []},
    ],
  }
}

function starterBody(link) {
  const body = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.',
  ].map((text) => paragraph(text))
  if (link?.label && (link.internal || link.href)) {
    const {label, ...destination} = link
    body.push(paragraph(label, 'dotLink', {...destination, _type: 'link', _key: randomUUID()}))
  }
  return body
}

async function migrate() {
  const {pages, orgs, listing} = await client.fetch(`{
    "pages": *[_type == "page"]{_id,title,"path":slug.current},
    "orgs": *[_type == "organization"]{_id,title},
    "listing": *[_type == "page" && slug.current == "support/initiatives"][0]{_id,_rev,initiativeCards}
  }`)
  assert.ok(listing?.initiativeCards?.length, 'Missing Initiatives listing')
  const draft = await client.getDocument('drafts.' + listing._id)
  assert.equal(draft?._rev, listing._rev, 'A current Initiatives draft is required')
  let tx = client.transaction()
  const updates = {}
  for (const card of listing.initiativeCards) {
    if (card.page?._ref) continue
    const slug =
      'support/initiatives/' +
      card.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    const target =
      pages.find((page) => page._id === card.link?.internal?._ref && page.title === card.title) ||
      pages.find((page) => page.path === slug)
    if (target) assert.equal(target.title, card.title, 'Page path is already in use: ' + slug)
    // Allocate draft IDs before the transaction so page creation and references commit together.
    const id = target?._id || randomUUID()
    if (!target) {
      const org = orgs.find(
        (item) => item.title === (card.label === 'Foundation' ? 'The Foundation' : card.label),
      )
      tx = tx.create({
        _id: 'drafts.' + id,
        _type: 'page',
        template: 'initiative',
        title: card.title,
        slug: {_type: 'slug', current: slug},
        ...(org && {organizationRef: {_type: 'reference', _ref: org._id}}),
        ...(card.summary && {summary: card.summary}),
        ...(card.image && {image: card.image}),
        body: starterBody(card.link),
      })
    }
    // Sanity strengthens this reference when the editor publishes the new page.
    updates['initiativeCards[_key==' + JSON.stringify(card._key) + '].page'] = {
      _type: 'reference',
      _ref: id,
      _weak: true,
      _strengthenOnPublish: {type: 'page'},
    }
    console.log(target ? 'Reuse' : 'Create draft', target?.path || slug)
  }
  if (!Object.keys(updates).length)
    return console.log('All initiative tiles already have detail pages.')
  if (process.env.BARNSDALL_LINK_INITIATIVES === '1') {
    await tx.patch(draft._id, (patch) => patch.ifRevisionId(draft._rev).set(updates)).commit()
    console.log('Saved initiative pages and references as drafts.')
  }
}

migrate().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
