import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {drawDots} from '@/lib/identity-dots'
import {Tile} from './tile'
import type {CSSProperties} from 'react'
import type {ContentEntry} from '@/lib/content'
import {EntryDate} from './entry-meta'
import {ParkImage} from './park-image'
import {DotLink} from './action-links'

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
  const theme = themeForEntry(entry)
  return (
    <Tile
      className="listing-card"
      style={themeStyle(theme, news ? entry.image : undefined)}
      href={entry.href}
      title={entry.title}
      label={entry.organization}
      media={
        <div
          className="tile__media listing-card__photo"
          style={{'--olive-dot': `url('/identity/dots/${dot}.svg')`} as CSSProperties}
        >
          <ParkImage editorial={news} orgTheme={theme} image={entry.image} />
        </div>
      }
    >
      <EntryDate entry={entry} />
      {news && (
        <>
          {entry.summary && <p className="tile__summary">{entry.summary}</p>}
          {entry.href && readMore && <DotLink href={entry.href}>{readMore}</DotLink>}
        </>
      )}
    </Tile>
  )
}
