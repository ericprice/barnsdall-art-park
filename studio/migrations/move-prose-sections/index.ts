import {at, defineMigration, patch, set, unset} from 'sanity/migrate'
import {moveProseSections} from '../../../shared/migrate-sections'

export default defineMigration({
  title: 'Move prose sections to Body',
  documentTypes: ['page', 'place'],
  filter: 'count(contentSections) > 0',
  async *migrate(documents) {
    for await (const doc of documents()) {
      const result = moveProseSections(doc)
      if (!result) continue
      yield patch(
        doc._id,
        [
          at('body', set(result.body)),
          at('contentSections', result.contentSections.length ? set(result.contentSections) : unset()),
        ],
        {ifRevision: doc._rev},
      )
    }
  },
})
