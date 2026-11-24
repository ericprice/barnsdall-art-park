import Link from './route-link'
import type {ContentEntry, ImageSource, SiteContent} from '@/lib/content'
import {ParkImage} from './park-image'
import {ActionLinks, SidebarLinks} from './action-links'
import {QuoteBand} from './quote-band'
import {StoryGallery} from './story-gallery'
import {RichText} from './rich-text'
import {PageSections, SectionContent} from './page-sections'
import {PageHeading} from './page-heading'
import {ContactSignup, LegacyPoliciesLink} from './visitor-forms'
import {interfaceText} from '../../../shared/interface'
import './visitor-pages.scss'

type Props = {entry: ContentEntry; site: SiteContent}
function Photo({
  image,
  orgTheme,
  priority = false,
  showCaption = false,
}: {
  image?: ImageSource
  orgTheme?: ContentEntry['orgTheme']
  priority?: boolean
  showCaption?: boolean
}) {
  if (!image) return null
  return (
    <figure>
      <div className="visitor-photo">
        <ParkImage
          image={image}
          orgTheme={orgTheme}
          priority={priority}
          sizes="(max-width: 44rem) 95vw, 55vw"
        />
      </div>
      {showCaption && typeof image !== 'string' && image.caption && (
        <figcaption>{image.caption}</figcaption>
      )}
    </figure>
  )
}
export function VisitPage({entry, site}: Props) {
  const policies = entry.template === 'policies'
  const map = entry.sections?.find((section) => section.role === 'map')
  return (
    <main id="main-content" className={'visitor-arrival' + (policies ? ' visitor-policies' : '')}>
      <PageHeading title={entry.title} path={entry.href} settings={site.settings} />
      {entry.summary && (
        <p className={policies ? 'visitor-summary' : 'visitor-summary lead'}>{entry.summary}</p>
      )}
      {!policies && (
        <>
          <LegacyPoliciesLink />
          {(entry.image || map) && (
            <div id={map?.anchor || 'map'} className="visitor-map">
              <Photo image={entry.image} priority />
              <RichText value={map?.body} />
              <ActionLinks links={map?.links} variant="display" downloadPdf />
            </div>
          )}
        </>
      )}
      <div className="visitor-prose">
        <RichText value={entry.body} />
        {entry.sections
          ?.filter((section) => section.role !== 'map')
          .map((section) => (
            <section key={section._key} id={section.anchor}>
              <SectionContent downloadPdf section={section} />
            </section>
          ))}
      </div>
      <QuoteBand quote={site.settings.quotes} />
    </main>
  )
}

export function ParkLandscape({entry, site}: Props) {
  return (
    <main id="main-content" className="visitor-wire park-landscape">
      <header className="page-heading">
        <h1>{entry.title}</h1>
        {entry.subtitle && <p className="park-landscape__subtitle">{entry.subtitle}</p>}
      </header>
      <StoryGallery images={entry.gallery ?? []} text={interfaceText} showCaption />
      <div className="park-landscape__columns">
        <SidebarLinks
          links={entry.sidebarLinks}
          label={entry.title}
          className="park-landscape__links"
        />
        <div className="park-landscape__body">
          <RichText value={entry.body} />
          {entry.sections?.map((section) => (
            <section id={section.anchor} key={section._key}>
              <SectionContent downloadPdf section={{...section, image: undefined}} />
              {section.image && <Photo image={section.image} showCaption />}
            </section>
          ))}
        </div>
      </div>
      <QuoteBand quote={site.settings.quotes} />
    </main>
  )
}

export function RentalsPage({entry}: Pick<Props, 'entry'>) {
  const inquiries = entry.sections?.find((section) => section.role === 'inquiries')
  const venues = entry.sections?.filter((section) => section !== inquiries) ?? []
  return (
    <main id="main-content" className="visitor-wire rentals-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="rentals-page__inquiries">
        <Photo image={entry.image} priority />
        {inquiries && (
          <section id={inquiries.anchor}>
            <SectionContent downloadPdf section={inquiries} />
          </section>
        )}
      </div>
      <div className="rentals-page__venues">
        {venues.map((section) => (
          <section key={section._key} id={section.anchor}>
            <SectionContent downloadPdf section={section} />
          </section>
        ))}
      </div>
    </main>
  )
}

export function CentennialPage({entry}: Pick<Props, 'entry'>) {
  const campaign = entry.sections?.find((section) => section.role === 'campaign')
  const more = entry.sections?.filter((section) => section !== campaign)
  return (
    <main id="main-content" className="visitor-wire centennial-page">
      {campaign?.title && <p className="visitor-kicker">{campaign.title}</p>}
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <Photo image={entry.image} priority />
      <div className="centennial-copy" id={campaign?.anchor}>
        <RichText value={entry.body} />
        <RichText value={campaign?.body} />
        <ActionLinks links={campaign?.links} downloadPdf />
        <PageSections sections={more} />
      </div>
    </main>
  )
}

export function ContactPage({entry}: Pick<Props, 'entry'>) {
  const signup = entry.sections?.find((section) => section.role === 'signup')
  return (
    <main id="main-content" className="visitor-wire contact-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="contact-page__columns">
        {entry.sections?.map((section) => (
          <section key={section._key} id={section.anchor}>
            <SectionContent downloadPdf section={section} />
            {section === signup && <ContactSignup />}
          </section>
        ))}
      </div>
    </main>
  )
}

export function OliveGrovePage({entry}: Pick<Props, 'entry'>) {
  const plan = entry.sections?.find((s) => s.role === 'plan')
  const past = entry.sections?.find((s) => s.role === 'past')
  const news = entry.sections?.find((s) => s.role === 'news')
  const more = entry.sections?.filter((s) => s !== plan && s !== past && s !== news)
  return (
    <main id="main-content" className="visitor-wire olive-restoration">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="rentals-page__inquiries">
        <Photo image={entry.image} priority showCaption />
        {plan && (
          <section id={plan.anchor}>
            <SectionContent downloadPdf section={plan} />
          </section>
        )}
      </div>
      {past && (
        <details className="olive-restoration__past" id={past.anchor}>
          <summary>
            <h2>{past.title}</h2>
          </summary>
          <RichText value={past.body} />
          <ActionLinks links={past.links} downloadPdf />
          {past.entries?.map((item) => (
            <article key={item._key} id={`past-${item._key}`}>
              <h3>{item.title}</h3>
              <div>
                <RichText value={item.body} />
                {item.links.map((link) => (
                  <Link key={link._key} href={link.href}>
                    {link.label} »
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </details>
      )}
      {news && (
        <section className="olive-restoration__news" id={news.anchor}>
          <SectionContent downloadPdf section={news} />
        </section>
      )}
      <PageSections sections={more} />
    </main>
  )
}
