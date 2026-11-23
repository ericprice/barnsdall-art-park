import {at, defineMigration, patch, set, unset} from 'sanity/migrate'
import {migrateSectionsToBody} from '../../../shared/migrate-sections'
import {migrateEditorialImages} from '../../../shared/migrate-editorial-images.mjs'

function streamline(document: Record<string, unknown>) {
  const result: Record<string, unknown> = migrateEditorialImages(migrateSectionsToBody(document))
  const next = {...result}
  delete next.seo
  if (next._type === 'page') delete next.actionLink
  if (next._type === 'event' || next._type === 'article') {
    if (next.organization && !next.organizationRef) {
      throw new Error(`Select an organization on ${next._id} before removing its legacy label.`)
    }
    delete next.organization
    delete next.featureCategory
    if (next._type === 'article') delete next.category
    if (next._type === 'event') {
      delete next.place
      delete next.venueLabel
    }
  }
  return next
}

export default defineMigration({
  title: 'Streamline editorial fields and move sections into the body',
  documentTypes: ['article', 'event', 'homePage', 'page', 'place', 'siteSettings'],
  async *migrate(documents) {
    for await (const doc of documents()) {
      const next = streamline(doc)
      const fields = new Set([...Object.keys(doc), ...Object.keys(next)])
      const changes = [...fields]
        .filter((field) => !field.startsWith('_') && JSON.stringify(doc[field]) !== JSON.stringify(next[field]))
        .map((field) => at([field], field in next ? set(next[field]) : unset()))
      if (changes.length) yield patch(doc._id, changes, {ifRevision: doc._rev})
    }
  },
})
