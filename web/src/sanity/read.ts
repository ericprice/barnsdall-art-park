import 'server-only'
import type {QueryParams} from 'next-sanity'
import {client} from './client'
import {sanityFetch} from './live'
import {allowsDraftPreview} from '@/lib/preview-mode'

export const readsDrafts = allowsDraftPreview(
  process.env.NODE_ENV,
  process.env.VERCEL_ENV,
  process.env.BARNSDALL_PREVIEW,
)

export async function readContent<Query extends string>(
  query: Query,
  params: QueryParams = {},
  options: {cache?: boolean} = {},
) {
  if (readsDrafts) {
    const reviewToken = process.env.SANITY_API_READ_TOKEN
    if (!reviewToken)
      throw new Error('Draft preview is enabled but SANITY_API_READ_TOKEN is missing.')
    // An editor can save in Studio and refresh the protected preview immediately.
    return client.fetch(query, params, {
      token: reviewToken,
      perspective: 'drafts',
      useCdn: false,
      cache: 'no-store',
      stega: false,
    })
  }
  // Serve variable result selections through the CDN without caching every ID combination in Next.
  if (options.cache === false)
    return client.fetch(query, params, {
      perspective: 'published',
      useCdn: true,
      cache: 'no-store',
      stega: false,
    })
  return (await sanityFetch({query, params, stega: false, perspective: 'published'})).data
}
