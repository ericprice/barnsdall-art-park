import {themeForEntry} from '@/lib/image-theme'
import {QuoteBand} from '@/components/quote-band'
import {SupportSubpage} from '@/components/support-subpage'
import {FoundationDirectory} from '@/components/foundation-directory'
import {foundationHeadings} from '../../../../shared/foundation'
import {interfaceText} from '../../../../shared/interface'
import type {Metadata} from 'next'
import {notFound, redirect} from 'next/navigation'
import {getEntry, getSite} from '@/lib/content'
import {
  VisitPage,
  ParkLandscape,
  RentalsPage,
  CentennialPage,
  ContactPage,
  OliveGrovePage,
} from '@/components/visitor-pages'
import {EventsBrowser, type ListingParams} from '@/components/events-browser'
import {ListingStory} from '@/components/listing-story'
import {NewsListing} from '@/components/news-listing'
import {PageSections} from '@/components/page-sections'
import {DisplayLink} from '@/components/action-links'
import {PageHeading} from '@/components/page-heading'
import {HistoryTimeline} from '@/components/history-timeline'
import {ParkImage} from '@/components/park-image'
import {RichText} from '@/components/rich-text'
import {imageBuilder} from '@/sanity/image'

type Props = {params: Promise<{slug: string[]}>; searchParams: Promise<ListingParams>}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {slug} = await params
  const path = `/${slug.join('/')}`
  const site = await getSite()
  const listingTitle =
    path === '/whats-on' ? interfaceText.whatsOn : path === '/news' ? interfaceText.news : undefined
  const entry = listingTitle ? undefined : await getEntry(path)
  return {
    title: listingTitle || entry?.title || interfaceText.notFound,
    description: entry?.summary || entry?.subtitle || site.settings.description,
    ...(entry?.image && typeof entry.image !== 'string' && entry.image.asset
      ? {
          openGraph: {
            images: [imageBuilder.image(entry.image).width(1200).height(630).fit('crop').url()],
          },
        }
      : {}),
  }
}

export default async function ContentPage({params, searchParams}: Props) {
  const {slug} = await params
  const path = `/${slug.join('/')}`
  const site = await getSite()
  if (path === '/whats-on')
    return (
      <EventsBrowser
        text={interfaceText}
        events={site.events}
        params={await searchParams}
        quote={site.settings.quotes}
      />
    )
  if (path === '/news')
    return (
      <NewsListing
        text={interfaceText}
        articles={site.articles}
        params={await searchParams}
        quote={site.settings.quotes}
      />
    )
  const entry = await getEntry(path)
  if (!entry) notFound()
  const external = /^https?:\/\//.test(entry.href)
  if (path.startsWith('/park/') && !external) return <ParkLandscape entry={entry} site={site} />
  if (entry.template === 'rentals') return <RentalsPage entry={entry} />
  if (entry.template === 'contact') return <ContactPage entry={entry} />
  if (entry.template === 'restoration') return <OliveGrovePage entry={entry} />
  if (entry.template === 'centennial') return <CentennialPage entry={entry} />
  if (entry.template === 'visit' || entry.template === 'policies')
    return <VisitPage entry={entry} site={site} />
  if (entry.template === 'timeline') return <HistoryTimeline entry={entry} />
  if (external || (path.startsWith('/news/') && entry.href !== path)) redirect(entry.href)
  if (path.startsWith('/whats-on/') || path.startsWith('/news/'))
    return <ListingStory entry={entry} site={site} event={path.startsWith('/whats-on/')} />
  if (['initiatives', 'supporters', 'donate'].includes(entry.template || ''))
    return <SupportSubpage entry={entry} site={site} path={path} />
  const foundation = entry.template === 'foundation'
  return (
    <main
      id="main-content"
      className={`interior detail-page ${foundation ? 'foundation-page' : ''}`}
    >
      <article>
        <PageHeading
          title={path.startsWith('/support/') ? interfaceText.support : entry.title}
          path={path}
          settings={site.settings}
        />
        {entry.template === 'initiative' && path.startsWith('/support/') && (
          <h2 className="mission-heading">{entry.title}</h2>
        )}
        {foundation && <h2 className="mission-heading">{foundationHeadings.mission}</h2>}
        {entry.summary && <p className="interior__intro lead">{entry.summary}</p>}
        {entry.image && (
          <figure className="interior-figure">
            <div
              className={`interior__image ${entry.template === 'initiative' ? 'interior__image--organic' : ''}`}
            >
              <ParkImage
                image={entry.image}
                orgTheme={entry.template === 'initiative' ? themeForEntry(entry) : undefined}
                priority
                sizes="(max-width: 44rem) 95vw, 66vw"
              />
            </div>
            {typeof entry.image !== 'string' && entry.image.caption && (
              <figcaption>{entry.image.caption}</figcaption>
            )}
          </figure>
        )}
        <div className="interior__body">
          <RichText value={entry.body} />
          {entry.link?.href && (
            <p className="entry-action">
              <DisplayLink href={entry.link.href} arrow="↗">
                {entry.link.label}
              </DisplayLink>
            </p>
          )}
        </div>
        <PageSections sections={entry.sections} />
        {foundation && <FoundationDirectory entry={entry} />}
      </article>
      <QuoteBand quote={site.settings.quotes} />
    </main>
  )
}
