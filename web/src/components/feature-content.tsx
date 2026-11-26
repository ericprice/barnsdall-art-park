import type {ReactNode} from 'react'
import {DisplayLinkContent} from './action-links'
import {EntryLabel} from './entry-meta'
import Link from './route-link'

export function FeatureContent({
  title,
  heading: Heading = 'h2',
  label,
  meta,
  summary,
  link,
  className,
}: {
  title: string | null | undefined
  heading?: 'h1' | 'h2'
  label?: string | null
  meta?: ReactNode
  summary?: string | null
  link?: {label?: string; href?: string} | null
  className?: string
}) {
  const content = (
    <div className={className ? `feature-content ${className}` : 'feature-content'}>
      <EntryLabel label={label} large />
      <Heading className="feature-content__title">{title}</Heading>
      {meta}
      {summary && <p className="feature-content__summary">{summary}</p>}
      {link?.href && link.label && (
        <span className="display-link">
          <DisplayLinkContent>{link.label}</DisplayLinkContent>
        </span>
      )}
    </div>
  )
  return link?.href ? (
    <Link className="feature-link" href={link.href}>
      {content}
    </Link>
  ) : (
    content
  )
}
