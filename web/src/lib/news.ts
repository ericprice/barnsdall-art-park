import 'server-only'
import {cache} from 'react'
import {
  organizationDocuments,
  hostsDetailPage,
  publicOrganizationId,
} from '../../../shared/organizations'
import {toContentEntry, type ContentEntry} from './content'
import {contentDestination, routeSummary} from './internal-links'
import {bodyLeadText} from './body-layout'
import {topicStems} from './search-terms'
import {readContent} from '@/sanity/read'
import {NEWS_ROUTES_QUERY, NEWS_CARDS_QUERY, NEWS_NEIGHBORS_QUERY} from '@/sanity/queries'

const getNewsRoutes = cache(async () =>
  (await readContent(NEWS_ROUTES_QUERY)).flatMap((doc) => {
    const route = routeSummary(doc)
    if (!route) return []
    return [{
      ...route,
      subtitle: doc.subtitle,
      summary: doc.summary,
      owner: publicOrganizationId(doc.organizationRef?._ref),
    }]
  }),
)

async function getNewsCards(ids: string[]) {
  const docs = ids.length ? await readContent(NEWS_CARDS_QUERY, {ids}) : []
  return new Map(docs.map((doc) => [doc._id, toContentEntry(doc)]))
}

export const getNewsPage = cache(async (requestedPage?: string) => {
  const routes = await getNewsRoutes()
  const pageSize = 6
  const totalPages = Math.max(1, Math.ceil((routes.length - 1) / pageSize))
  const page = Math.min(totalPages, Math.max(1, parseInt(requestedPage || '1', 10) || 1))
  const selected =
    page === 1
      ? routes.slice(0, pageSize + 1)
      : routes.slice(1 + (page - 1) * pageSize, 1 + page * pageSize)
  const byId = await getNewsCards(selected.map((route) => route.id))
  const featured = page === 1 && routes[0] ? byId.get(routes[0].id) : undefined
  const entries = (page === 1 ? selected.slice(1) : selected).flatMap(
    (route) => byId.get(route.id) ?? [],
  )
  return {featured, entries, page, totalPages}
})

function newsTopics(title: string, subtitle?: string | null, summary?: string | null) {
  const topics = new Map<string, number>(
    [...topicStems([subtitle, summary].filter(Boolean).join(' '))].map((term) => [term, 1]),
  )
  for (const term of topicStems(title)) topics.set(term, 3)
  return topics
}

export async function getRelatedNews(entry: ContentEntry) {
  if (entry.type !== 'article') return []
  if (entry.relatedStories) return entry.relatedStories

  const routes = await getNewsRoutes()
  const owner = routes.find(({id}) => id === entry.id)?.owner
  const candidates = routes.filter(({id, href}) => id !== entry.id && href !== entry.href)
  const topics = newsTopics(entry.title, entry.subtitle, entry.summary || bodyLeadText(entry.body))
  const frequency = new Map<string, number>()
  const indexed = candidates.map((candidate) => {
    const terms = newsTopics(candidate.title, candidate.subtitle, candidate.summary)
    for (const term of terms.keys()) frequency.set(term, (frequency.get(term) ?? 0) + 1)
    return {...candidate, terms}
  })
  const ranked = indexed
    .map(({id, href, owner: candidateOwner, terms}) => {
      let score = 0
      for (const [term, weight] of topics) {
        const candidateWeight = terms.get(term)
        if (candidateWeight) score += Math.min(weight, candidateWeight) / (frequency.get(term) ?? 1)
      }
      return {id, href, score, sameOwner: owner != null && owner === candidateOwner}
    })
    .sort((a, b) => b.score - a.score || Number(b.sameOwner) - Number(a.sameOwner))
  const ids: string[] = []
  const destinations = new Set<string>()
  for (const {id, href} of ranked) {
    if (destinations.has(href)) continue
    destinations.add(href)
    ids.push(id)
    if (ids.length === 3) break
  }
  const cards = await getNewsCards(ids)
  return ids.flatMap((id) => cards.get(id) ?? [])
}

const hostedOrganizationIds = organizationDocuments
  .filter(({_id}) => hostsDetailPage(_id))
  .flatMap(({_id}) => [_id, _id.replace('organization-', 'organization.')])

export async function getNewsNeighbors(entry: ContentEntry) {
  if (entry.type !== 'article') return {}
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
