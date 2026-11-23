import Link from 'next/link'
import type {ContentEntry, ImageSource, PageSection, SiteContent} from '@/lib/content'
import {ParkImage} from './park-image'
import {DotLink} from './dot-link'
import {QuoteBand} from './quote-band'
import {StoryGallery} from './story-gallery'
import {RichText} from './rich-text'
import {PageSections} from './page-sections'
import {SectionNavigation} from './section-navigation'
import {ContactSignup, LegacyPoliciesLink} from './visitor-forms'
import './visitor-pages.scss'

type Props = {entry: ContentEntry; site: SiteContent}
function Links({links}: {links?: PageSection['links']}) {
  if (!links?.length) return null
  return (
    <ul className="visitor-links" role="list">
      {links.map(
        (link) =>
          link.href && (
            <li key={link._key}>
              <DotLink href={link.href} download={link.href.endsWith('.pdf') || undefined}>
                {link.label}
              </DotLink>
            </li>
          ),
      )}
    </ul>
  )
}
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
      <Links links={section.links} />
    </>
  )
}
export function VisitPage({entry, site}: Props) {
  const policies = entry.href === '/visit/policies'
  const map = entry.sections?.find((section) => section.anchor === 'map')
  return (
    <main id="main-content" className={'visitor-arrival' + (policies ? ' visitor-policies' : '')}>
      <header className="page-heading">
        <h1>{entry.title}</h1>
        <SectionNavigation path={entry.href} settings={site.settings} />
      </header>
      {entry.summary && <p className="visitor-summary">{entry.summary}</p>}
      {!policies && (
        <>
          <LegacyPoliciesLink />
          {(entry.image || map) && (
            <div id="map" className="visitor-map">
              <Photo image={entry.image} priority />
              <RichText value={map?.body} />
              <Links links={map?.links} />
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
      <StoryGallery images={photos} text={site.settings.interfaceText} showCaption chevrons />
      <div className="park-landscape__columns">
        {!!links?.length && (
          <nav className="park-landscape__links" aria-label={entry.title}>
            {links.map((link) => (
              <Link className="display-link" key={link._key} href={link.href!}>
                {link.label} <span aria-hidden="true">»</span>
              </Link>
            ))}
          </nav>
        )}
        <div className="park-landscape__body">
          {page?.quotation?.text && (
            <blockquote className="park-landscape__quotation">
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
      {entry.summary && <p className="visitor-wire__lead">{entry.summary}</p>}
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
      {entry.summary && <p className="visitor-wire__lead">{entry.summary}</p>}
      <Photo image={entry.image} priority />
      <div className="centennial-copy" id={campaign?.anchor}>
        <RichText value={entry.body} />
        <RichText value={campaign?.body} />
        <Links links={campaign?.links} />
        <PageSections sections={more} />
      </div>
    </main>
  )
}

export function ContactPage({entry, site}: Props) {
  const signup =
    entry.sections?.find((section) => section.anchor === 'subscribe') ?? entry.sections?.at(-1)
  return (
    <main id="main-content" className="visitor-wire contact-page">
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <div className="contact-page__columns">
        {entry.sections?.map((section) => (
          <section key={section._key} id={section.anchor}>
            <Block section={section} />
            {section === signup && <ContactSignup settings={site.settings} />}
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
      {entry.summary && <p className="visitor-wire__lead">{entry.summary}</p>}
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
          <Links links={past.links} />
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
