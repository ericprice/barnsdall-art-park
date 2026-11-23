import Link from 'next/link'
import type {ContentEntry, ImageSource, PageSection, SiteContent} from '@/lib/content'
import {ParkImage} from './park-image'
import {ActionLinks, DisplayLink} from './action-links'
import {QuoteBand} from './quote-band'
import {StoryGallery} from './story-gallery'
import {RichText} from './rich-text'
import {PageSections} from './page-sections'
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
function Block({section}: {section: PageSection}) {
  return (
    <>
      <h2>{section.title}</h2>
      <RichText value={section.body} />
      <ActionLinks links={section.links} downloadPdf />
    </>
  )
}
export function VisitPage({entry, site}: Props) {
  const policies = entry.href === '/visit/policies'
  const map = entry.sections?.find((section) => section.anchor === 'map')
  return (
    <main id="main-content" className={'visitor-arrival' + (policies ? ' visitor-policies' : '')}>
      <PageHeading title={entry.title} path={entry.href} settings={site.settings} />
      {entry.summary && <p className={policies ? 'visitor-summary' : 'visitor-summary lead'}>{entry.summary}</p>}
      {!policies && (
        <>
          <LegacyPoliciesLink />
          {(entry.image || map) && (
            <div id="map" className="visitor-map">
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
          ?.filter((section) => section.anchor !== 'map')
          .map((section) => (
            <section key={section._key} id={section.anchor}>
              <Block section={section} />
            </section>
          ))}
      </div>
      <QuoteBand quote={site.home.quote} />
    </main>
  )
}

export function ParkLandscape({entry, site}: Props) {
  const page = entry.parkPage
  const photos = page?.photos?.length ? page.photos : entry.image ? [entry.image] : []
  const links = page?.links?.filter((link) => link.href && link.label)
  return (
    <main id="main-content" className="visitor-wire park-landscape">
      <header className="page-heading">
        <h1>{entry.title}</h1>
        {page?.subtitle && <p className="park-landscape__subtitle">{page.subtitle}</p>}
      </header>
      <StoryGallery images={photos} text={interfaceText} showCaption chevrons />
      <div className="park-landscape__columns">
        {!!links?.length && (
          <nav className="park-landscape__links" aria-label={entry.title}>
            {links.map((link) => (
              <DisplayLink key={link._key} href={link.href!}>
                {link.label}
              </DisplayLink>
            ))}
          </nav>
        )}
        <div className="park-landscape__body">
          {page?.quotation?.text && (
            <blockquote className="park-landscape__quotation lead">
              <p>“{page.quotation.text}”</p>
              {page.quotation.attribution && <footer>{page.quotation.attribution}</footer>}
            </blockquote>
          )}
          <RichText value={entry.body} />
          {entry.sections?.map((section) => (
            <section id={section.anchor} key={section._key}>
              <Block section={section} />
              {section.image && <Photo image={section.image} showCaption />}
            </section>
          ))}
        </div>
      </div>
      <QuoteBand quote={site.home.quote} />
    </main>
  )
}

export function RentalsPage({entry}: Pick<Props, 'entry'>) {
  const [inquiries, ...venues] = entry.sections ?? []
  return (
    <main id="main-content" className="visitor-wire rentals-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="rentals-page__inquiries">
        <Photo image={entry.image} priority />
        {inquiries && (
          <section id={inquiries.anchor}>
            <Block section={inquiries} />
          </section>
        )}
      </div>
      <div className="rentals-page__venues">
        {venues.map((section) => (
          <section key={section._key} id={section.anchor}>
            <Block section={section} />
          </section>
        ))}
      </div>
    </main>
  )
}

export function CentennialPage({entry}: Pick<Props, 'entry'>) {
  const [campaign, ...more] = entry.sections ?? []
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
  const signup =
    entry.sections?.find((section) => section.anchor === 'subscribe') ?? entry.sections?.at(-1)
  return (
    <main id="main-content" className="visitor-wire contact-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="contact-page__columns">
        {entry.sections?.map((section) => (
          <section key={section._key} id={section.anchor}>
            <Block section={section} />
            {section === signup && <ContactSignup />}
          </section>
        ))}
      </div>
    </main>
  )
}

export function OliveGrovePage({entry}: Pick<Props, 'entry'>) {
  const [plan, past, news, ...more] = entry.sections ?? []
  return (
    <main id="main-content" className="visitor-wire olive-restoration">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="rentals-page__inquiries">
        <Photo image={entry.image} priority showCaption />
        {plan && (
          <section id={plan.anchor}>
            <Block section={plan} />
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
          <Block section={news} />
        </section>
      )}
      <PageSections sections={more} />
    </main>
  )
}
