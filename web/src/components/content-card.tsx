import {isCutout, themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from './route-link'
import {scheduleLabel} from '@/lib/event-filters'
import {ParkImage} from './park-image'
import type {ContentEntry} from '@/lib/content'

export function HomeFeatureCard({entry, index}: {entry: ContentEntry; index: number}) {
  const event = entry.href.startsWith('/whats-on/')
  const image = entry.featureImage || entry.image
  const theme = themeForEntry(entry)
  return (
    <article style={themeStyle(theme, image)} className={`home-feature content-card--${index % 6}`}>
      <Link href={entry.href}>
        <div
          className="content-card__image"
          data-treatment={isCutout(image) ? 'cutout' : undefined}
          style={
            !image && entry.featureBackground
              ? {backgroundColor: entry.featureBackground}
              : undefined
          }
        >
          <ParkImage editorial orgTheme={theme} image={image} />
        </div>
        {entry.organization && <p className="home-feature__category">{entry.organization}</p>}
        <h2 className="card-heading">{entry.title}</h2>
        {event && entry.date && !entry.featureCaption ? (
          <time dateTime={entry.date}>{scheduleLabel(entry)}</time>
        ) : entry.featureCaption ? (
          <span className="home-feature__caption">
            <i className="small-seed" aria-hidden="true" />
            {entry.featureCaption}
          </span>
        ) : null}
      </Link>
    </article>
  )
}
