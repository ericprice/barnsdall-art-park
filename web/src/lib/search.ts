import 'server-only'
import {organizationDocuments} from '../../../shared/organizations'
import type {SEARCH_QUERY_RESULT} from '../../sanity.types'
import {toContentEntry, type ContentEntry} from './content'
import {routeSummary} from './internal-links'
import {SEARCH_CARDS_QUERY, SEARCH_QUERY} from '@/sanity/queries'
import {readContent} from '@/sanity/read'

const pageSize = 12
const maxPage = Math.floor((Number.MAX_SAFE_INTEGER - 1) / pageSize)
type SearchParams = {
  searchTerm: string
  exactTerm: string
  organizationIds: string[]
  from: number
  to: number
}

async function rankedMatches<Row extends SEARCH_QUERY_RESULT[number]>(
  query: string,
  limit: number,
  readBatch: (params: SearchParams) => Promise<Row[]>,
) {
  const exactTerm = query.trim().toLowerCase()
  if (!exactTerm) return []
  const organizationIds = organizationDocuments
    .filter((org) => org.title.toLowerCase().includes(exactTerm))
    .flatMap(({_id}) => [_id, _id.replace('organization-', 'organization.')])
  const results = []
  const destinations = new Set<string>()
  const params = {searchTerm: exactTerm + '*', exactTerm, organizationIds}
  const batchSize = Math.min(limit, 100)
  // Read another ranked batch only if unroutable or duplicate rows leave the requested window short.
  for (let from = 0; results.length < limit; from += batchSize) {
    const docs = await readBatch({...params, from, to: from + batchSize})
    for (const doc of docs) {
      const hit = routeSummary(doc)
      if (hit && !destinations.has(hit.href)) {
        destinations.add(hit.href)
        results.push({doc, hit})
        if (results.length === limit) break
      }
    }
    if (docs.length < batchSize) break
  }
  return results
}

export async function searchContent(query: string, limit = 100) {
  const matches = await rankedMatches(query, limit, (params) =>
    readContent(SEARCH_QUERY, params, {cache: false}),
  )
  return matches.map(({hit}) => hit)
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
  const matches = await rankedMatches(query, limit + 1, (params) =>
    readContent(SEARCH_CARDS_QUERY, params, {cache: false}),
  )
  return {
    entries: matches.slice(0, limit).map(({doc}) => ({
      ...toContentEntry(doc),
      summary: excerpt(doc.summary, doc.subtitle, doc.bodyText),
    })),
    hasMore: page < maxPage && matches.length > limit,
    page,
  }
}
