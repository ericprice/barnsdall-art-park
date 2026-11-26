import 'server-only'
import {organizationDocuments} from '../../../shared/organizations'
import {routeSummary} from './internal-links'
import {SEARCH_QUERY} from '@/sanity/queries'
import {readContent} from '@/sanity/read'

export async function searchContent(query: string, limit = 100) {
  const exactTerm = query.trim().toLowerCase()
  if (!exactTerm) return []
  const organizationIds = organizationDocuments
    .filter((org) => org.title.toLowerCase().includes(exactTerm))
    .flatMap(({_id}) => [_id, _id.replace('organization-', 'organization.')])
  const results = []
  const destinations = new Set<string>()
  const params = {searchTerm: exactTerm + '*', exactTerm, organizationIds}
  // Read another ranked batch only if unroutable or duplicate rows leave the requested window short.
  for (let from = 0; results.length < limit; from += limit) {
    const docs = await readContent(
      SEARCH_QUERY,
      {...params, from, to: from + limit},
      {cache: false},
    )
    for (const doc of docs) {
      const hit = routeSummary(doc)
      if (hit && !destinations.has(hit.href)) {
        destinations.add(hit.href)
        results.push(hit)
        if (results.length === limit) break
      }
    }
    if (docs.length < limit) break
  }
  return results
}
