import 'server-only'
import {cache} from 'react'
import {organizationDocuments, hostsDetailPage} from '../../../shared/organizations'
import {toContentEntry, type ContentEntry} from './content'
import {contentDestination, routeSummary} from './internal-links'
import {readContent} from '@/sanity/read'
import {NEWS_ROUTES_QUERY, NEWS_CARDS_QUERY, NEWS_NEIGHBORS_QUERY} from '@/sanity/queries'

const getNewsRoutes = cache(async () =>
  (await readContent(NEWS_ROUTES_QUERY)).flatMap((doc) => routeSummary(doc) ?? []),
)

export const getNewsPage = cache(async (requestedPage?: string) => {
  const routes = await getNewsRoutes()
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil((routes.length - 1) / pageSize))
  const page = Math.min(totalPages, Math.max(1, parseInt(requestedPage || '1', 10) || 1))
  const selected =
    page === 1
      ? routes.slice(0, pageSize + 1)
      : routes.slice(1 + (page - 1) * pageSize, 1 + page * pageSize)
  const docs = selected.length
    ? await readContent(NEWS_CARDS_QUERY, {ids: selected.map((route) => route.id)})
    : []
  const byId = new Map(docs.map((doc) => [doc._id, toContentEntry(doc)]))
  const featured = page === 1 && routes[0] ? byId.get(routes[0].id) : undefined
  const entries = (page === 1 ? selected.slice(1) : selected).flatMap(
    (route) => byId.get(route.id) ?? [],
  )
  return {featured, entries, page, totalPages}
})

const hostedOrganizationIds = organizationDocuments
  .filter(({_id}) => hostsDetailPage(_id))
  .flatMap(({_id}) => [_id, _id.replace('organization-', 'organization.')])

export async function getNewsNeighbors(entry: ContentEntry) {
  if (entry.type !== 'article' || entry.excludedFromNews) return {}
  const {previous, next} = await readContent(NEWS_NEIGHBORS_QUERY, {
    id: entry.id,
    date: entry.date ?? null,
    title: entry.title,
    hostIds: hostedOrganizationIds,
  })
  return {
    previous: previous && contentDestination(previous),
    next: next && contentDestination(next),
  }
}
