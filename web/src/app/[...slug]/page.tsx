import {QuoteBand} from '@/components/quote-band'
import {SupportSubpage} from '@/components/support-subpage'
import {EditorialPage} from '@/components/editorial-page'
import {FoundationDirectory} from '@/components/foundation-directory'
import {foundationHeadings} from '../../../../shared/foundation'
import {interfaceText} from '../../../../shared/interface'
import type {Metadata} from 'next'
import {notFound, redirect} from 'next/navigation'
import {getEntry, getSite} from '@/lib/content'
import {VisitPage, CentennialPage, ContactPage} from '@/components/visitor-pages'
import {EventsBrowser, type ListingParams} from '@/components/events-browser'
import {ListingStory} from '@/components/listing-story'
import {NewsListing} from '@/components/news-listing'
import {PageSections} from '@/components/page-sections'
import {DisplayLink} from '@/components/action-links'
import {HistoryTimeline} from '@/components/history-timeline'
import {imageBuilder} from '@/sanity/image'
import {bodyLeadText} from '@/lib/body-layout'

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
    description:
      entry?.summary || entry?.subtitle || bodyLeadText(entry?.body) || site.settings.description,
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
        subtitle={site.settings.eventsSubtitle}
      />
    )
  if (path === '/news')
    return (
      <NewsListing
        text={interfaceText}
        articles={site.articles}
        params={await searchParams}
        subtitle={site.settings.newsSubtitle}
      />
    )
  const entry = await getEntry(path)
  if (!entry) notFound()
  const external = /^https?:\/\//.test(entry.href)
  if (path.startsWith('/park/') && !external)
    return (
      <EditorialPage entry={entry} afterBody={<QuoteBand />}>
        <PageSections sections={entry.sections} downloadPdf />
      </EditorialPage>
    )
  if (entry.template === 'contact') return <ContactPage entry={entry} />
  if (entry.template === 'rentals' || entry.template === 'restoration')
    return (
      <EditorialPage entry={entry}>
        <PageSections sections={entry.sections} downloadPdf />
      </EditorialPage>
    )
  if (entry.template === 'centennial') return <CentennialPage entry={entry} />
  if (entry.template === 'visit' || entry.template === 'policies')
    return <VisitPage entry={entry} site={site} />
  if (entry.template === 'timeline') return <HistoryTimeline entry={entry} />
  if (external || (path.startsWith('/news/') && entry.href !== path)) redirect(entry.href)
  if (entry.type === 'event' || entry.type === 'article' || entry.template === 'initiative')
    return <ListingStory entry={entry} site={site} />
  if (['initiatives', 'supporters', 'donate'].includes(entry.template || ''))
    return <SupportSubpage entry={entry} site={site} path={path} />
  const foundation = entry.template === 'foundation'
  return (
    <EditorialPage
      entry={entry}
      className={foundation ? 'foundation-page' : undefined}
      introHeading={foundation ? foundationHeadings.mission : undefined}
      title={path.startsWith('/support/') ? interfaceText.support : entry.title}
      navigation={{path, settings: site.settings}}
      afterBody={
        <>
          {foundation && <FoundationDirectory entry={entry} />}
          <QuoteBand />
        </>
      }
    >
      {entry.link?.href && (
        <p className="entry-action">
          <DisplayLink href={entry.link.href} arrow="↗">
            {entry.link.label}
          </DisplayLink>
        </p>
      )}
      <PageSections sections={entry.sections} />
    </EditorialPage>
  )
}
