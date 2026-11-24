import {hostsDetailPage, isExternalStoryUrl} from '../../../shared/organizations.ts'

const routePrefixes: Record<string, string> = {place: '/park', event: '/whats-on', article: '/news'}

export function contentPath(type: string, slug?: string | null) {
  return slug ? (routePrefixes[type] || '') + '/' + slug : '/'
}

type Route = {
  _type: string
  slug?: {current?: string} | null
  organizationRef?: {_ref: string} | null
  externalUrl?: string | null
  targetPageId?: string | null
  targetSlug?: string | null
}
export function contentDestination(doc: Route) {
  const {externalUrl, targetPageId, targetSlug, _type, organizationRef} = doc
  const hosted = hostsDetailPage(organizationRef?._ref)
  if (_type === 'article' && targetPageId)
    return targetSlug ? contentPath('page', targetSlug) : undefined
  if ((_type === 'event' || _type === 'article') && !hosted)
    return isExternalStoryUrl(externalUrl) ? externalUrl : undefined
  if (_type !== 'event' && externalUrl) return externalUrl
  return doc.slug?.current ? contentPath(_type, doc.slug.current) : undefined
}

type StoredLink = {internal: {_ref: string}; href?: string}
function collectLinks(value: unknown, links: StoredLink[]) {
  if (!value || typeof value !== 'object') return
  if (
    'internal' in value &&
    value.internal &&
    typeof value.internal === 'object' &&
    '_ref' in value.internal &&
    typeof value.internal._ref === 'string'
  )
    links.push(value as StoredLink)
  for (const child of Object.values(value)) collectLinks(child, links)
}

// Normalize a fresh copy so a cached Sanity response can be reused by other requests.
export async function resolveInternalLinks<T>(
  data: T,
  fetchRoutes: (ids: string[]) => Promise<(Route & {_id: string})[]>,
): Promise<T> {
  const copy = structuredClone(data)
  const links: StoredLink[] = []
  collectLinks(copy, links)
  if (!links.length) return data
  const routes = await fetchRoutes([...new Set(links.map((link) => link.internal._ref))])
  const hrefs = new Map(routes.map((doc) => [doc._id, contentDestination(doc)]))
  for (const link of links) link.href = hrefs.get(link.internal._ref)
  return copy
}
