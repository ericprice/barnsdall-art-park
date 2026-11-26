import '../styles/_home.scss'
import {drawDots} from '@/lib/identity-dots'
import type {CSSProperties} from 'react'
import {QuoteBand} from './quote-band'
import type {HomeContent} from '@/lib/content'
import {DisplayLink} from './display-link'
import {HomeFeatureCard} from './content-card'
import {ExplorePark} from './explore-park'
import {interfaceText as labels} from '../../../shared/interface'

export function HomeSections({home}: {home: HomeContent}) {
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
      <QuoteBand />
      {home.timeline.length > 0 && (
        <section className="history" aria-labelledby="history-heading">
          <div className="section-heading">
            <h2 id="history-heading">{labels.history}</h2>
            {home.historyLink?.href && (
              <DisplayLink href={home.historyLink.href}>{home.historyLink.label}</DisplayLink>
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
                  <DisplayLink href={item.link.href} size="body">
                    {item.link.label}
                  </DisplayLink>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  )
}
