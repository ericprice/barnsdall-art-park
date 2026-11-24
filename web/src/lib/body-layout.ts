import {tryGetFileAsset} from '@sanity/asset-utils'
import {dataset, projectId} from '../sanity/env.ts'
import type {Page, ParkImage, RichText} from '../../sanity.types'

type TextBlock = Extract<RichText[number], {_type: 'block'}>
type Mark = NonNullable<TextBlock['markDefs']>[number]
type BodyLink = {_key: string; label: string; href: string}
type LayoutItem = {_key: string; title: string; body: RichText; links: BodyLink[]}
export type PageSection = LayoutItem & {
  anchor: string
  image?: ParkImage
  role?: string
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

type StoredSection = NonNullable<Page['contentSections']>[number]
function actions(links: StoredSection['links']): BodyLink[] {
  return (links || []).flatMap((link) => {
    const href = linkDestination(link)
    return href && link.label ? [{_key: link._key, label: link.label, href}] : []
  })
}
export function pageSections(stored: Page['contentSections']): PageSection[] | undefined {
  return stored?.map((section) => ({
    _key: section._key,
    title: section.title || '',
    anchor: section.anchor || section._key,
    role: section.role || 'prose',
    image: section.role === 'prose' || !section.role ? section.image : undefined,
    body: section.body || [],
    links: actions(section.links),
    collapsible: section.role === 'accordion' || section.role === 'past',
    entries: ['accordion', 'columns', 'past'].includes(section.role || '')
      ? (section.entries || []).map((item) => ({
          _key: item._key,
          title: item.title || '',
          body: item.body || [],
          links: actions(item.links),
        }))
      : [],
  }))
}
