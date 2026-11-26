import {QuoteBand} from '@/components/quote-band'
import {SupportSubpage} from '@/components/support-subpage'
import {EditorialPage} from '@/components/editorial-page'
import {FoundationDirectory} from '@/components/foundation-directory'
import {foundationHeadings} from '../../../../shared/foundation'
import {interfaceText} from '../../../../shared/interface'
import type {Metadata} from 'next'
import {notFound, redirect} from 'next/navigation'
import {getEntry, getShell, getEvents} from '@/lib/content'
import {getNewsPage} from '@/lib/news'
import {VisitPage, CentennialPage, ContactPage} from '@/components/visitor-pages'
import {EventsBrowser, type ListingParams} from '@/components/events-browser'
import {ListingStory} from '@/components/listing-story'
import {NewsListing} from '@/components/news-listing'
import {PageSections} from '@/components/page-sections'
import {DisplayLink} from '@/components/action-links'
import {HistoryTimeline} from '@/components/history-timeline'
import {imageBuilder} from '@/sanity/image'
import {publicOrigin} from '@/lib/site-origin'
import {bodyLeadText} from '@/lib/body-layout'

type Props = {params: Promise<{slug: string[]}>; searchParams: Promise<ListingParams>}
export async function generateMetadata({params, searchParams}: Props): Promise<Metadata> {
  const {slug} = await params
  const path = `/${slug.join('/')}`
  const listingTitle =
    path === '/whats-on' ? interfaceText.whatsOn : path === '/news' ? interfaceText.news : undefined
  const [{settings}, entry] = await Promise.all([
    getShell(),
    listingTitle ? undefined : getEntry(path),
  ])
  const canonical =
    publicOrigin && (listingTitle || entry) ? new URL(path, publicOrigin) : undefined
  if (canonical && listingTitle) {
    const filters = await searchParams
    if (path === '/whats-on' && filters.period === 'archive')
      canonical.searchParams.set('period', 'archive')
    if (path === '/news' && filters.page) {
      const {page} = await getNewsPage(filters.page)
      if (page > 1) canonical.searchParams.set('page', String(page))
    }
  }
  return {
    ...(canonical ? {alternates: {canonical}} : {}),
    title: listingTitle || entry?.title || interfaceText.notFound,
    description:
      entry?.summary || entry?.subtitle || bodyLeadText(entry?.body) || settings.description,
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
  if (path === '/whats-on') {
    const [{settings}, events, filters] = await Promise.all([getShell(), getEvents(), searchParams])
    return (
      <EventsBrowser
        text={interfaceText}
        events={events}
        params={filters}
        subtitle={settings.eventsSubtitle}
      />
    )
  }
  if (path === '/news') {
    const [{settings}, listing] = await Promise.all([
      getShell(),
      searchParams.then((filters) => getNewsPage(filters.page)),
    ])
    return <NewsListing text={interfaceText} listing={listing} subtitle={settings.newsSubtitle} />
  }
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
    return <VisitPage entry={entry} settings={(await getShell()).settings} />
  if (entry.template === 'timeline') return <HistoryTimeline entry={entry} />
  if (external || (path.startsWith('/news/') && entry.href !== path)) redirect(entry.href)
  if (entry.type === 'event' || entry.type === 'article' || entry.template === 'initiative')
    return <ListingStory entry={entry} />
  if (['initiatives', 'supporters', 'donate'].includes(entry.template || ''))
    return <SupportSubpage entry={entry} settings={(await getShell()).settings} path={path} />
  const foundation = entry.template === 'foundation'
  return (
    <EditorialPage
      entry={entry}
      className={foundation ? 'foundation-page' : undefined}
      introHeading={foundation ? foundationHeadings.mission : undefined}
      title={path.startsWith('/support/') ? interfaceText.support : entry.title}
      navigation={{path, settings: (await getShell()).settings}}
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
