import {ActionLinks} from './action-links'
import Link from 'next/link'
import type {PageSection} from '@/lib/content'
import {RichText} from './rich-text'
import {ParkImage} from './park-image'

export function PageSections({sections}: {sections?: PageSection[]}) {
  return sections?.map((section) => (
    <section
      className={`page-section ${(section.entries?.length && !section.collapsible) || section.anchor === 'partners' ? 'page-section--wide' : ''}`}
      id={section.anchor}
      key={section._key}
    >
      <h2>{section.title}</h2>
      <RichText value={section.body} />
      {section.image && (
        <div
          className={`section-image ${section.anchor === 'partners' ? 'section-image--partners' : ''}`}
        >
          <ParkImage image={section.image} sizes="(max-width: 44rem) 90vw, 60vw" />
        </div>
      )}
      {section.entries?.length ? (
        section.collapsible ? (
          <div className="accordion">
            {section.entries.map((entry) => (
              <details key={entry._key}>
                <summary>
                  {entry.title}
                  <span aria-hidden="true" />
                </summary>
                <div>
                  <RichText value={entry.body} />
                  {entry.links.map((link) => (
                    <Link className="text-link" key={link._key} href={link.href}>
                      {link.label} <span aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="section-columns">
            {section.entries.map((entry) => (
              <div key={entry._key}>
                <h3>{entry.title}</h3>
                <RichText value={entry.body} />
                {entry.links.map((link) => (
                  <Link key={link._key} href={link.href}>
                    {link.label} <span aria-hidden="true">»</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )
      ) : null}
      <ActionLinks links={section.links} />
    </section>
  ))
}
