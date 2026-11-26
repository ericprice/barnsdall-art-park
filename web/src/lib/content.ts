import {contentRoute} from '../../../shared/routes'
import {historyPageId} from '../../../shared/page-layouts'
import {footerFromPlainText} from '../../../shared/footer-text'
import {contentDestination, contentPath, resolveInternalLinks} from './internal-links'
import {pageSections, type PageSection} from './body-layout'
export type {PageSection} from './body-layout'
import {
  organizationDocuments,
  publicOrganizationId,
  organizationTheme,
  type OrganizationTheme,
} from '../../../shared/organizations'
export type {InterfaceText} from '../../../shared/interface'
import 'server-only'
import {cache} from 'react'
import {readContent} from '@/sanity/read'
import {
  CONTENT_QUERY,
  SHELL_QUERY,
  HOME_QUERY,
  EVENTS_QUERY,
  DESTINATIONS_QUERY,
} from '@/sanity/queries'
import type {
  CONTENT_QUERY_RESULT,
  SHELL_QUERY_RESULT,
  HOME_QUERY_RESULT,
  NEWS_CARDS_QUERY_RESULT,
  EVENTS_QUERY_RESULT,
  ParkImage,
  EditorialImage,
  RichText,
  Page,
  Place,
} from '../../sanity.types'

export type ImageSource = ParkImage | EditorialImage | string | null | undefined
export type TimelineEntry = Omit<NonNullable<Page['timelineEntries']>[number], 'image'> & {
  image?: ImageSource
}
export type Partner = Omit<NonNullable<Page['partners']>[number], 'logo'> & {logo?: ImageSource}
export type ContentEntry = {
  type: DocumentEntry['_type']
  id: string
  title: string
  href: string
  summary?: string | null
  image?: ImageSource
  body?: RichText
  date?: string | null
  featureBackground?: string | null
  featureImage?: ImageSource
  featureCaption?: string | null
  orgTheme?: OrganizationTheme
  organization?: string | null
  repeatsUntil?: string | null
  allDay?: boolean | null
  gallery?: (ParkImage & {_key: string})[]
  endsAt?: string | null
  link?: {label?: string; href?: string} | null
  subtitle?: string
  sidebarLinks?: Place['sidebarLinks']
  template?: Page['template']
  excludedFromNews?: boolean
  relatedStories?: ContentEntry[]
  sections?: PageSection[]
  boardMembers?: Page['boardMembers']
  staffMembers?: Page['staffMembers']
  partners?: Partner[]
  timelineHeading?: string
  timelineEntries?: TimelineEntry[]
  supportLink?: Page['supportLink']
  supporterYears?: Page['supporterYears']
  completedHeading?: Page['completedHeading']
  initiativeCards?: Extract<NonNullable<CONTENT_QUERY_RESULT>, {_type: 'page'}>['initiativeCards']
  donationSections?: Page['donationSections']
}
export type NavItem = {
  title: string
  href?: string
  children?: {label: string; href: string}[]
}
export type SiteSettings = {
  footerLinks?: {label?: string; href?: string; _key?: string}[]
  title: string
  description: string
  eventsSubtitle?: string
  newsSubtitle?: string
  footer: NonNullable<NonNullable<SHELL_QUERY_RESULT['settings']>['footer']>
  navigation: NavItem[]
  legalLinks: {id: string; label: string; href: string}[]
  quotes: NonNullable<SHELL_QUERY_RESULT['settings']>['quotes']
  socialLinks?: {label?: string; href?: string; _key: string}[]
}

export type HomeContent = {
  historyLink?: {label?: string; href?: string}
  slides: {
    orgTheme?: OrganizationTheme
    id: string
    title: string
    summary?: string
    image?: ImageSource
    link?: {label?: string; href?: string}
  }[]
  celebration?: {title?: string; link?: {label?: string; href?: string}} | null
  timeline: {
    id: string
    year?: string
    summary?: string
    link?: {label?: string; href?: string}
  }[]
  features: ContentEntry[]
  places: ContentEntry[]
}

