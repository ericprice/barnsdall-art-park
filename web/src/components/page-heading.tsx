import Link from './route-link'
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
  const parent = links
    ?.filter((link) => link.href && link.href !== section && path.startsWith(link.href + '/'))
    .sort((a, b) => b.href.length - a.href.length)[0]
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
