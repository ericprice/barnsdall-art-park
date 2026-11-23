import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import type {ContentEntry} from '@/lib/content'
import {readableDate, scheduleLabel} from '@/lib/event-filters'
import {ParkImage} from './park-image'
import {DotLink} from './dot-link'

export function NewsCredit({entry}: {entry: ContentEntry}) {
  const {organization} = entry
  return (
    <p className="listing-credit">
      {organization && (
        <Link href={'/news?organization=' + encodeURIComponent(organization)}>{organization}</Link>
      )}
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
  return (
    <article
      className="listing-card"
      style={themeStyle(themeForEntry(entry), news ? entry.image : undefined)}
    >
      <Link href={entry.href} className="listing-card__link">
        <div className="listing-card__photo">
          <ParkImage editorial={news} orgTheme={themeForEntry(entry)} image={entry.image} />
        </div>
        <h3>{entry.title}</h3>
      </Link>
      {news ? (
        <>
          <NewsCredit entry={entry} />
          {entry.summary && <p className="listing-card__summary">{entry.summary}</p>}
          <DotLink className="listing-card__read" href={entry.href}>
            {readMore}
          </DotLink>
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

export {QuoteBand as ListingQuote} from './quote-band'
