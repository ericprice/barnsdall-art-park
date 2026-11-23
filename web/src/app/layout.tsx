import type {Metadata} from 'next'
import localFont from 'next/font/local'
import {Suspense} from 'react'
import {getSite} from '@/lib/content'
import {getParkSunset} from '@/lib/park-sunset'
import {SiteHeader} from '@/components/site-header'
import {SiteFooter} from '@/components/site-footer'
import {SanityLive} from '@/sanity/live'
import './globals.scss'

const boardDisplay = localFont({
  src: '../fonts/aline-gothic.woff2',
  variable: '--font-board-display',
  weight: '400',
  display: 'swap',
  fallback: [],
  adjustFontFallback: false,
})
const high = localFont({
  src: '../fonts/barnsdall-high.woff2',
  variable: '--font-high',
  display: 'swap',
  weight: '400',
  fallback: [],
  adjustFontFallback: false,
})
const low = localFont({
  src: '../fonts/barnsdall-low.woff2',
  variable: '--font-low',
  display: 'swap',
  weight: '400',
  fallback: [],
  adjustFontFallback: false,
})
const publisher = localFont({
  src: [
    {path: '../fonts/publisher.woff2', style: 'normal', weight: '400'},
    {path: '../fonts/publisher-italic.woff2', style: 'italic', weight: '400'},
    {path: '../fonts/publisher-bold.woff2', style: 'normal', weight: '700'},
  ],
  variable: '--font-publisher',
  display: 'swap',
})
const publisherSans = localFont({
  src: '../fonts/publisher-sans.woff2',
  variable: '--font-publisher-sans',
  weight: '400',
  display: 'swap',
})

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${boardDisplay.variable} ${high.variable} ${low.variable} ${publisher.variable} ${publisherSans.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          {settings.interfaceText.skip}
        </a>
        <div className="site-shell">
          <SiteHeader settings={settings} initialSunset={getParkSunset(new Date()).toISOString()} />
          {children}
          <SiteFooter settings={settings} />
        </div>
        <Suspense>
          <SanityLive />
        </Suspense>
      </body>
    </html>
  )
}
