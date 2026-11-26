import '../styles/_history-timeline.scss'
import type {ContentEntry} from '@/lib/content'
import {EditorialPage} from './editorial-page'
import {PageSections} from './page-sections'
import {PhotoFigure} from './photo-figure'
import {DotLink} from './action-links'

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
                <PhotoFigure
                  image={milestone.image}
                  frameClassName="timeline-chronology__photo"
                  sizes="(max-width: 44rem) 78vw, (max-width: 64rem) 66vw, 42rem"
                />
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
