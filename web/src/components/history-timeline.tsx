import type {ContentEntry, ImageSource} from '@/lib/content'
import {EditorialPage} from './editorial-page'
import {PageSections} from './page-sections'
import {ParkImage} from './park-image'
import {DotLink} from './action-links'

function TimelinePhoto({image}: {image: ImageSource}) {
  if (!image || (typeof image !== 'string' && !image.asset)) return null
  const caption = typeof image === 'string' ? undefined : image.caption
  return (
    <figure>
      <div className="timeline-chronology__photo">
        <ParkImage image={image} sizes="(max-width: 44rem) 78vw, 66vw" />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export function HistoryTimeline({entry}: {entry: ContentEntry}) {
  return (
    <EditorialPage entry={entry}>
      <PageSections sections={entry.sections} />
      {entry.timelineEntries?.length ? (
        <section className="timeline-chronology" aria-labelledby="chronology-title">
          <h2 id="chronology-title">{entry.timelineHeading ?? entry.title}</h2>
          <ol>
            {entry.timelineEntries.map((milestone) => (
              <li key={milestone._key} id={`milestone-${milestone._key}`}>
                <h3>{milestone.dateLabel}</h3>
                <TimelinePhoto image={milestone.image} />
                <p>{milestone.description}</p>
                {milestone.link?.href && milestone.link.label && (
                  <p className="timeline-chronology__link">
                    <DotLink href={milestone.link.href}>{milestone.link.label}</DotLink>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </EditorialPage>
  )
}
