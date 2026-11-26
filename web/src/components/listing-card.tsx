import '../styles/_listings.scss'
import {createHash} from 'node:crypto'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {drawDots} from '@/lib/identity-dots'
import {organizationDocuments} from '../../../shared/organizations'
import {interfaceText} from '../../../shared/interface'
import {Tile} from './tile'
import type {CSSProperties} from 'react'
import type {ContentEntry} from '@/lib/content'
import {EntryDate} from './entry-meta'
import {ParkImage} from './park-image'
import {DotLink} from './action-links'

const categories = {
  page: 'Page',
  place: 'Place',
  event: 'Event',
  article: interfaceText.news,
} satisfies Record<ContentEntry['type'], string>

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
          variant={news ? 'news' : 'event'}
          readMore={readMore}
        />
      ))}
    </div>
  )
}

export function SearchResultCard({entry}: {entry: ContentEntry}) {
  // Keep the dot and palette stable when the same result appears in another search.
  const [shape, background, foreground] = createHash('sha256').update(entry.id).digest()
  const dot = (shape % 14) + 1
  const baseTheme =
    !entry.image && !entry.organization
      ? organizationDocuments[background % organizationDocuments.length]
      : themeForEntry(entry)
  const dotColor = organizationDocuments[foreground % organizationDocuments.length].light
  const theme = entry.image ? baseTheme : {...baseTheme, light: dotColor}
  const label = [categories[entry.type], entry.organization].filter(Boolean).join(' · ')
  return <ListingCard entry={entry} dot={dot} variant="search" theme={theme} label={label} />
}

function ListingCard({
  entry,
  dot,
  variant,
  readMore,
  theme = themeForEntry(entry),
  label = entry.organization,
}: {
  entry: ContentEntry
  dot: number
  variant: 'event' | 'news' | 'search'
  readMore?: string
  theme?: ReturnType<typeof themeForEntry>
  label?: string | null
}) {
  const editorial = variant === 'news' || (variant === 'search' && entry.type === 'article')
  return (
    <Tile
      className="listing-card"
      style={themeStyle(theme, editorial ? entry.image : undefined)}
      href={entry.href}
      title={entry.title}
      label={label}
      heading={variant === 'search' ? 'h2' : undefined}
      media={
        <div
          className="tile__media listing-card__photo"
          style={{'--olive-dot': `url('/identity/dots/${dot}.svg')`} as CSSProperties}
        >
          <ParkImage
            editorial={editorial}
            orgTheme={theme}
            image={entry.image}
            sizes="(max-width: 32rem) 92vw, (max-width: 44rem) 45vw, (max-width: 64rem) 31vw, 20rem"
          />
        </div>
      }
    >
      <EntryDate entry={entry} />
      {variant !== 'event' && entry.summary && <p className="tile__summary">{entry.summary}</p>}
      {variant === 'news' && entry.href && readMore && (
        <DotLink href={entry.href}>{readMore}</DotLink>
      )}
    </Tile>
  )
}
