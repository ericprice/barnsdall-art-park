import type {CSSProperties, ReactNode} from 'react'
import {EntryLabel} from './entry-meta'
import Link from './route-link'

type TileProps = {
  title: string
  label?: string | null
  href?: string
  media?: ReactNode
  heading?: 'h2' | 'h3'
  className?: string
  style?: CSSProperties
  caption?: ReactNode
  children?: ReactNode
}

export function Tile({
  title,
  label,
  href,
  media,
  heading: Heading = 'h3',
  className,
  style,
  caption,
  children,
}: TileProps) {
  const content = (
    <>
      {media}
      <EntryLabel label={label} />
      <Heading className="tile__title">{title}</Heading>
      {caption}
    </>
  )
  return (
    <article className={className ? 'tile ' + className : 'tile'} style={style}>
      {href ? (
        <Link href={href} className="tile__heading">
          {content}
        </Link>
      ) : (
        <div className="tile__heading">{content}</div>
      )}
      {children}
    </article>
  )
}
