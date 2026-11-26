import type {MetadataRoute} from 'next'
import {contentDestination, contentPath} from '@/lib/internal-links'
import {readContent} from '@/sanity/read'
import {SITEMAP_QUERY} from '@/sanity/queries'
import {validateContentSlug} from '../../../shared/routes'
import {publicOrigin} from '@/lib/site-origin'

async function getSitemapPaths() {
  const docs = await readContent(SITEMAP_QUERY)
  return docs.flatMap((doc) => {
    const path = contentPath(doc._type, doc.slug?.current)
    return validateContentSlug(doc.slug?.current, doc._type) === true &&
      contentDestination(doc) === path
      ? [path]
      : []
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!publicOrigin) return []
  const paths = new Set(['/', '/whats-on', '/news', ...(await getSitemapPaths())])
  return [...paths].map((path) => ({url: new URL(path, publicOrigin).href}))
}
