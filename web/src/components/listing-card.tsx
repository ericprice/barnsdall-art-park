import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {drawDots} from '@/lib/identity-dots'
import Link from './route-link'
import type {CSSProperties} from 'react'
import type {ContentEntry} from '@/lib/content'
import {readableDate, scheduleLabel} from '@/lib/event-filters'
import {ParkImage} from './park-image'
import {DotLink} from './action-links'

export function NewsCredit({entry}: {entry: ContentEntry}) {
  const {organization} = entry
  return (
    <p className="listing-credit">
      {organization && <span>{organization}</span>}
      {entry.date && <time dateTime={entry.date}>{readableDate(entry.date)}</time>}
    </p>
  )
}

export function ListingGrid({
  entries,
  news = false,
  readMore,
}: {
  entries: ContentEntry[]
  news?: boolean
  readMore?: string
}) {
  const dots = drawDots(entries.length)
  return (
    <div className="listing-grid">
      {entries.map((entry, index) => (
        <ListingCard
          key={entry.id}
          entry={entry}
          dot={dots[index]}
          news={news}
          readMore={readMore}
        />
      ))}
    </div>
  )
}

function ListingCard({
  entry,
  dot,
  news,
  readMore,
}: {
  entry: ContentEntry
  dot: number
  news: boolean
  readMore?: string
}) {
  const heading = (
    <>
      <div
        className="listing-card__photo"
        style={{'--olive-dot': `url('/identity/dots/${dot}.svg')`} as CSSProperties}
      >
        <ParkImage editorial={news} orgTheme={themeForEntry(entry)} image={entry.image} />
      </div>
      <h3>{entry.title}</h3>
    </>
  )
  return (
    <article
      className="listing-card"
      style={themeStyle(themeForEntry(entry), news ? entry.image : undefined)}
    >
      {entry.href ? (
        <Link href={entry.href} className="listing-card__link card-heading">
          {heading}
        </Link>
      ) : (
        <div className="listing-card__link card-heading">{heading}</div>
      )}
      {news ? (
        <>
          <NewsCredit entry={entry} />
          {entry.summary && <p className="listing-card__summary">{entry.summary}</p>}
          <DotLink href={entry.href}>{readMore}</DotLink>
        </>
      ) : (
        <p className="listing-credit listing-credit--event">
          {entry.organization && <span>{entry.organization}</span>}
          {entry.date && <time dateTime={entry.date}>{scheduleLabel(entry)}</time>}
        </p>
      )}
    </article>
  )
}
