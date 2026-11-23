import Link from 'next/link'
import type {SiteContent} from '@/lib/content'

export function SectionNavigation({
  path,
  settings,
}: {
  path: string
  settings: SiteContent['settings']
}) {
  const section = '/' + path.split('/')[1]
  const submenu = settings.sectionMenus?.find((menu) => menu.path === section)
  const links =
    submenu?.links ??
    (section === '/support'
      ? settings.navigation.find((item) => item.href === section)?.children
      : undefined)
  if (!links?.length) return null
  const current =
    links.find((link) => link.href === path) ??
    links.find((link) => link.href?.split('#')[0] === path)
  return (
    <nav className="subnav" aria-label="Section navigation">
      {links.map(
        (link) =>
          link.href && (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link === current ? 'page' : undefined}
            >
              {link.sectionLabel || link.label}
            </Link>
          ),
      )}
    </nav>
  )
}
