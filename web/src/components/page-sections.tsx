import {ActionLinks} from './action-links'
import Link from './route-link'
import type {PageSection} from '@/lib/content'
import {RichText} from './rich-text'
import {PhotoFigure} from './photo-figure'

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
      {!!section.entries?.length && (
        <div className={section.collapsible ? 'accordion' : 'section-items'}>
          {section.entries.map((entry) => {
            const content = (
              <>
                <RichText value={entry.body} />
                {entry.links.map((link) => (
                  <Link
                    key={link._key}
                    href={link.href}
                    download={link.download || undefined}
                    className={section.collapsible ? 'text-link' : undefined}
                  >
                    {link.label} <span aria-hidden="true">{section.collapsible ? '↗' : '»'}</span>
                  </Link>
                ))}
              </>
            )
            return section.collapsible ? (
              <details key={entry._key}>
                <summary>
                  {entry.title}
                  <span aria-hidden="true" />
                </summary>
                <div>{content}</div>
              </details>
            ) : (
              <div key={entry._key}>
                <h3>{entry.title}</h3>
                {content}
              </div>
            )
          })}
        </div>
      )}
      <ActionLinks links={section.links} downloadPdf={downloadPdf} />
      <PhotoFigure
        className="section-figure"
        frameClassName="section-image"
        image={section.image}
        sizes="(max-width: 44rem) 90vw, (max-width: 64rem) 49vw, 31rem"
      />
    </>
  )
}
