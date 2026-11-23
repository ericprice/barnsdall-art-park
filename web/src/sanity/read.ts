import 'server-only'
import type {QueryParams} from 'next-sanity'
import {client} from './client'
import {sanityFetch} from './live'
import {allowsDraftPreview} from '@/lib/preview-mode'

const reviewToken = allowsDraftPreview(
  process.env.NODE_ENV,
  process.env.VERCEL_ENV,
  process.env.BARNSDALL_PREVIEW,
)
  ? process.env.SANITY_API_READ_TOKEN
  : undefined

export async function readContent<Query extends string>(query: Query, params: QueryParams = {}) {
  if (reviewToken) {
    // An editor can save in Studio and refresh the protected preview immediately.
    return client.fetch(query, params, {
      token: reviewToken,
      perspective: 'drafts',
      useCdn: false,
      cache: 'no-store',
      stega: false,
    })
  }
  return (await sanityFetch({query, params, stega: false, perspective: 'published'})).data
}
