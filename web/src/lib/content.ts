import {bodyForLayout, type PageSection} from './body-layout'
export type {PageSection} from './body-layout'
import {
  hostsNewsPage,
  isExternalNewsLink,
  organizationTheme,
  type OrganizationTheme,
} from '../../../shared/organizations'
export type {InterfaceText} from '../../../shared/interface'
import 'server-only'
import {cache} from 'react'
import {readContent} from '@/sanity/read'
import {CONTENT_QUERY, SEARCH_QUERY, SITE_QUERY} from '@/sanity/queries'
import type {
  CONTENT_QUERY_RESULT,
  SITE_QUERY_RESULT,
  SEARCH_QUERY_RESULT,
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
  kind?: string | null
  subtitle?: string
  sidebarLinks?: Place['sidebarLinks']
  template?: Page['template']
  relatedStoryIds?: string[]
  sections?: PageSection[]
  foundationHeadings?: Page['foundationHeadings']
  boardMembers?: Page['boardMembers']
  staffMembers?: Page['staffMembers']
  partners?: Partner[]
  timelineHeading?: string
  timelineEntries?: TimelineEntry[]
  supportLink?: Page['supportLink']
  supporterYears?: Page['supporterYears']
  completedHeading?: Page['completedHeading']
  initiativeCards?: Page['initiativeCards']
  donationSections?: Page['donationSections']
  givingLevels?: Page['givingLevels']
}
export type NavItem = {
  title: string
  href?: string
  children?: {label: string; href: string}[]
}
export type SiteContent = {
  settings: {
    footerLinks?: {label?: string; href?: string; _key?: string}[]
    title: string
    description: string
    address: string
    navigation: NavItem[]
    legalLinks: {id: string; label: string; href: string}[]
    contactEmail?: string
    footerText?: string
    landAcknowledgment?: string
    socialLinks?: {label?: string; href?: string; _key: string; icon?: ImageSource}[]
  }
  home: {
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
    quote?: {
      additional?: {
        _key?: string
        _type?: string
        text?: string
        attribution?: string
        link?: {label?: string; href?: string}
      }[]
      text?: string
      attribution?: string
      link?: {label?: string; href?: string}
    } | null
    timeline: {
      id: string
      year?: string
      summary?: string
      link?: {label?: string; href?: string}
    }[]
    features: ContentEntry[]
    places: ContentEntry[]
  }
  events: ContentEntry[]
  articles: ContentEntry[]
}

function hrefFor(type: string, slug?: string) {
  const prefix =
    type === 'place' ? '/park' : type === 'event' ? '/whats-on' : type === 'article' ? '/news' : ''
  return slug ? `${prefix}/${slug}` : '/'
}

type DocumentEntry =
  | NonNullable<CONTENT_QUERY_RESULT>
  | NonNullable<NonNullable<NonNullable<SITE_QUERY_RESULT['home']>['featuredContent']>[number]>
  | NonNullable<NonNullable<NonNullable<SITE_QUERY_RESULT['home']>['exploreLocations']>[number]['location']>
  | SITE_QUERY_RESULT['events'][number]
  | SITE_QUERY_RESULT['articles'][number]
  | SEARCH_QUERY_RESULT[number]
function hasStoryDestination(doc: DocumentEntry) {
  if (doc._type !== 'article') return true
  const organization = 'organizationRef' in doc ? doc.organizationRef?._ref : undefined
  const href = 'storyDestination' in doc ? doc.storyDestination?.href : undefined
  return hostsNewsPage(organization) || isExternalNewsLink(href)
}

