import type {MetadataRoute} from 'next'
import {publicOrigin} from '@/lib/site-origin'

export default function robots(): MetadataRoute.Robots {
  return publicOrigin
    ? {
        rules: {userAgent: '*', allow: '/', disallow: ['/api/']},
        sitemap: new URL('/sitemap.xml', publicOrigin).href,
      }
    : {rules: {userAgent: '*', disallow: '/'}}
}
