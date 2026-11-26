import assert from 'node:assert/strict'
import {isDeepStrictEqual} from 'node:util'
import {organizationDocuments, publicOrganizationId, isExternalStoryUrl} from '../organizations.ts'

const organizationFields = ['title', 'light', 'dark', 'displayOrder']
const publicIds = organizationDocuments.map(({_id}) => _id)
export const oldOrganizationIds = publicIds.map((id) =>
  id.replace('organization-', 'organization.'),
)

function organizationCopies(documents) {
  const byId = new Map(documents.map((doc) => [doc._id, doc]))
  const missing = []
  const conflicts = []
  for (const old of oldOrganizationIds) {
    for (const prefix of ['', 'drafts.']) {
      const existing = byId.get(prefix + old)
      if (!existing) {
        if (!prefix && !byId.has(publicOrganizationId(old))) {
          throw new Error('Missing organization ' + old)
        }
        continue
      }
      assert.equal(existing._type, 'organization')
      const _id = prefix + publicOrganizationId(old)
      const fields = Object.fromEntries(
        organizationFields.filter((name) => name in existing).map((name) => [name, existing[name]]),
      )
      assert.ok(
        typeof fields.title === 'string' && fields.title.trim(),
        'Invalid organization title on ' + existing._id,
      )
      assert.ok(
        [fields.light, fields.dark].every(
          (color) => typeof color === 'string' && /^#[a-f0-9]{6}$/i.test(color),
        ),
        'Invalid organization palette on ' + existing._id,
      )
      assert.ok(
        fields.displayOrder == null || Number.isInteger(fields.displayOrder),
        'Invalid display order on ' + existing._id,
      )
      const proposed = {_id, _type: 'organization', ...fields}
      const current = byId.get(_id)
      if (!current) missing.push(proposed)
      else if (
        current._type !== 'organization' ||
        organizationFields.some((name) => !isDeepStrictEqual(current[name], existing[name]))
      )
        conflicts.push(_id)
    }
  }
  return {missing, conflicts}
}

function repointReferences(doc, referencedRoots) {
  const set = {}
  let references = 0
  function visit(value) {
    if (Array.isArray(value)) return value.map(visit)
    if (!value || typeof value !== 'object') return value
    if (value._type === 'reference' && oldOrganizationIds.includes(value._ref)) {
      references++
      const root = publicOrganizationId(value._ref)
      referencedRoots.add(root)
      return {...value, _ref: root}
    }
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, visit(child)]))
  }
  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith('_')) continue
    const before = references
    const next = visit(value)
    if (before !== references) set[key] = next
  }
  return references ? {doc, set, unset: [], references} : undefined
}

function duplicatedQuotation(doc) {
  if (!Array.isArray(doc.migrationIntro) || !doc.migrationIntro.length) return false
  const body = (doc.body || [])
    .flatMap((block) => block.children?.map((span) => span.text) || [])
    .join(' ')
  return doc.migrationIntro.every(
    (block) =>
      block._type === 'quotation' &&
      Object.keys(block).every((k) => ['_type', '_key', 'text', 'attribution'].includes(k)) &&
      block.text &&
      body.includes(block.text) &&
      (!block.attribution || body.includes(block.attribution)),
  )
}

function repairDraftPlace(doc, byId) {
  const guards = new Set()
  const set = {}
  const unset = duplicatedQuotation(doc) ? ['migrationIntro'] : []
  const links = doc.sidebarLinks?.map((link) => {
    const target = byId.get('drafts.' + link.internal?._ref) || byId.get(link.internal?._ref)
    if (!link.href || target?._type !== 'page' || link.href !== '/' + target.slug?.current)
      return link
    guards.add(target._id)
    const next = {...link}
    delete next.href
    return next
  })
  if (!isDeepStrictEqual(links, doc.sidebarLinks)) set.sidebarLinks = links
  return Object.keys(set).length || unset.length
    ? {doc, set, unset, guards: [...guards]}
    : undefined
}

function bodyContainsLink(body, link) {
  if (!link?.label || Boolean(link.internal?._ref) === Boolean(link.href)) return false
  if (
    Object.keys(link).some((key) => !['_type', '_key', 'label', 'href', 'internal'].includes(key))
  )
    return false
  return (body || []).some(
    (block) =>
      block._type === 'block' &&
      block.markDefs?.some((mark) => {
        if (
          mark._type !== 'link' ||
          mark.href !== link.href ||
          mark.internal?._ref !== link.internal?._ref
        )
          return false
        let label = ''
        for (const span of block.children || []) {
          if (span.marks?.includes(mark._key)) label += span.text
          else {
            if (label === link.label) return true
            label = ''
          }
        }
        return label === link.label
      }),
  )
}

