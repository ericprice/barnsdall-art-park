import {isCutout, themeForEntry, themeStyle} from '@/lib/image-theme'
import {DotLinkContent} from './action-links'
import {Tile} from './tile'
import {EntryDate} from './entry-meta'
import {ParkImage} from './park-image'
import type {ContentEntry} from '@/lib/content'

export function HomeFeatureCard({entry, index}: {entry: ContentEntry; index: number}) {
  const image = entry.featureImage || entry.image
  const theme = themeForEntry(entry)
  return (
    <Tile
      title={entry.title}
      label={entry.organization}
      heading="h2"
      href={entry.href}
      className={`home-feature content-card--${index % 6}`}
      style={themeStyle(theme, image)}
      media={
        <div
          className="tile__media content-card__image"
          data-treatment={isCutout(image) ? 'cutout' : undefined}
          style={
            !image && entry.featureBackground
              ? {backgroundColor: entry.featureBackground}
              : undefined
          }
        >
          <ParkImage
            editorial
            orgTheme={theme}
            image={image}
            sizes={
              isCutout(image)
                ? '(max-width: 44rem) 52vw, (max-width: 64rem) 35vw, 22rem'
                : '(max-width: 44rem) 27vw, (max-width: 64rem) 18vw, 11.5rem'
            }
          />
        </div>
      }
      caption={
        entry.featureCaption ? (
          <span className="dot-link">
            <DotLinkContent>{entry.featureCaption}</DotLinkContent>
          </span>
        ) : (
          entry.type === 'event' && <EntryDate entry={entry} />
        )
      }
    />
  )
}
