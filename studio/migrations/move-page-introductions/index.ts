import {at, defineMigration, patch, set, unset, type NodePatch} from 'sanity/migrate'

const subtitleLayouts = new Set(['centennial', 'rentals', 'restoration'])

export default defineMigration({
  title: 'Move page introductions to Body or Subtitle',
  documentTypes: ['page'],
  filter: 'defined(summary)',
  async *migrate(documents) {
    for await (const doc of documents()) {
      if (typeof doc.summary !== 'string') throw new Error(`Invalid introduction on ${doc._id}`)
      const introduction = doc.summary
      const changes: NodePatch[] = [at('summary', unset())]
      if (introduction.trim()) {
        const subtitle = typeof doc.subtitle === 'string' ? doc.subtitle : ''
        if (subtitleLayouts.has(String(doc.template)) && !subtitle.trim()) {
          changes.push(at('subtitle', set(introduction)))
        } else if (subtitle !== introduction) {
          const body = Array.isArray(doc.body) ? doc.body : []
          const first = body[0]
          const sameLead =
            first?._type === 'block' &&
            first.style === 'lead' &&
            first.children?.map((child: {text?: string}) => child.text ?? '').join('') ===
              introduction
          if (!sameLead) {
            const lead = {
              _key: crypto.randomUUID(),
              _type: 'block',
              style: 'lead',
              markDefs: [],
              children: [{_key: 'text', _type: 'span', marks: [], text: introduction}],
            }
            changes.push(at('body', set([lead, ...body])))
          }
        }
      }
      yield patch(doc._id, changes, {ifRevision: doc._rev})
    }
  },
})
