import {artDirection, themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import {scheduleLabel} from '@/lib/event-filters'
import {ParkImage} from './park-image'
import type {ContentEntry} from '@/lib/content'

export function ContentCard({entry, index = 0}: {entry: ContentEntry; index?: number}) {
  const theme = themeForEntry(entry)
  return (
    <article
      style={themeStyle(theme, entry.image)}
      className={`content-card content-card--${index % 6}`}
    >
      <Link href={entry.href} className="content-card__link">
        <div className="content-card__image" data-treatment={artDirection(entry.image)?.treatment}>
          <ParkImage orgTheme={theme} image={entry.image} />
        </div>
        <p className="content-card__category">
          <span className="small-seed" aria-hidden="true" />
          {entry.category}
        </p>
        <h2>
          {entry.title}
          {entry.href.startsWith('https://') && (
            <span className="external-arrow" aria-label=" (external website)">
              {' '}
              ↗
            </span>
          )}
        </h2>
        {entry.summary && <p className="content-card__summary">{entry.summary}</p>}
      </Link>
    </article>
  )
}

export function HomeFeatureCard({entry, index}: {entry: ContentEntry; index: number}) {
  const event = entry.href.startsWith('/whats-on/')
  const image = entry.featureImage || entry.image
  const theme = themeForEntry(entry)
  return (
    <article style={themeStyle(theme, image)} className={`home-feature content-card--${index % 6}`}>
      <Link href={entry.href}>
        <div
          className="content-card__image"
          data-treatment={artDirection(image)?.treatment}
          style={
            !image && entry.featureBackground
              ? {backgroundColor: entry.featureBackground}
              : undefined
          }
        >
          <ParkImage orgTheme={theme} image={image} />
        </div>
        <p className="home-feature__category">{entry.featureCategory || entry.category}</p>
        <h2>{entry.title}</h2>
        {event && entry.date ? (
          <time dateTime={entry.date}>{scheduleLabel(entry)}</time>
        ) : (
          <span className="home-feature__caption">
            <i className="small-seed" aria-hidden="true" />
            {entry.featureCaption}
          </span>
        )}
      </Link>
    </article>
  )
}
