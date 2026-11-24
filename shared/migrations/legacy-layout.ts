import type {RichText} from '../../web/sanity.types'
import {headingAnchor, standaloneLink, type PageSection} from '../../web/src/lib/body-layout.ts'
type LayoutItem = PageSection['entries'][number]
const blockText = (block: {children?: Array<{text?: string}>}) =>
  (block.children ?? []).map((span) => span.text).join('')
const layoutPaths = new Set([
  '/visit',
  '/visit/policies',
  '/visit/rentals',
  '/support',
  '/support/olive-grove',
  '/100',
  '/contact',
  '/history',
])

// Recover the structured sections and stable anchors used by the current CMS.
export function bodyForLayout(body: RichText | undefined, path: string, template?: string) {
  const parkLocation = path.startsWith('/park/')
  if (
    !body ||
    !(
      parkLocation ||
      layoutPaths.has(path) ||
      ['visit', 'timeline', 'foundation'].includes(template ?? '')
    )
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
        collapsible: block._key.startsWith('disclosure-'),
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
    if (block._type === 'parkImage' && !item && !section.image && parkLocation) {
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