function toEntry(doc: DocumentEntry): ContentEntry {
  const owner = doc.orgTheme
  return {
    id: doc._id,
    title: doc.title || 'Untitled',
    href:
      'storyDestination' in doc && doc.storyDestination?.href
        ? doc.storyDestination.href
        : 'externalUrl' in doc && doc.externalUrl
          ? doc.externalUrl
          : hrefFor(doc._type, doc.slug?.current),
    summary: doc.summary,
    image: 'image' in doc ? doc.image : undefined,
    ...bodyForLayout(
      'body' in doc ? doc.body : undefined,
      hrefFor(doc._type, doc.slug?.current),
      'template' in doc ? (doc.template ?? undefined) : undefined,
    ),
    date:
      doc._type === 'event' && 'startsAt' in doc
        ? doc.startsAt
        : 'publishedAt' in doc
          ? doc.publishedAt
          : null,
    featureImage: 'featureImage' in doc ? doc.featureImage : undefined,
    featureBackground: 'featureBackground' in doc ? doc.featureBackground : undefined,
    featureCaption: 'featureCaption' in doc ? doc.featureCaption : null,
    orgTheme: organizationTheme(owner),
    organization: owner?.title,
    repeatsUntil: 'repeatsUntil' in doc ? doc.repeatsUntil : null,
    allDay: 'allDay' in doc ? doc.allDay : null,
    gallery: 'gallery' in doc ? doc.gallery : undefined,
    endsAt: 'endsAt' in doc ? doc.endsAt : null,
    link:
      'sourceLink' in doc
        ? doc.sourceLink
        : 'ticketLink' in doc
          ? doc.ticketLink
          : null,
    kind: 'kind' in doc ? doc.kind : null,
    subtitle: 'subtitle' in doc ? doc.subtitle || undefined : undefined,
    sidebarLinks: 'sidebarLinks' in doc ? doc.sidebarLinks : undefined,
    template: 'template' in doc ? doc.template || undefined : undefined,
    relatedStoryIds:
      'relatedStories' in doc ? doc.relatedStories?.map((story) => story._ref) : undefined,
    foundationHeadings: 'foundationHeadings' in doc ? doc.foundationHeadings : undefined,
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
    givingLevels: 'givingLevels' in doc ? doc.givingLevels : undefined,
  }
}

function settingsFor(s: SITE_QUERY_RESULT['settings']): SiteContent['settings'] {
  return {
    footerLinks: s?.footerLinks ?? undefined,
    title: s?.title || '',
    description: s?.description || '',
    address: s?.address || '',
    contactEmail: s?.contactEmail ?? undefined,
    legalLinks: (s?.legalPages ?? []).flatMap((page) =>
      page?.slug && page.title
        ? [{id: page._id, label: page.title, href: hrefFor('page', page.slug)}]
        : [],
    ),
    footerText: s?.footerText ?? undefined,
    landAcknowledgment: s?.landAcknowledgment ?? undefined,
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

export const getSite = cache(async (): Promise<SiteContent> => {
  const data = await readContent(SITE_QUERY)
  return {
    settings: settingsFor(data.settings),
    events: data.events.map(toEntry),
    articles: data.articles.filter(hasStoryDestination).map(toEntry),
    home: {
      historyLink: data.home?.historyLink || undefined,
      slides:
        data.home?.heroSlides?.map((s) => ({
          id: s._key,
          orgTheme: organizationTheme(s.orgTheme),
          title: s.title || '',
          summary: s.summary,
          image: s.image,
          link: s.link,
        })) || [],
      celebration: data.home?.celebration,
      quote: data.home?.quote,
      timeline:
        data.home?.timeline?.map((t) => ({
          id: t._key,
          year: t.year,
          summary: t.summary,
          link: t.link,
        })) || [],
      features: (data.home?.featuredContent || []).flatMap((doc) =>
        doc && hasStoryDestination(doc) ? [toEntry(doc)] : [],
      ),
      places: (data.home?.exploreLocations || []).flatMap(({location, image}) =>
        location ? [{...toEntry(location), image}] : [],
      ),
    },
  }
})

export const getEntry = cache(async (path: string): Promise<ContentEntry | undefined> => {
  const parts = path.slice(1).split('/')
  const types: Record<string, string> = {park: 'place', 'whats-on': 'event', news: 'article'}
  const type = parts.length > 1 && types[parts[0]] ? types[parts[0]] : 'page'
  const slug = type === 'page' ? parts.join('/') : parts.slice(1).join('/')
  const data = await readContent(CONTENT_QUERY, {type, slug})
  if (!data && path === '/history')
    return (await getEntry('/timeline')) ?? getEntry('/grove-history')
  return data && hasStoryDestination(data) ? toEntry(data) : undefined
})

export async function searchContent(query: string): Promise<ContentEntry[]> {
  const data = await readContent(SEARCH_QUERY, {searchTerm: `${query}*`})
  return data.filter(hasStoryDestination).map(toEntry)
}
