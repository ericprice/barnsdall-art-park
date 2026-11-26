import type {ComponentProps, CSSProperties, ReactNode} from 'react'
import type {PageSection} from '@/lib/content'
import {nextLinkDot} from '@/lib/identity-dots'
import {DisplayLink} from './display-link'
import Link from './route-link'

type LinkProps = ComponentProps<typeof Link>

export function DotLinkContent({
  children,
  dot = nextLinkDot(),
}: {
  children: ReactNode
  dot?: number
}) {
  return (
    <>
      <span
        className="small-seed"
        style={{'--olive-dot': `url('/identity/dots/${dot}.svg')`} as CSSProperties}
        aria-hidden="true"
      />
      <span>{children}</span>
    </>
  )
}

export function DotLink({children, className, dot, ...props}: LinkProps & {dot?: number}) {
  return (
    <Link {...props} className={className ? `dot-link ${className}` : 'dot-link'}>
      <DotLinkContent dot={dot}>{children}</DotLinkContent>
    </Link>
  )
}

export function SidebarLinks({
  links,
  label,
  className,
}: {
  links?: {_key: string; label?: string; href?: string}[]
  label: string
  className?: string
}) {
  const items = links?.filter((link) => link.label && link.href)
  if (!items?.length) return null
  return (
    <nav className={className} aria-label={label}>
      {items.map((link) => (
        <DisplayLink key={link._key} href={link.href!}>
          {link.label}
        </DisplayLink>
      ))}
    </nav>
  )
}

export function ActionLinks({
  links,
  variant = 'body',
  downloadPdf = false,
}: {
  links?: PageSection['links']
  variant?: 'body' | 'display'
  downloadPdf?: boolean
}) {
  const actions = links?.filter((link) => link.href)
  if (!actions?.length) return null
  const ActionLink = variant === 'display' ? DisplayLink : DotLink
  return (
    <ul className="action-links" role="list">
      {actions.map((link) => (
        <li key={link._key}>
          <ActionLink
            href={link.href}
            download={
              link.download || (downloadPdf && /\.pdf(?:[?#]|$)/i.test(link.href)) || undefined
            }
          >
            {link.label}
          </ActionLink>
        </li>
      ))}
    </ul>
  )
}
