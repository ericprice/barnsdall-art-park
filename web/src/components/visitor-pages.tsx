import Link from 'next/link'
import type {ContentEntry, ImageSource, PageSection, SiteContent} from '@/lib/content'
import {themeForEntry} from '@/lib/image-theme'
import {ParkImage} from './park-image'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'
import {PageSections} from './page-sections'
import {SectionNavigation} from './section-navigation'
import {ContactSignup, LegacyPoliciesLink} from './visitor-forms'
import './visitor-pages.scss'

type Props = {entry: ContentEntry; site: SiteContent}
function Breadcrumb({site, paths}: {site: SiteContent; paths: string[]}) {
  return (
    <nav aria-label="Breadcrumb" className="visitor-crumb">
      <Link href="/">{site.settings.interfaceText.home}</Link>
      {paths.map((path) => {
        const page = site.pages.find((item) => item.href === path)
        const item = site.settings.navigation.find((item) => item.href === path)
        const footerLink = site.settings.footerLinks?.find((item) => item.href === path)
        const label = item?.title || footerLink?.label || page?.title
        return (
          label && (
            <span key={path}>
              {' '}
              / <Link href={path}>{path === '/100' ? '100' : label}</Link>
            </span>
          )
        )
      })}
    </nav>
  )
}
function Links({links}: {links?: PageSection['links']}) {
  if (!links?.length) return null
  return (
    <ul className="visitor-links">
      {links.map(
        (link) =>
          link.href && (
            <li key={link._key}>
              <Link href={link.href} download={link.href.endsWith('.pdf') || undefined}>
                {link.label}
                <span aria-hidden="true"> »</span>
              </Link>
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

export function ParkDirectory({entry, site}: Props) {
  return (
    <main id="main-content" className="visitor-wire park-directory">
      <Breadcrumb site={site} paths={['/park']} />
      <h1>{entry.title}</h1>
      {entry.summary && <p className="visitor-wire__lead">{entry.summary}</p>}
      <RichText value={entry.body} />
      <RichText value={entry.sections?.[0]?.body} />
      <Links links={entry.sections?.[0]?.links} />
      <PageSections sections={entry.sections?.slice(1)} />
      <div className="park-directory__cards">
        {site.places.map((place) => (
          <article key={place.id}>
            <Link href={place.href}>
              <Photo image={place.image} orgTheme={themeForEntry(place)} />
              <h2>{place.title}</h2>
              {place.summary && <p>{place.summary}</p>}
            </Link>
          </article>
        ))}
      </div>
    </main>
  )
}

export function ParkLandscape({entry, site}: Props) {
  const about = entry.sections?.find((section) => section.anchor === 'about') ?? entry.sections?.[0]
  const sections = entry.sections?.filter((section) => section !== about)
  return (
    <main id="main-content" className="visitor-wire park-landscape">
      <Breadcrumb site={site} paths={['/park']} />
      <h1>{entry.title}</h1>
      <RichText value={entry.body} />
      {about && (
        <section className="park-overview" id={about.anchor}>
          <Block section={about} />
          <Photo image={about.image ?? entry.image} priority />
        </section>
      )}
      {!about && <Photo image={entry.image} priority />}
      <div className="park-landscape__sections">
        {sections?.map((section) => (
          <section
            id={section.anchor}
            className={
              section.anchor === 'archive'
                ? 'park-archive'
                : section.image
                  ? 'park-spread'
                  : 'park-related'
            }
            key={section._key}
          >
            {section.image && <Photo image={section.image} showCaption />}
            <div>
              {section.anchor === 'archive' ? (
                <>
                  <RichText value={section.body} />
                  <Links links={section.links} />
                </>
              ) : (
                <Block section={section} />
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}

export function RentalsPage({entry, site}: Props) {
  const [inquiries, ...venues] = entry.sections ?? []
  return (
    <main id="main-content" className="visitor-wire rentals-page">
      <Breadcrumb site={site} paths={['/visit']} />
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

export function CentennialPage({entry, site}: Props) {
  const [campaign, ...more] = entry.sections ?? []
  return (
    <main id="main-content" className="visitor-wire centennial-page">
      <Breadcrumb site={site} paths={['/100']} />
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
      <Breadcrumb site={site} paths={['/contact']} />
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

export function OliveGrovePage({entry, site}: Props) {
  const [plan, past, news, ...more] = entry.sections ?? []
  return (
    <main id="main-content" className="visitor-wire olive-restoration">
      <Breadcrumb site={site} paths={['/support', '/support/initiatives']} />
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
