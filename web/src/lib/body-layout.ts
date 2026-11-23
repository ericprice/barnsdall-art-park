import {tryGetFileAsset} from '@sanity/asset-utils'
import {dataset, projectId} from '../sanity/env.ts'
import type {ParkImage, RichText} from '../../sanity.types'

type TextBlock = Extract<RichText[number], {_type: 'block'}>
type Mark = NonNullable<TextBlock['markDefs']>[number]
type BodyLink = {_key: string; label: string; href: string}
type LayoutItem = {_key: string; title: string; body: RichText; links: BodyLink[]}
export type PageSection = LayoutItem & {
  anchor: string
  image?: ParkImage
  collapsible: boolean
  entries: LayoutItem[]
}

export function linkDestination(mark: Mark) {
  if (mark._type === 'download') {
    return mark.asset && tryGetFileAsset(mark.asset, {projectId, dataset})?.url
  }
  return typeof mark.href === 'string' && /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(mark.href)
    ? mark.href
    : undefined
}

type Heading = {_key?: string; children?: Array<{text?: string}>}

function blockText(block: Heading) {
  return (block.children ?? []).map((span) => span.text).join('')
}

// Old fragment URLs can differ from the heading text. Migrated headings carry their stable
// fragment in their block key. New headings take their fragment from the visible title.
export function headingAnchor(block: Heading) {
  if (block._key && /^(heading|disclosure|entry)-/.test(block._key))
    return block._key.replace(/^(heading|disclosure|entry)-/, '')
  return (
    blockText(block)
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') ||
    block._key ||
    'heading'
  )
}

export function standaloneLink(block: Pick<TextBlock, 'children' | 'markDefs' | 'listItem'>) {
  if (block.listItem || !block.children?.length) return
  const mark = block.markDefs?.find((mark) =>
    block.children?.every((span) => span.marks?.includes(mark._key)),
  )
  if (!mark) return
  const href = linkDestination(mark)
  if (href) return {href, label: blockText(block), download: mark._type === 'download'}
}

const layoutPaths = new Set([
  '/visit',
  '/visit/policies',
  '/visit/rentals',
  '/park/the-park',
  '/support',
  '/support/olive-grove',
  '/100',
  '/contact',
  '/history',
])

// The CMS stores one ordered body. Designed visitor pages arrange its heading groups into
// maps, columns, landscape spreads and disclosures. Stories render the body directly.
export function bodyForLayout(body: RichText | undefined, path: string, template?: string) {
  if (
    !body ||
    !(layoutPaths.has(path) || ['visit', 'timeline', 'foundation'].includes(template ?? ''))
  )
    return {body, sections: undefined}
  const intro: RichText = []
  const sections: PageSection[] = []
  let section: PageSection | undefined
  let item: LayoutItem | undefined
  const anchors = new Set<string>()
  for (const block of body) {
    if (block._type === 'block' && block.style === 'h2') {
      const base = headingAnchor(block)
      let anchor = base
      for (let suffix = 2; anchors.has(anchor); suffix++) anchor = `${base}-${suffix}`
      anchors.add(anchor)
      section = {
        _key: block._key,
        title: blockText(block),
        anchor,
        body: [],
        links: [],
        entries: [],
        collapsible:
          block._key.startsWith('disclosure-') ||
          (path === '/support/olive-grove' &&
            (anchor === 'past-initiatives' || sections.length === 1)),
      }
      sections.push(section)
      item = undefined
      continue
    }
    if (!section) {
      intro.push(block)
      continue
    }
    if (
      block._type === 'block' &&
      block.style === 'h3' &&
      (template === 'foundation' ||
        path === '/support' ||
        section.collapsible ||
        block._key.startsWith('entry-'))
    ) {
      item = {_key: block._key.replace(/^entry-/, ''), title: blockText(block), body: [], links: []}
      section.entries.push(item)
      continue
    }
    if (block._type === 'parkImage' && !item && !section.image && path === '/park/the-park') {
      section.image = block
      continue
    }
    const group = item ?? section
    group.body.push(block)
  }
  for (const section of sections) {
    for (const group of [section, ...section.entries]) {
      // Only a run of links at the end becomes the designed list of actions. A link placed
      // between two paragraphs stays exactly where the editor put it.
      while (group.body.length) {
        const last = group.body[group.body.length - 1]
        const link = last._type === 'block' && last.style === 'normal' && standaloneLink(last)
        if (!link) break
        group.links.unshift({_key: last._key, href: link.href, label: link.label})
        group.body.pop()
      }
    }
  }
  return {body: intro, sections}
}
