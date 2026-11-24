const routePrefixes: Record<string, string> = {place: '/park', event: '/whats-on', article: '/news'}

export function contentPath(type: string, slug?: string | null) {
  return slug ? (routePrefixes[type] || '') + '/' + slug : '/'
}

type Route = {
  _id: string
  _type: string
  slug: string | null
  externalUrl?: string | null
  targetSlug?: string | null
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
  fetchRoutes: (ids: string[]) => Promise<Route[]>,
): Promise<T> {
  const copy = structuredClone(data)
  const links: StoredLink[] = []
  collectLinks(copy, links)
  if (!links.length) return data
  const routes = await fetchRoutes([...new Set(links.map((link) => link.internal._ref))])
  const hrefs = new Map(
    routes
      .filter((doc) => doc.slug)
      .map((doc) => [
        doc._id,
        doc.externalUrl ||
          (doc.targetSlug ? contentPath('page', doc.targetSlug) : contentPath(doc._type, doc.slug)),
      ]),
  )
  for (const link of links) link.href = hrefs.get(link.internal._ref)
  return copy
}
