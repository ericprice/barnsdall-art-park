import {organizationTheme, type OrganizationTheme} from '../../../shared/organizations'
import {interfaceDefaults, type InterfaceText} from '../../../shared/interface'
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
  RichText,
  Seo,
  SiteSettings,
  ContentSection,
  Page,
} from '../../sanity.types'

export type ImageSource = ParkImage | string | null | undefined
export type PageSection = Omit<ContentSection, 'image'> & {
  image?: ImageSource
  imageAlt?: string
  _key: string
}
export type TimelineEntry = Omit<NonNullable<Page['timelineEntries']>[number], 'image'> & {
  image?: ImageSource
  imageAlt?: string
}
export type Partner = Omit<NonNullable<Page['partners']>[number], 'logo'> & {logo?: ImageSource}
export type ContentEntry = {
  id: string
  title: string
  href: string
  directoryOrder?: number
  category: string
  summary?: string | null
  image?: ImageSource
  imageAlt?: string
  body?: RichText
  date?: string | null
  featureBackground?: string | null
  featureCategory?: string | null
  featureImage?: ImageSource
  featureCaption?: string | null
  orgTheme?: OrganizationTheme
  organization?: string | null
  repeatsUntil?: string | null
  allDay?: boolean | null
  gallery?: (ParkImage & {_key: string})[]
  endsAt?: string | null
  venue?: {title: string | null; href: string | null} | null
  link?: {label?: string; href?: string} | null
  seo?: Seo
  kind?: string | null
  template?: Page['template']
  archiveEntry?: boolean
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
  volunteerOpportunities?: Page['volunteerOpportunities']
  givingLevels?: Page['givingLevels']
}
export type NavItem = {
  title: string
  href?: string
  children?: {label: string; href: string; sectionLabel?: string}[]
}
export type SiteContent = {
  settings: {
    featuredNewsId?: string
    calendarResources?: SiteSettings['calendarResources']
    interfaceText: InterfaceText
    headerMark?: ImageSource
    footerMark?: ImageSource
    copyright?: string
    subscribeLink?: {label?: string; href?: string}
    footerLinks?: {label?: string; href?: string; _key?: string}[]
    sectionMenus?: SiteSettings['sectionMenus']
    title: string
    description: string
    sunsetLabel?: string
    cityRunLabel?: string
    address: string
    navigation: NavItem[]
    donationLink?: {label?: string; href?: string} | null
    newsletterWidgetId?: string
    newsletterUrl?: string
    newsletterFormAction?: string
    newsletterEmailField?: string
    privacyUrl?: string
    termsUrl?: string
    contactEmail?: string
    footerText?: string
    landAcknowledgment?: string
    seo?: Seo
    socialLinks?: {label?: string; href?: string; _key: string; icon?: ImageSource}[]
  }
  home: {
    historyLink?: {label?: string; href?: string}
    seo?: Seo
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
  places: ContentEntry[]
  events: ContentEntry[]
  articles: ContentEntry[]
  pages: ContentEntry[]
}

function hrefFor(type: string, slug?: string) {
  const prefix =
    type === 'place' ? '/park' : type === 'event' ? '/whats-on' : type === 'article' ? '/news' : ''
  return slug ? `${prefix}/${slug}` : '/'
}

type DocumentEntry =
  | NonNullable<CONTENT_QUERY_RESULT>
  | NonNullable<NonNullable<NonNullable<SITE_QUERY_RESULT['home']>['featuredContent']>[number]>
  | SITE_QUERY_RESULT['places'][number]
  | SITE_QUERY_RESULT['events'][number]
  | SITE_QUERY_RESULT['articles'][number]
  | SITE_QUERY_RESULT['pages'][number]
  | SEARCH_QUERY_RESULT[number]
function toEntry(doc: DocumentEntry): ContentEntry {
  const legacyCredit = 'organization' in doc ? doc.organization : undefined
  const theme = organizationTheme(
    'orgTheme' in doc ? doc.orgTheme : undefined,
    legacyCredit || doc.title,
  )
  return {
    id: doc._id,
    title: doc.title || 'Untitled',
    href:
      'storyDestination' in doc && doc.storyDestination?.href
        ? doc.storyDestination.href
        : 'website' in doc && doc.website?.href
          ? doc.website.href
          : hrefFor(doc._type, doc.slug?.current),
    category:
      doc._type === 'article'
        ? ('category' in doc && doc.category) || 'News'
        : doc._type === 'event'
          ? ('orgTheme' in doc && doc.orgTheme?.title) ||
            legacyCredit ||
            ('kind' in doc && doc.kind) ||
            'What’s on'
          : doc._type === 'place'
            ? 'The park'
            : 'Foundation',
    summary: doc.summary,
    image: doc.image,
    body: 'body' in doc ? doc.body : undefined,
    seo: 'seo' in doc ? doc.seo : undefined,
    date:
      doc._type === 'event' && 'startsAt' in doc
        ? doc.startsAt
        : 'publishedAt' in doc
          ? doc.publishedAt
          : null,
    featureCategory: 'featureCategory' in doc ? doc.featureCategory : undefined,
    featureImage: 'featureImage' in doc ? doc.featureImage : undefined,
    featureBackground: 'featureBackground' in doc ? doc.featureBackground : undefined,
    featureCaption: 'featureCaption' in doc ? doc.featureCaption : null,
    orgTheme: theme,
    organization: ('orgTheme' in doc && doc.orgTheme?.title) || legacyCredit || null,
    repeatsUntil: 'repeatsUntil' in doc ? doc.repeatsUntil : null,
    allDay: 'allDay' in doc ? doc.allDay : null,
    gallery: 'gallery' in doc ? doc.gallery : undefined,
    endsAt: 'endsAt' in doc ? doc.endsAt : null,
    venue: 'venue' in doc ? doc.venue : null,
    link:
      'sourceLink' in doc
        ? doc.sourceLink
        : 'ticketLink' in doc
          ? doc.ticketLink
          : 'website' in doc
            ? doc.website
            : 'actionLink' in doc
              ? doc.actionLink
              : null,
    kind: 'kind' in doc ? doc.kind : null,
    template: 'template' in doc ? doc.template || undefined : undefined,
    archiveEntry: 'archiveEntry' in doc ? doc.archiveEntry : undefined,
    relatedStoryIds:
      'relatedStories' in doc ? doc.relatedStories?.map((story) => story._ref) : undefined,
    sections:
      'sections' in doc && doc.sections
        ? doc.sections.map((section) => ({
            ...section,
            links: section.links?.map((link) => ({...link, href: link.href ?? undefined})),
          }))
        : undefined,
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
    volunteerOpportunities:
      'volunteerOpportunities' in doc ? doc.volunteerOpportunities : undefined,
    givingLevels: 'givingLevels' in doc ? doc.givingLevels : undefined,
  }
}

function settingsFor(s: SiteSettings | null): SiteContent['settings'] {
  return {
    featuredNewsId: s?.featuredNews?._ref,
    calendarResources: s?.calendarResources,
    interfaceText: {...interfaceDefaults, ...s?.interfaceText},
    headerMark: s?.headerMark,
    footerMark: s?.footerMark,
    copyright: s?.copyright,
    subscribeLink: s?.subscribeLink,
    footerLinks: s?.footerLinks,
    sectionMenus: s?.sectionMenus,
    title: s?.title || '',
    description: s?.description || '',
    sunsetLabel: s?.sunsetLabel,
    cityRunLabel: s?.cityRunLabel,
    address: s?.address || '',
    donationLink: s?.donationLink,
    contactEmail: s?.contactEmail,
    newsletterWidgetId: s?.newsletterWidgetId,
    newsletterUrl: s?.newsletterUrl,
    newsletterFormAction: s?.newsletterFormAction,
    newsletterEmailField: s?.newsletterEmailField,
    privacyUrl: s?.privacyUrl,
    termsUrl: s?.termsUrl,
    footerText: s?.footerText,
    landAcknowledgment: s?.landAcknowledgment,
    socialLinks: s?.socialLinks ?? [],
    seo: s?.seo,
    navigation: s?.navigation?.length
      ? s.navigation.map((n) => ({
          title: n.title || '',
          href: n.href,
          children: n.children
            ?.filter((l) => l.label && l.href)
            .map((l) => ({label: l.label!, href: l.href!, sectionLabel: l.sectionLabel})),
        }))
      : [],
  }
}

export const getSite = cache(async (): Promise<SiteContent> => {
  const data = await readContent(SITE_QUERY)
  return {
    settings: settingsFor(data.settings),
    places: data.places.map(toEntry),
    events: data.events.map(toEntry),
    articles: data.articles.map(toEntry),
    pages: data.pages.map(toEntry),
    home: {
      historyLink: data.home?.historyLink || undefined,
      seo: data.home?.seo || undefined,
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
      features: (data.home?.featuredContent || []).flatMap((doc) => (doc ? [toEntry(doc)] : [])),
      places: (data.home?.featuredPlaces || []).flatMap((doc) => (doc ? [toEntry(doc)] : [])),
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
  return data ? toEntry(data) : undefined
})

export async function searchContent(query: string): Promise<ContentEntry[]> {
  const data = await readContent(SEARCH_QUERY, {searchTerm: `${query}*`})
  return data.map(toEntry)
}
