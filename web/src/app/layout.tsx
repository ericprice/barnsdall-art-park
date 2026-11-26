import {randomInt} from 'node:crypto'
import type {Metadata} from 'next'
import {Suspense, type CSSProperties} from 'react'
import {hexColor} from '../../../shared/organizations'
import {getShell} from '@/lib/content'
import {getParkSunset} from '@/lib/park-sunset'
import {SiteShell} from '@/components/site-shell'
import Link from '@/components/route-link'
import {SiteHeader} from '@/components/site-header'
import {SiteFooter} from '@/components/site-footer'
import {SanityLive} from '@/sanity/live'
import {readsDrafts} from '@/sanity/read'
import {publicOrigin} from '@/lib/site-origin'
import {interfaceText} from '../../../shared/interface'
import './globals.scss'

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getShell()
  return {
    title: {default: settings.title, template: `%s — ${settings.title}`},
    description: settings.description,
    ...(!publicOrigin ? {robots: {index: false, follow: false}} : {}),
    ...(publicOrigin ? {metadataBase: publicOrigin} : {}),
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {settings, homeSubtitle, organizationColors} = await getShell()
  const foundationLight = hexColor(
    organizationColors.find(({_id}) => _id === 'organization-foundation')?.light,
  )
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      style={{'--foundation-light': foundationLight} as CSSProperties}
    >
      <body>
        <SiteShell seed={randomInt(2 ** 32)} navigation={settings.navigation}>
          <Link href="#main-content" className="skip-link">
            {interfaceText.skip}
          </Link>
          <SiteHeader
            settings={{
              title: settings.title,
              navigation: settings.navigation,
              searchPlaceholders: settings.searchPlaceholders,
            }}
            homeSubtitle={homeSubtitle}
            initialSunset={getParkSunset(new Date()).toISOString()}
          />
          {children}
          <SiteFooter />
        </SiteShell>
        {!readsDrafts && (
          <Suspense>
            <SanityLive />
          </Suspense>
        )}
      </body>
    </html>
  )
}
