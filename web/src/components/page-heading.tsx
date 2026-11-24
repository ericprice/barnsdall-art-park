import type {ReactNode} from 'react'
import Link from './route-link'
import type {SiteContent} from '@/lib/content'
import {EntryLabel} from './entry-meta'

export type PageHeadingNavigation = {path: string; settings: SiteContent['settings']}

export function PageSubtitle({subtitle}: {subtitle?: string | null}) {
  return subtitle ? <p className="page-heading__subtitle">{subtitle}</p> : null
}

export function PageHeading({
  title,
  subtitle,
  label,
  navigation,
  className,
  children,
}: {
  title: string
  subtitle?: string | null
  label?: string | null
  navigation?: PageHeadingNavigation
  className?: string
  children?: ReactNode
}) {
  const path = navigation?.path ?? ''
  const section = '/' + path.split('/')[1]
  const links = navigation?.settings.navigation.find((item) => item.href === section)?.children
  const current =
    links?.find((link) => link.href === path) ??
    links?.find((link) => link.href?.split('#')[0] === path)
  const parent = links
    ?.filter((link) => link.href && link.href !== section && path.startsWith(link.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return (
    <header className={className ? `page-heading ${className}` : 'page-heading'}>
      <EntryLabel label={label} large />
      <h1>{title}</h1>
      <PageSubtitle subtitle={subtitle} />
      {children}
      {!!links?.length && (
        <nav className="subnav" aria-label="Section navigation">
          {links.map(
            (link) =>
              link.href && (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={
                    link === current ? 'page' : !current && link === parent ? 'location' : undefined
                  }
                >
                  {link.label}
                </Link>
              ),
          )}
        </nav>
      )}
    </header>
  )
}
