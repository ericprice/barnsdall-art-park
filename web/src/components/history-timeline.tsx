import Link from 'next/link'
import type {ContentEntry, ImageSource, SiteContent} from '@/lib/content'
import {PageSections} from './page-sections'
import {ParkImage} from './park-image'
import {RichText} from './rich-text'

function TimelinePhoto({
  image,
  alt,
  wide = false,
}: {
  image: ImageSource
  alt?: string
  wide?: boolean
}) {
  if (!image || (typeof image !== 'string' && !image.asset)) return null
  const metadata = typeof image === 'object' ? image : undefined
  const caption = [metadata?.caption, metadata?.credit].filter(Boolean).join(' ')
  return (
    <figure>
      <div className="timeline-photo">
        <ParkImage
          image={image}
          alt={alt ?? metadata?.alt}
          priority={wide}
          sizes={wide ? '(max-width: 44rem) 95vw, 58vw' : '(max-width: 44rem) 25vw, 15vw'}
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function HistoryTimeline({
  entry,
  settings,
}: {
  entry: ContentEntry
  settings: SiteContent['settings']
}) {
  return (
    <main id="main-content" className="timeline-page">
      <nav className="timeline-crumbs" aria-label="Breadcrumb">
        <Link href="/">{settings.interfaceText.home}</Link> /{' '}
        <Link href="/park">{settings.navigation.find((item) => item.href === '/park')?.title}</Link>
      </nav>
      <h1>{entry.title}</h1>
      {entry.summary && <p className="timeline-lead">{entry.summary}</p>}
      {Boolean(entry.image || entry.sections?.length || entry.body?.length) && (
        <div className="timeline-intro">
          <TimelinePhoto image={entry.image} alt={entry.imageAlt} wide />
          <div>
            <RichText value={entry.body} />
            <PageSections sections={entry.sections} />
          </div>
        </div>
      )}
      {entry.timelineEntries?.length ? (
        <section className="timeline-chronology" aria-labelledby="chronology-title">
          <h2 id="chronology-title">{entry.timelineHeading ?? entry.title}</h2>
          <ol>
            {entry.timelineEntries.map((milestone) => (
              <li key={milestone._key} id={`milestone-${milestone._key}`}>
                <TimelinePhoto image={milestone.image} alt={milestone.imageAlt} />
                <h3>{milestone.dateLabel}</h3>
                <p>{milestone.description}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  )
}
