import assert from 'node:assert/strict'
import {bodyForLayout} from './legacy-layout.ts'
import {contentPath} from '../../web/src/lib/internal-links.ts'
import {hostsDetailPage} from '../organizations.ts'
import {historyPageId} from '../page-layouts.ts'

const existingLayouts = {
  'visit/policies': 'policies',
  'visit/rentals': 'rentals',
  'support/olive-grove': 'restoration',
  'support/initiatives': 'initiatives',
  'support/supporters': 'supporters',
  'support/donate': 'donate',
  contact: 'contact',
  100: 'centennial',
}
const slots = {
  visit: {map: 'map'},
  rentals: {inquiries: 'inquiries'},
  centennial: {centennial: 'campaign'},
  contact: {subscribe: 'signup'},
  restoration: {'restoration-plan': 'plan'},
}
const baseId = (id) => id.replace(/^drafts\./, '')
const reference = (doc) => ({_type: 'reference', _ref: baseId(doc._id), _weak: true})
const linkTo = (target, documents) =>
  documents.find((doc) => doc.slug && contentPath(doc._type, doc.slug.current) === target)
function without(value, ...keys) {
  const copy = {...value}
  for (const key of keys) delete copy[key]
  return copy
}

function convertValue(value, docs) {
  if (Array.isArray(value)) return value.map((item) => convertValue(item, docs))
  if (!value || typeof value !== 'object') return value
  const next = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, convertValue(item, docs)]),
  )
  if (
    ['navigationItem', 'link', 'ticketLink'].includes(next._type) &&
    next.href &&
    !next.internal
  ) {
    const target = linkTo(next.href, docs)
    if (target) {
      next.internal = reference(target)
      delete next.href
    }
  }
  if (
    ['editorialImage', 'parkImage'].includes(next._type) &&
    next.caption &&
    next.alt === undefined &&
    !next.decorative
  )
    next.alt = next.caption
  if (next._type === 'block' && next.style === 'blockquote') {
    assert.ok(
      next.children.every((span) => !span.marks?.length),
      'Review marks on a formatted legacy quote before migration',
    )
    return {
      _type: 'quotation',
      _key: next._key,
      text: next.children
        .map((span) => span.text)
        .join('')
        .replace(/^[“"]|[”"]$/g, ''),
    }
  }
  return next
}

// Recover stable anchors, display roles and file references from the existing design once.
function migrateSections(doc, layout) {
  if (doc.contentSections || !doc.body) return
  const {body, sections} = bodyForLayout(
    doc.body,
    contentPath(doc._type, doc.slug.current),
    doc.template,
  )
  if (!sections?.length) return
  const original = new Map(doc.body.map((block) => [block._key, block]))
  const sectionActions = (links) =>
    links.map((link) => {
      const mark = original.get(link._key)?.markDefs?.find((item) => item._type === 'download')
      return mark ? {...mark, _key: link._key, label: link.label} : {...link, _type: 'link'}
    })
  doc.body = body
  const retained =
    layout === 'restoration'
      ? sections.filter(({anchor}) => anchor !== 'past-initiatives' && anchor !== 'related-news')
      : sections
  doc.contentSections = retained.map((s) => {
    const role =
      slots[layout]?.[s.anchor] ||
      (s.collapsible ? 'accordion' : s.entries.length ? 'columns' : 'prose')
    return {
      _key: s._key,
      _type: 'contentSection',
      role,
      anchor: s.anchor,
      title: s.title,
      ...(s.body.length && {body: s.body}),
      ...(s.links.length && {links: sectionActions(s.links)}),
      ...(s.image && {image: without(s.image, '_key')}),
      ...(s.entries.length && {
        entries: s.entries.map((item) => ({
          ...item,
          _type: 'sectionItem',
          links: sectionActions(item.links),
        })),
      }),
    }
  })
}

export function editorialDocuments(documents) {
  return documents.map((original) => {
    const doc = structuredClone(original)
    const find = (id) =>
      (original._id.startsWith('drafts.') &&
        documents.find((item) => item._id === 'drafts.' + id)) ||
      documents.find((item) => item._id === id)
    const home = find('homePage')
    if (doc._type === 'siteSettings') {
      const old = home?.quote
      if (old && !doc.quotes)
        doc.quotes = [
          {...without(old, 'additional'), _key: 'first'},
          ...(old.additional || []),
        ].map((item) => ({...item, _type: 'siteQuote'}))
      delete doc.contactEmail
      if (doc.socialLinks) doc.socialLinks = doc.socialLinks.map((item) => without(item, 'icon'))
    }
    if (doc._type === 'homePage') {
      if (!doc.features && doc.featuredContent)
        doc.features = doc.featuredContent.map(({_key, ...entry}) => {
          const source = find(entry._ref)
          assert.ok(source, 'Missing homepage item ' + entry._ref)
          return {
            _type: 'featureCard',
            _key,
            entry,
            ...(source.featureCaption && {caption: source.featureCaption}),
            ...(source.featureImage && {image: {...source.featureImage, _type: 'editorialImage'}}),
            ...(source.featureBackground && {background: source.featureBackground}),
          }
        })
      for (const name of ['title', 'featuredContent', 'timeline', 'quote']) delete doc[name]
    }
    if (doc._type === 'page' || doc._type === 'place') {
      const layout = existingLayouts[doc.slug.current] || doc.template || 'standard'
      migrateSections(doc, layout)
      if (doc._type === 'page') doc.template = layout
      if (doc.givingLevels?.length) {
        const levels = doc.donationSections?.filter((section) => section.kind === 'levels')
        assert.ok(levels?.length, 'Missing annual giving section')
        for (const section of levels) section.levels ??= doc.givingLevels
      }
      if (baseId(doc._id) === historyPageId && home?.timeline) {
        for (const highlight of home.timeline) {
          const milestone = doc.timelineEntries?.find((item) => item._key === highlight._key)
          assert.ok(milestone, 'Unknown homepage milestone ' + highlight._key)
          milestone.showOnHomepage = true
          milestone.homeHighlight ??= {
            _type: 'homeHighlight',
            ...(highlight.year !== milestone.dateLabel && {year: highlight.year}),
            ...(highlight.summary !== milestone.description && {summary: highlight.summary}),
            ...(highlight.link && {link: highlight.link}),
          }
        }
      }
      for (const name of ['volunteerOpportunities', 'foundationHeadings', 'givingLevels'])
        delete doc[name]
    }
    if (doc._type === 'event' || doc._type === 'article') {
      for (const name of ['featureCaption', 'featureImage', 'featureBackground']) delete doc[name]
      if (doc._type === 'event') {
        delete doc.kind
        if (doc.ticketLink) doc.ticketLink._type = 'ticketLink'
      } else {
        const partner = doc.organizationRef && !hostsDetailPage(doc.organizationRef._ref)
        const href = doc.storyDestination?.href || (partner && doc.sourceLink?.href)
        if (href && /^https?:\/\//.test(href)) doc.externalUrl ??= href
        else if (href) {
          const target = linkTo(href, documents)
          assert.ok(target, 'Missing promotion destination ' + href)
          doc.targetPage ??= reference(target)
          doc.excludeFromNews = true
        }
        if (partner) assert.ok(doc.externalUrl, 'Missing partner URL for ' + doc._id)
        delete doc.storyDestination
        delete doc.archiveEntry
      }
    }
    return convertValue(doc, documents)
  })
}
