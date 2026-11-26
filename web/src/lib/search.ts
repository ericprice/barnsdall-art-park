import 'server-only'
import {organizationDocuments} from '../../../shared/organizations'
import {toContentEntry, type ContentEntry} from './content'
import {routeSummary} from './internal-links'
import {createSearchRanker, indexSearchFields} from './search-terms'
import {SEARCH_CARDS_QUERY, SEARCH_CATALOG_QUERY} from '@/sanity/queries'
import {imageAspectRatio} from '@/sanity/image'
import {readContent} from '@/sanity/read'

const pageSize = 12
const maxPage = Math.floor((Number.MAX_SAFE_INTEGER - 1) / pageSize)
const organizations = organizationDocuments.flatMap(({_id, title}) => [
  {id: _id, title},
  {id: _id.replace('organization-', 'organization.'), title},
])
async function loadCatalog() {
  return readContent(SEARCH_CATALOG_QUERY, {organizations})
}

function indexCatalog(docs: Awaited<ReturnType<typeof loadCatalog>>) {
  return docs.flatMap((doc) => {
    const hit = routeSummary(doc)
    return hit ? [{hit, fields: indexSearchFields(doc)}] : []
  })
}

// Check the full projection so edits to linked destinations and organizations also refresh the index.
let catalog: {source: string; rows: ReturnType<typeof indexCatalog>} | undefined
async function searchableRows() {
  const docs = await loadCatalog()
  const source = JSON.stringify(docs)
  if (!catalog || source !== catalog.source) catalog = {source, rows: indexCatalog(docs)}
  return catalog.rows
}

export async function searchContent(query: string, limit = 100) {
  const rank = createSearchRanker(query)
  if (!rank || limit <= 0) return []
  const rows = await searchableRows()
  const ranked = rows
    .flatMap(({hit, fields}) => {
      const score = rank(fields)
      return score === undefined ? [] : [{hit, score}]
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.hit.title.localeCompare(b.hit.title) ||
        a.hit.id.localeCompare(b.hit.id),
    )

  const hits = []
  const destinations = new Set<string>()
  for (const {hit} of ranked) {
    if (destinations.has(hit.href)) continue
    destinations.add(hit.href)
    hits.push(hit)
    if (hits.length >= limit) break
  }
  return hits
}

function excerpt(...candidates: (string | null)[]) {
  const text = candidates.map((candidate) => candidate?.trim().replace(/\s+/g, ' ')).find(Boolean)
  if (!text) return
  const characters = Array.from(text)
  const limit = 180
  if (characters.length <= limit) return text
  const shortened = characters.slice(0, limit - 1).join('')
  const lastSpace = shortened.lastIndexOf(' ')
  return (
    (lastSpace > 0 && characters[limit - 1] !== ' '
      ? shortened.slice(0, lastSpace)
      : shortened.trimEnd()) + '…'
  )
}

export async function searchResultPage(
  query: string,
  requestedPage: number,
): Promise<{entries: ContentEntry[]; hasMore: boolean; page: number}> {
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, maxPage) : 1
  const limit = page * pageSize
  const matches = await searchContent(query, limit + 1)
  const ids = matches.slice(0, limit).map(({id}) => id)
  const docs = ids.length ? await readContent(SEARCH_CARDS_QUERY, {ids}, {cache: false}) : []
  const entries = new Map(
    docs.map((doc) => [
      doc._id,
      {
        ...toContentEntry(doc),
        image: imageAspectRatio(doc.image) ? doc.image : undefined,
        summary: excerpt(doc.summary, doc.subtitle, doc.bodyText),
      },
    ]),
  )
  return {
    entries: ids.flatMap((id) => entries.get(id) ?? []),
    hasMore: page < maxPage && matches.length > limit,
    page,
  }
}