const withLinks = <T>(data: T) =>
  resolveInternalLinks(data, (ids) => readContent(DESTINATIONS_QUERY, {ids}))

type DocumentEntry =
  | NonNullable<CONTENT_QUERY_RESULT>
  | NonNullable<NonNullable<NonNullable<HOME_QUERY_RESULT['home']>['features']>[number]['entry']>
  | NonNullable<
      NonNullable<NonNullable<HOME_QUERY_RESULT['home']>['exploreLocations']>[number]['location']
    >
  | EVENTS_QUERY_RESULT[number]
  | NEWS_CARDS_QUERY_RESULT[number]
export function toContentEntry(doc: DocumentEntry): ContentEntry {
  const owner = doc.organizationRef?._ref
  const theme = organizationTheme(doc.orgTheme, owner)
  return {
    id: doc._id,
    type: doc._type,
    title: doc.title || 'Untitled',
    href: contentDestination(doc) ?? '',
    summary: 'summary' in doc ? doc.summary : undefined,
    image: 'image' in doc ? doc.image : undefined,
    body: 'body' in doc ? doc.body : undefined,
    sections: 'contentSections' in doc ? pageSections(doc.contentSections) : undefined,
    date:
      doc._type === 'event' && 'startsAt' in doc
        ? doc.startsAt
        : 'publishedAt' in doc
          ? doc.publishedAt
          : null,
    orgTheme: theme,
    organization: owner || doc.orgTheme ? theme.title : undefined,
    repeatsUntil: 'repeatsUntil' in doc ? doc.repeatsUntil : null,
    allDay: 'allDay' in doc ? doc.allDay : null,
    gallery: 'gallery' in doc ? doc.gallery : undefined,
    endsAt: 'endsAt' in doc ? doc.endsAt : null,
    link: 'sourceLink' in doc ? doc.sourceLink : 'ticketLink' in doc ? doc.ticketLink : null,
    subtitle: 'subtitle' in doc ? doc.subtitle || undefined : undefined,
    sidebarLinks: 'sidebarLinks' in doc ? doc.sidebarLinks : undefined,
    template: 'template' in doc ? doc.template || undefined : undefined,
    excludedFromNews: 'excludeFromNews' in doc ? doc.excludeFromNews : undefined,
    relatedStories:
      'relatedCards' in doc
        ? (doc.relatedCards ?? []).flatMap((story) =>
            story && story._id !== doc._id && contentDestination(story)
              ? [toContentEntry(story)]
              : [],
          )
        : undefined,
    boardMembers: 'boardMembers' in doc ? doc.boardMembers : undefined,
    staffMembers: 'staffMembers' in doc ? doc.staffMembers : undefined,
    partners: 'partners' in doc ? doc.partners : undefined,
    timelineHeading: 'timelineHeading' in doc ? doc.timelineHeading : undefined,
    timelineEntries: 'timelineEntries' in doc ? doc.timelineEntries : undefined,
    supportLink: 'supportLink' in doc ? doc.supportLink : undefined,
    supporterYears: 'supporterYears' in doc ? doc.supporterYears : undefined,
    completedHeading: 'completedHeading' in doc ? doc.completedHeading : undefined,
    initiativeCards: 'initiativeCards' in doc ? doc.initiativeCards : undefined,
    donationSections: 'donationSections' in doc ? doc.donationSections : undefined,
  }
}

