import {apiVersion, dataset, projectId} from '../src/sanity/env.ts'
import {organizationDocuments} from '../../shared/organizations.ts'

// Launch readiness uses exactly the same public visibility as a visitor. No token is sent.
const query = `{
  "home": *[_type == "homePage" && _id == "homePage"][0]{_id},
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{title,navigation},
  "pages": *[_type == "page" && slug.current in ["visit","support/donate"]].slug.current,
  "organizations": *[_type == "organization"]._id,
  "unresolvedOwners": count(*[_type in ["place","event","article"] && defined(organizationRef) && !defined(organizationRef->title)])
}`
const api = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`)
api.searchParams.set('perspective', 'published')
api.searchParams.set('query', query)
const response = await fetch(api)
if (!response.ok) throw new Error(`Published Sanity read failed (HTTP ${response.status}).`)
const {result} = await response.json()
function check(ok, label) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) process.exitCode = 1
}
check(result.home, 'Published Homepage')
check(
  result.settings?.title && result.settings.navigation?.length,
  'Published site title and navigation',
)
for (const slug of ['visit', 'support/donate'])
  check(result.pages.includes(slug), `Published /${slug}`)
check(
  organizationDocuments.every((org) => result.organizations.includes(org._id)),
  'Six publicly readable organizations',
)
check(
  result.unresolvedOwners === 0,
  'Published place, event and article organization references resolve',
)

// Supply a production-mode local server (or the launched domain) to include HTTP checks.
const origin = process.argv[2] || process.env.NEXT_PUBLIC_SITE_URL
if (origin) {
  for (const pathname of [
    '/',
    '/visit',
    '/support/donate',
    '/news',
    '/whats-on',
    '/sitemap.xml',
    '/robots.txt',
  ]) {
    const res = await fetch(new URL(pathname, origin), {redirect: 'manual'})
    const body = await res.text()
    let content
    if (pathname === '/sitemap.xml') content = body.includes('<loc>')
    else if (pathname === '/robots.txt') content = /^Sitemap:/im.test(body)
    else
      content =
        /<h1\b[^>]*>\s*[^<\s]/i.test(body) && !/<meta\b[^>]*content="[^"]*noindex/i.test(body)
    check(
      res.status === 200 && content,
      `${pathname} serves indexable published content (HTTP ${res.status})`,
    )
  }
}
