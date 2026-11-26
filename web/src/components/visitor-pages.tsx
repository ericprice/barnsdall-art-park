import type {ContentEntry, SiteSettings} from '@/lib/content'
import {leadingBodyBlock} from '@/lib/body-layout'
import {ParkImage} from './park-image'
import {ActionLinks} from './action-links'
import {EditorialPage} from './editorial-page'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'
import {PageSections, SectionContent} from './page-sections'
import {PageHeading} from './page-heading'
import {ContactSignup, LegacyPoliciesLink} from './visitor-forms'
import './visitor-pages.scss'

type Props = {entry: ContentEntry; settings: SiteSettings}
export function VisitPage({entry, settings}: Props) {
  const policies = entry.template === 'policies'
  const map = entry.sections?.find((section) => section.role === 'map')
  const lead = policies ? undefined : leadingBodyBlock(entry.body)
  return (
    <main id="main-content" className={'visitor-arrival' + (policies ? ' visitor-policies' : '')}>
      <PageHeading
        title={entry.title}
        subtitle={entry.subtitle}
        navigation={{path: entry.href, settings}}
      />
      {lead && (
        <div className="visitor-prose">
          <RichText value={[lead]} />
        </div>
      )}
      {!policies && (
        <>
          <LegacyPoliciesLink />
          {(entry.image || map) && (
            <div id={map?.anchor || 'map'} className="visitor-map">
              {entry.image && (
                <ParkImage
                  image={entry.image}
                  className="visitor-map__image"
                  intrinsicWidth={800}
                  priority
                  sizes="(max-width: 64rem) 100vw, 64rem"
                />
              )}
              <RichText value={map?.body} />
              <ActionLinks links={map?.links.filter((link) => !link.download)} variant="display" />
            </div>
          )}
        </>
      )}
      <div className="visitor-prose">
        <RichText value={lead ? entry.body?.slice(1) : entry.body} />
        {entry.sections
          ?.filter((section) => section.role !== 'map')
          .map((section) => (
            <section key={section._key} id={section.anchor}>
              <SectionContent downloadPdf section={section} />
            </section>
          ))}
      </div>
      <QuoteBand />
    </main>
  )
}

export function CentennialPage({entry}: Pick<Props, 'entry'>) {
  const campaign = entry.sections?.find((section) => section.role === 'campaign')
  const more = entry.sections?.filter((section) => section !== campaign)
  return (
    <EditorialPage entry={entry} label={campaign?.title}>
      {campaign && (
        <div id={campaign.anchor}>
          <RichText value={campaign.body} />
          <ActionLinks links={campaign.links} downloadPdf />
        </div>
      )}
      <PageSections sections={more} />
    </EditorialPage>
  )
}

export function ContactPage({entry}: Pick<Props, 'entry'>) {
  const signup = entry.sections?.find((section) => section.role === 'signup')
  return (
    <EditorialPage entry={entry}>
      {entry.sections?.map((section) => (
        <section key={section._key} id={section.anchor}>
          <SectionContent downloadPdf section={section} />
          {section === signup && <ContactSignup />}
        </section>
      ))}
    </EditorialPage>
  )
}
