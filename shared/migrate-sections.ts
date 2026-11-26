// Convert the former section and entry arrays into the same Portable Text blocks editors create.
type StoredObject = Record<string, unknown>
type StoredSection = {
  _key?: string
  anchor?: string
  title?: string
  lead?: string
  body?: StoredObject[]
  image?: StoredObject
  links?: StoredObject[]
  entries?: Array<{_key?: string; title?: string; body?: StoredObject[]; link?: StoredObject}>
}

function textBlock(key: string, style: string, text: string) {
  return {
    _key: key,
    _type: 'block',
    style,
    markDefs: [] as StoredObject[],
    children: [{_key: 'text', _type: 'span', marks: [] as string[], text}],
  }
}

function linkBlock(key: string, link: StoredObject) {
  const block = textBlock(key, 'normal', String(link.label || link.href || ''))
  block.children[0].marks.push('destination')
  block.markDefs.push(
    link.attachment
      ? {...(link.attachment as StoredObject), _key: 'destination', _type: 'download'}
      : {_key: 'destination', _type: 'link', href: link.href},
  )
  return block
}

function appendToBody(body: StoredObject[]) {
  const keys = new Set(body.map((block) => block._key))
  return (block: StoredObject, preferredKey: string) => {
    let key = preferredKey
    for (let suffix = 2; keys.has(key); suffix++) key = `${preferredKey}-${suffix}`
    keys.add(key)
    body.push({...block, _key: key})
  }
}

export function migrateSectionsToBody<T extends StoredObject>(document: T): StoredObject {
  if (!Array.isArray(document.sections)) return document
  const {sections, ...rest} = document
  const body: StoredObject[] = [...((rest.body as StoredObject[] | undefined) || [])]
  const append = appendToBody(body)

  for (const [i, section] of (sections as StoredSection[]).entries()) {
    const anchor = section.anchor || section._key || `section-${i + 1}`
    const headingKey = `heading-${anchor}`
    append(textBlock(headingKey, 'h2', section.title || ''), headingKey)
    if (section.lead) append(textBlock('lead', 'normal', section.lead), `${anchor}-lead`)
    for (const [index, block] of (section.body || []).entries()) {
      append(block, `${anchor}-${block._key || index}`)
    }
    if (section.image) append(section.image, `visual-${anchor}`)
    for (const [index, entry] of (section.entries || []).entries()) {
      const entryKey = entry._key || String(index + 1)
      append(textBlock('heading', 'h3', entry.title || ''), `entry-${entryKey}`)
      for (const [n, block] of (entry.body || []).entries()) {
        append(block, `${anchor}-${entryKey}-${block._key || n}`)
      }
      if (entry.link) append(linkBlock('link', entry.link), `${anchor}-${entryKey}-link`)
    }
    for (const [index, link] of (section.links || []).entries()) {
      append(linkBlock('link', link), `${anchor}-${link._key || index}-link`)
    }
  }
  return body.length || Array.isArray(document.body) ? {...rest, body} : rest
}

type ContentSection = StoredSection & {role?: string}

export function moveProseSections(document: StoredObject) {
  if (!Array.isArray(document.contentSections) || !document.contentSections.length) return

  const sections = document.contentSections as ContentSection[]
  // Getting Here renders its map above the body, regardless of its position in Sections.
  const map = document.template === 'visit' ? sections.find(({role}) => role === 'map') : undefined
  const afterBody = sections.filter((section) => section !== map)
  const firstStructured = afterBody.findIndex(
    ({role, entries}) => (role && !['prose', 'inquiries', 'plan'].includes(role)) || entries?.length,
  )
  const prose = firstStructured < 0 ? afterBody : afterBody.slice(0, firstStructured)
  if (!prose.length) return

  const body = Array.isArray(document.body) ? [...document.body] : []
  const append = appendToBody(body)

  for (const section of prose) {
    const anchor = section.anchor || section._key
    if (!anchor || !section.title) throw new Error(`Untitled section on ${document._id}`)
    const headingKey = 'heading-' + anchor
    append(textBlock(headingKey, 'h2', section.title), headingKey)
    for (const [index, block] of (section.body || []).entries()) {
      append(block, String(block._key || `${anchor}-text-${index}`))
    }
    for (const [index, link] of (section.links || []).entries()) {
      const {_key, label, ...destination} = link
      if (typeof label !== 'string' || !label) throw new Error(`Unlabeled link on ${document._id}`)
      const key = `${anchor}-link-${_key || index}`
      const action = textBlock(key, 'dotLink', label)
      action.children[0].marks.push('destination')
      action.markDefs.push({...destination, _key: 'destination'})
      append(action, key)
    }
    if (section.image) append(section.image, `image-${anchor}`)
  }

  return {body, contentSections: sections.filter((section) => !prose.includes(section))}
}
