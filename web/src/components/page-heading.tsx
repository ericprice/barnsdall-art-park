import Link from 'next/link'
import type {SiteContent} from '@/lib/content'

export function PageHeading({
  title,
  path,
  settings,
}: {
  title: string
  path: string
  settings: SiteContent['settings']
}) {
  const section = '/' + path.split('/')[1]
  const links = settings.navigation.find((item) => item.href === section)?.children
  const current =
    links?.find((link) => link.href === path) ??
    links?.find((link) => link.href?.split('#')[0] === path)
  return (
    <header className="page-heading">
      <h1>{title}</h1>
      {!!links?.length && (
        <nav className="subnav" aria-label="Section navigation">
          {links.map(
            (link) =>
              link.href && (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={link === current ? 'page' : undefined}
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
