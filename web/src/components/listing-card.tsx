import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import type {ContentEntry} from '@/lib/content'
import {readableDate, scheduleLabel} from '@/lib/event-filters'
import {ParkImage} from './park-image'

export function NewsCredit({entry}: {entry: ContentEntry}) {
  const organization = entry.organization || entry.category
  return (
    <p className="listing-credit">
      <Link href={'/news?organization=' + encodeURIComponent(organization)}>{organization}</Link>
      {entry.date && <time dateTime={entry.date}>{readableDate(entry.date)}</time>}
    </p>
  )
}

export function ListingCard({
  entry,
  news = false,
  readMore,
}: {
  entry: ContentEntry
  news?: boolean
  readMore?: string
}) {
  const organization = entry.organization || entry.venue?.title || entry.category
  return (
    <article className="listing-card" style={themeStyle(themeForEntry(entry), entry.image)}>
      <Link href={entry.href} className="listing-card__link">
        <div className="listing-card__photo">
          <ParkImage orgTheme={themeForEntry(entry)} image={entry.image} />
        </div>
        <h3>{entry.title}</h3>
      </Link>
      {news ? (
        <>
          <NewsCredit entry={entry} />
          {entry.summary && <p className="listing-card__summary">{entry.summary}</p>}
          <Link className="listing-card__read" href={entry.href}>
            <i className="small-seed" aria-hidden="true" />
            {readMore}
          </Link>
        </>
      ) : (
        <p className="listing-credit listing-credit--event">
          <span>{organization}</span>
          {entry.date && <time dateTime={entry.date}>{scheduleLabel(entry)}</time>}
        </p>
      )}
    </article>
  )
}

export {QuoteBand as ListingQuote} from './quote-band'
