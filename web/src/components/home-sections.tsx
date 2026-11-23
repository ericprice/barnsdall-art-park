import {drawDots} from '@/lib/identity-dots'
import type {CSSProperties} from 'react'
import {QuoteBand} from './quote-band'
import Link from 'next/link'
import type {SiteContent} from '@/lib/content'
import {HomeFeatureCard} from './content-card'
import {ExplorePark} from './explore-park'

export function HomeSections({
  home,
  labels,
}: {
  home: SiteContent['home']
  labels: SiteContent['settings']['interfaceText']
}) {
  const dots = drawDots(home.timeline.length)
  return (
    <>
      <ExplorePark places={home.places} title={labels.explore} />
      {home.features.length > 0 && (
        <section className="feature-grid" aria-label="Around the park">
          {home.features.map((entry, i) => (
            <HomeFeatureCard key={entry.id} entry={entry} index={i} />
          ))}
        </section>
      )}
      <QuoteBand quote={home.quote} />
      {home.timeline.length > 0 && (
        <section className="history" aria-labelledby="history-heading">
          <div className="section-heading">
            <h2 id="history-heading">{labels.history}</h2>
            {home.historyLink?.href && (
              <Link className="display-link" href={home.historyLink.href}>
                {home.historyLink.label} <span aria-hidden="true">»</span>
              </Link>
            )}
          </div>
          <ol>
            {home.timeline.map((item, index) => (
              <li key={item.id}>
                <h3>
                  <span
                    className="seed-dot"
                    style={
                      {'--olive-dot': `url('/identity/dots/${dots[index]}.svg')`} as CSSProperties
                    }
                    aria-hidden="true"
                  />
                  {item.year}
                </h3>
                <p>{item.summary}</p>
                {item.link?.href && (
                  <Link className="display-link" href={item.link.href}>
                    {item.link.label} <span aria-hidden="true">»</span>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
