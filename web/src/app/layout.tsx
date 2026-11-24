import {randomInt} from 'node:crypto'
import type {Metadata} from 'next'
import {Suspense} from 'react'
import {getSite} from '@/lib/content'
import {getParkSunset} from '@/lib/park-sunset'
import {SiteShell} from '@/components/site-shell'
import {SiteHeader} from '@/components/site-header'
import {SiteFooter} from '@/components/site-footer'
import {SanityLive} from '@/sanity/live'
import {interfaceText} from '../../../shared/interface'
import './globals.scss'

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getSite()
  return {
    title: {default: settings.title, template: `%s — ${settings.title}`},
    description: settings.description,
    ...(process.env.VERCEL_ENV === 'preview' ? {robots: {index: false, follow: false}} : {}),
    ...(process.env.NEXT_PUBLIC_SITE_URL
      ? {metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)}
      : {}),
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {settings} = await getSite()
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-link">
          {interfaceText.skip}
        </a>
        <SiteShell seed={randomInt(2 ** 32)}>
          <SiteHeader
            settings={{title: settings.title, navigation: settings.navigation}}
            initialSunset={getParkSunset(new Date()).toISOString()}
          />
          {children}
          <SiteFooter />
        </SiteShell>
        <Suspense>
          <SanityLive />
        </Suspense>
      </body>
    </html>
  )
}
