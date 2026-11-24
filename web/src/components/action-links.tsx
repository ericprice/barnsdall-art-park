import Link from './route-link'
import type {ComponentProps} from 'react'
import type {PageSection} from '@/lib/content'

type LinkProps = ComponentProps<typeof Link>

export function DotLink({children, className, ...props}: LinkProps) {
  return (
    <Link {...props} className={className ? `dot-link ${className}` : 'dot-link'}>
      <span className="small-seed" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  )
}

export function DisplayLink({
  children,
  className,
  arrow = '»',
  ...props
}: LinkProps & {arrow?: '»' | '↗'}) {
  return (
    <Link {...props} className={className ? `display-link ${className}` : 'display-link'}>
      {children} <span aria-hidden="true">{arrow}</span>
    </Link>
  )
}

export function SidebarLinks({
  links,
  label,
  className,
  linkClassName,
}: {
  links?: {_key: string; label?: string; href?: string}[]
  label: string
  className?: string
  linkClassName?: string
}) {
  const items = links?.filter((link) => link.label && link.href)
  if (!items?.length) return null
  return (
    <nav className={className} aria-label={label}>
      {items.map((link) => (
        <DisplayLink key={link._key} href={link.href!} className={linkClassName}>
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
            download={(downloadPdf && link.href.endsWith('.pdf')) || undefined}
          >
            {link.label}
          </ActionLink>
        </li>
      ))}
    </ul>
  )
}
