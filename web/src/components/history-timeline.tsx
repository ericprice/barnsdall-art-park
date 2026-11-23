import type {ContentEntry, ImageSource} from '@/lib/content'
import {PageSections} from './page-sections'
import {ParkImage} from './park-image'
import {RichText} from './rich-text'

function TimelinePhoto({image, wide = false}: {image: ImageSource; wide?: boolean}) {
  if (!image || (typeof image !== 'string' && !image.asset)) return null
  const caption = typeof image === 'string' ? undefined : image.caption
  return (
    <figure>
      <div className="timeline-photo">
        <ParkImage
          image={image}
          priority={wide}
          sizes={wide ? '(max-width: 44rem) 95vw, 58vw' : '(max-width: 44rem) 25vw, 15vw'}
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function HistoryTimeline({entry}: {entry: ContentEntry}) {
  return (
    <main id="main-content" className="timeline-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="timeline-lead">{entry.summary}</p>}
      {Boolean(entry.image || entry.sections?.length || entry.body?.length) && (
        <div className="timeline-intro">
          <TimelinePhoto image={entry.image} wide />
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
                <TimelinePhoto image={milestone.image} />
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