function settingsFor(s: SHELL_QUERY_RESULT['settings']): SiteSettings {
  return {
    footerLinks: s?.footerLinks ?? undefined,
    title: s?.title || 'Barnsdall Art Park Foundation',
    description: s?.description || '',
    eventsSubtitle: s?.eventsSubtitle ?? undefined,
    newsSubtitle: s?.newsSubtitle ?? undefined,
    footer: s?.footer ?? footerFromPlainText(s ?? {}),
    quotes: s?.quotes ?? [],
    legalLinks: (s?.legalPages ?? []).flatMap((page) =>
      page?.slug && page.title
        ? [{id: page._id, label: page.title, href: contentPath('page', page.slug)}]
        : [],
    ),
    socialLinks: s?.socialLinks ?? [],
    navigation: s?.navigation?.length
      ? s.navigation.map((n) => ({
          title: n.title || '',
          href: n.href,
          children: n.children
            ?.filter((l) => l.label && l.href)
            .map((l) => ({label: l.label!, href: l.href!})),
        }))
      : [],
  }
}

export const getShell = cache(async () => {
  const data = await withLinks(await readContent(SHELL_QUERY))
  const colors = new Map<string, SHELL_QUERY_RESULT['organizationColors'][number]>()
  for (const row of data.organizationColors) {
    const id = publicOrganizationId(row._id)!
    if (row._id === id || !colors.has(id)) colors.set(id, {...row, _id: id})
  }
  // Anonymous published readers cannot see the old dotted organization IDs.
  const organizationColors = colors.size ? [...colors.values()] : organizationDocuments
  return {
    settings: settingsFor(data.settings),
    organizationColors,
    homeSubtitle: data.homeSubtitle ?? undefined,
  }
})

export const getHome = cache(async (): Promise<HomeContent> => {
  const data = await withLinks(await readContent(HOME_QUERY, {historyId: historyPageId}))
  return {
    historyLink: data.home?.historyLink || undefined,
    slides:
      data.home?.heroSlides?.map((s) => ({
        id: s._key,
        orgTheme: organizationTheme(s.orgTheme, s.organizationRef?._ref),
        title: s.title || '',
        summary: s.summary ?? undefined,
        image: s.image,
        link: s.link ?? undefined,
      })) || [],
    celebration: data.home?.celebration,
    timeline:
      data.milestones?.map((t) => ({
        id: t._key,
        year: t.year ?? undefined,
        summary: t.summary ?? undefined,
        link: t.link ?? undefined,
      })) || [],
    features: (data.home?.features || []).flatMap(({entry, image, background, caption}) =>
      entry && contentDestination(entry)
        ? [
            {
              ...toContentEntry(entry),
              featureImage: image,
              featureBackground: background,
              featureCaption: caption,
            },
          ]
        : [],
    ),
    places: (data.home?.exploreLocations || []).flatMap(({location, image}) =>
      location && contentDestination(location) ? [{...toContentEntry(location), image}] : [],
    ),
  }
})

function useCaptionsAsAlt(value: unknown) {
  if (!value || typeof value !== 'object') return
  if (
    '_type' in value &&
    (value._type === 'parkImage' || value._type === 'editorialImage') &&
    'caption' in value &&
    typeof value.caption === 'string' &&
    value.caption.trim()
  ) {
    const image = value as ParkImage
    image.alt = value.caption
  }
  Object.values(value).forEach(useCaptionsAsAlt)
}

export const getEntry = cache(async (path: string): Promise<ContentEntry | undefined> => {
  const {type, slug} = contentRoute(path)
  const data = await readContent(CONTENT_QUERY, {type, slug})
  if (!data && path === '/history')
    return (await getEntry('/timeline')) ?? getEntry('/grove-history')
  if (!data || !contentDestination(data)) return
  const entry = await withLinks(data)
  if (entry._type !== 'page' || entry.template !== 'timeline') return toContentEntry(entry)
  const timeline = structuredClone(entry)
  useCaptionsAsAlt(timeline)
  return toContentEntry(timeline)
})

export const getEvents = cache(async () => {
  const events = await readContent(EVENTS_QUERY)
  // A scheduled event can still supply useful dates when its partner URL is unavailable.
  return events.map(toContentEntry)
})
