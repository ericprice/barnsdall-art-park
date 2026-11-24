import {ActionLinks} from './action-links'
import Link from './route-link'
import type {PageSection} from '@/lib/content'
import {RichText} from './rich-text'
import {ParkImage} from './park-image'

export function PageSections({
  sections,
  downloadPdf,
}: {
  sections?: PageSection[]
  downloadPdf?: boolean
}) {
  return sections?.map((section) => (
    <section className="page-section" id={section.anchor} key={section._key}>
      <SectionContent section={section} downloadPdf={downloadPdf} />
    </section>
  ))
}

export function SectionContent({
  section,
  downloadPdf = false,
}: {
  section: PageSection
  downloadPdf?: boolean
}) {
  return (
    <>
      <h2>{section.title}</h2>
      <RichText value={section.body} />
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
          <div className="section-items">
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
      <ActionLinks links={section.links} downloadPdf={downloadPdf} />
      {section.image && (
        <figure className="section-figure">
          <div className="section-image">
            <ParkImage image={section.image} sizes="(max-width: 44rem) 90vw, 49vw" />
          </div>
          {section.image.caption && <figcaption>{section.image.caption}</figcaption>}
        </figure>
      )}
    </>
  )
}
