export const routePrefixes: Record<string, string> = {
  place: '/park',
  event: '/whats-on',
  article: '/news',
}
const typesByPrefix = new Map(
  Object.entries(routePrefixes).map(([type, prefix]) => [prefix.slice(1), type]),
)

export function contentRoute(path: string) {
  const parts = path.slice(1).split('/')
  const type = (parts.length > 1 && typesByPrefix.get(parts[0])) || 'page'
  return {type, slug: (type === 'page' ? parts : parts.slice(1)).join('/')}
}

export const legacyRedirects = [
  {source: '/getting-here', destination: '/visit', permanent: true},
  {source: '/map', destination: '/visit#map', permanent: true},
  {source: '/rentals', destination: '/visit/rentals', permanent: true},
  {source: '/the-park', destination: '/park/the-park', permanent: true},
  {source: '/olive-grove-initiative', destination: '/support/olive-grove', permanent: true},
  {
    source: '/olive-wood-workshop',
    destination: '/support/initiatives/olive-wood-workshop',
    permanent: true,
  },
  {
    source: '/gardenparty2022-copy',
    destination: '/support/initiatives/garden-party-2022',
    permanent: true,
  },
  {source: '/timeline', destination: '/history', permanent: true},
  {source: '/grove-history', destination: '/history', permanent: true},
]

const reservedPaths = new Set([
  '/news',
  '/whats-on',
  '/search',
  '/robots.txt',
  '/sitemap.xml',
  '/dev/loading',
  '/icon.svg',
  ...legacyRedirects.map(({source}) => source),
])

export function validateContentSlug(slug: string | undefined, type: string) {
  if (
    !slug ||
    !slug
      .split('/')
      .every((part) => /^[\p{L}\p{N}._~-]+$/u.test(part) && part !== '.' && part !== '..')
  ) {
    return 'Enter a complete page path with valid URL segments.'
  }
  const path = (routePrefixes[type] || '') + '/' + slug
  if (
    reservedPaths.has(path) ||
    /^\/(?:_next|api|identity|images)(?:\/|$)/.test(path) ||
    contentRoute(path).type !== type
  ) {
    return 'This path belongs to another part of the website.'
  }
  return true
}
