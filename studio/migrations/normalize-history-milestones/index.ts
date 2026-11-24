import {at, defineMigration, patch, set, unset, type NodePatch} from 'sanity/migrate'

function duplicateAlt(image: unknown) {
  return (
    !!image &&
    typeof image === 'object' &&
    'caption' in image &&
    'alt' in image &&
    typeof image.caption === 'string' &&
    image.caption !== '' &&
    image.alt === image.caption
  )
}

export default defineMigration({
  title: 'Move milestone links and remove duplicate History alt text',
  documentTypes: ['page'],
  filter: 'template == "timeline"',
  async *migrate(documents) {
    for await (const doc of documents()) {
      const changes: NodePatch[] = []
      if (duplicateAlt(doc.image)) {
        changes.push(at(['image', 'alt'], unset()))
      }
      for (const item of Array.isArray(doc.timelineEntries) ? doc.timelineEntries : []) {
        const path = ['timelineEntries', {_key: item._key}]
        if (duplicateAlt(item.image)) changes.push(at([...path, 'image', 'alt'], unset()))
        const {link, ...wording} = item.homeHighlight ?? {}
        if (!link) continue
        if (item.link && JSON.stringify(item.link) !== JSON.stringify(link)) {
          throw new Error(`Milestone ${item._key} on ${doc._id} already has a different link`)
        }
        changes.push(at([...path, 'link'], set(link)))
        changes.push(
          Object.keys(wording).some((key) => !key.startsWith('_'))
            ? at([...path, 'homeHighlight', 'link'], unset())
            : at([...path, 'homeHighlight'], unset()),
        )
      }
      if (changes.length) yield patch(doc._id, changes, {ifRevision: doc._rev})
    }
  },
})