function repairInitiativeCards(doc, byId) {
  const guards = new Set()
  const cards = doc.initiativeCards?.map((card) => {
    if (!card.page?._ref) return card
    const detail = byId.get('drafts.' + card.page._ref) || byId.get(card.page._ref)
    if (detail?._type !== 'page' || !detail.slug?.current) return card
    const next = {...card}
    if (detail.title && card.title === detail.title) delete next.title
    if (bodyContainsLink(detail.body, card.link)) delete next.link
    if (Object.keys(next).length !== Object.keys(card).length) guards.add(detail._id)
    return next
  })
  if (!isDeepStrictEqual(cards, doc.initiativeCards))
    return {doc, set: {initiativeCards: cards}, unset: [], guards: [...guards]}
}

function repairFooter(doc) {
  const unset = ['address', 'footerText', 'landAcknowledgment'].filter((key) => {
    const blocks = doc.footer?.[key]
    if (typeof doc[key] !== 'string' || !Array.isArray(blocks) || !blocks.length) return false
    if (
      !blocks.every(
        (block) =>
          block._type === 'block' &&
          Array.isArray(block.children) &&
          block.children.every((span) => span._type === 'span' && typeof span.text === 'string'),
      )
    )
      return false
    return (
      blocks.map((block) => block.children.map((span) => span.text).join('')).join('\n') ===
      doc[key]
    )
  })
  if (unset.length) return {doc, set: {}, unset}
}

export function planSiteRepairs(documents) {
  const byId = new Map(documents.map((doc) => [doc._id, doc]))
  const {missing, conflicts} = organizationCopies(documents)
  const referencedRoots = new Set()
  const repoint = []
  const repairs = []
  const eventUrl = []
  for (const doc of documents) {
    const patch = repointReferences(doc, referencedRoots)
    if (patch) {
      assert.ok(
        !doc._id.startsWith('versions.'),
        'Review active release before moving references: ' + doc._id,
      )
      repoint.push(patch)
    }
    if (doc._id.startsWith('drafts.')) {
      let repair
      if (doc._type === 'place') repair = repairDraftPlace(doc, byId)
      if (doc._type === 'page' && doc.template === 'initiatives')
        repair = repairInitiativeCards(doc, byId)
      if (doc._type === 'siteSettings') repair = repairFooter(doc)
      if (repair) repairs.push(repair)
    }
    if (
      doc._type === 'event' &&
      doc._id === '81e05381-44ea-49c6-82f4-75a880bc408f' &&
      !doc.externalUrl
    ) {
      const draft = byId.get('drafts.' + doc._id)
      if (
        isExternalStoryUrl(draft?.externalUrl) &&
        draft.slug?.current === doc.slug?.current &&
        publicOrganizationId(doc.organizationRef?._ref) ===
          publicOrganizationId(draft.organizationRef?._ref)
      ) {
        eventUrl.push({doc, set: {externalUrl: draft.externalUrl}, unset: [], guards: [draft._id]})
      }
    }
  }
  // Once all readers reference a public ID, editors can change that organization's palette freely.
  const activeConflicts = conflicts.filter((id) => referencedRoots.has(id.replace(/^drafts\./, '')))
  return {missing, conflicts: activeConflicts, repoint, repairs, eventUrl}
}

export function migrationSourceGuards(phase, documents, creates, patches) {
  const ids = new Set(patches.flatMap((patch) => patch.guards || []))
  if (phase === 'prepare') {
    for (const copy of creates)
      ids.add(copy._id.replace(/^(drafts\.)?organization-/, '$1organization.'))
  }
  if (phase === 'repoint' && patches.length) {
    for (const doc of documents) {
      const id = doc._id.replace(/^drafts\./, '')
      if (oldOrganizationIds.includes(id) || publicIds.includes(id)) ids.add(doc._id)
    }
  }
  const byId = new Map(documents.map((doc) => [doc._id, doc]))
  for (const patch of patches) ids.delete(patch.doc._id)
  return [...ids].map((id) => {
    const revision = byId.get(id)?._rev
    assert.ok(revision, 'Missing source revision for ' + id)
    return {id, revision}
  })
}
