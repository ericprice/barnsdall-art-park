import {defineQuery} from 'next-sanity'
import {legacyOliveGroveNewsSlug} from '../../../shared/routes'

const routeFields = '_id, _type, slug, organizationRef, externalUrl'
const owner = `coalesce(organizationRef->, *[_type == "organization" && _id == "organization-" + string::split(^.organizationRef._ref, ".")[1]][0])`
const cardBase = `${routeFields}, title, summary`
const articleDate = 'coalesce(date, publishedAt)'
const dateField = `"date": ${articleDate}`
const cardMeta = `"orgTheme": ${owner}{title, light, dark}, startsAt, endsAt, repeatsUntil, allDay, ${dateField}`
const cardFields = `${cardBase}, image,
  ${cardMeta}`
const newsOrder = `defined(${articleDate}) desc, ${articleDate} desc, title asc, _id asc`
const canonicalRoute = `(_type != "article" || slug.current != "${legacyOliveGroveNewsSlug}")`

export const DESTINATIONS_QUERY = defineQuery(`*[_id in $ids]{${routeFields}}`)

export const SHELL_QUERY = defineQuery(`{
  "organizationColors": *[_type == "organization"] | order(displayOrder asc, lower(title) asc, _id asc){_id, light, dark},
  "settings": *[_id == "siteSettings" && _type == "siteSettings"][0]{
    title, description, eventsSubtitle, newsSubtitle, footer, address, socialLinks, footerText, landAcknowledgment, quotes,
    navigation, searchPlaceholders, footerLinks, legalPages[]->{_id, title, "slug": slug.current}
  },
  "homeSubtitle": *[_id == "homePage" && _type == "homePage"][0].subtitle
}`)

export const HOME_QUERY = defineQuery(`{
  "home": *[_id == "homePage" && _type == "homePage"][0]{
    historyLink, heroSlides[]{_key, title, summary, image, link, organizationRef, "orgTheme": ${owner}{title, light, dark}}, celebration,
    features[]{image, caption, background, entry->{${cardFields}}},
    exploreLocations[]{image, location->{${routeFields}, title, subtitle, "orgTheme": ${owner}{title, light, dark}}}
  },
  "milestones": *[_id == $historyId][0].timelineEntries[showOnHomepage == true]{
    _key, "year": coalesce(homeHighlight.year,dateLabel), "summary": coalesce(homeHighlight.summary,description), link
  }
}`)

export const EVENTS_QUERY = defineQuery(
  `*[_type == "event"] | order(startsAt asc, _id asc){${cardFields}}`,
)

export const NEWS_ROUTES_QUERY = defineQuery(
  `*[_type == "article" && defined(slug.current) && ${canonicalRoute}] | order(${newsOrder}){${routeFields}, title, subtitle, summary}`,
)

// Use the same stable sort as the News index. Undated stories follow all dated stories.
const tiedAfter = '(title > $title || (title == $title && _id > $id))'
const tiedBefore = '(title < $title || (title == $title && _id < $id))'
const olderStory = `select(defined($date) =>
  (!defined(${articleDate}) || ${articleDate} < $date || (${articleDate} == $date && ${tiedAfter})),
  !defined(${articleDate}) && ${tiedAfter})`
const newerStory = `select(defined($date) =>
  (${articleDate} > $date || (${articleDate} == $date && ${tiedBefore})),
  defined(${articleDate}) || ${tiedBefore})`
const listedStory = `_type == "article" && defined(title) && defined(slug.current) && ${canonicalRoute} &&
  (organizationRef._ref in $hostIds ||
    string::startsWith(externalUrl, "https://") || string::startsWith(externalUrl, "http://"))`

export const NEWS_NEIGHBORS_QUERY = defineQuery(`{
  "previous": *[${listedStory} && ${olderStory}] | order(${newsOrder})[0]{${routeFields}},
  "next": *[${listedStory} && ${newerStory}] | order(defined(${articleDate}) asc, ${articleDate} asc, title desc, _id desc)[0]{${routeFields}}
}`)

export const NEWS_CARDS_QUERY = defineQuery(`*[_type == "article" && _id in $ids]{${cardFields}}`)

export const CONTENT_QUERY = defineQuery(
  `*[_type == $type && slug.current == $slug && _type in ["page","place","event","article"]][0]{
    ...,
    _type == "page" => {initiativeCards[]{..., "detail": page->{title, "slug": slug.current, "summary": coalesce(subtitle, pt::text(body[0...1][style == "lead"])), "organization": ${owner}.title}}},
    _type == "article" => {${dateField}, "relatedCards": (relatedStories[]->)[${canonicalRoute}]{${cardFields}}},
    "orgTheme": ${owner}{title, light, dark}
  }`,
)

export const SITEMAP_QUERY = defineQuery(
  `*[_type in ["page","place","event","article"] && defined(slug.current) && ${canonicalRoute}]{${routeFields}}`,
)

// Project plain text once for all searches. Keep titles and summaries separate for ranking.
const searchText = `array::join(array::compact([
  slug.current,
  coalesce(organizationRef->title, $organizations[id == ^.organizationRef._ref][0].title),
  select(!defined(externalUrl) => pt::text(body)),
  ...coalesce(contentSections[].title, []),
  ...coalesce(contentSections[].links[].label, []),
  ...coalesce(contentSections[]{"text": pt::text(body)}.text, []),
  ...coalesce(contentSections[].entries[].title, []),
  ...coalesce(contentSections[].entries[].links[].label, []),
  ...coalesce(contentSections[].entries[]{"text": pt::text(body)}.text, []),
  ...coalesce(boardMembers[].name, []), ...coalesce(boardMembers[].role, []),
  ...coalesce(boardMembers[].affiliation, []), ...coalesce(boardMembers[].bio, []),
  ...coalesce(staffMembers[].name, []), ...coalesce(staffMembers[].role, []),
  ...coalesce(staffMembers[].affiliation, []), ...coalesce(staffMembers[].bio, []),
  ...coalesce(partners[].name, []), ...coalesce(supporterYears[].groups[].supporters[].name, []),
  ...coalesce(initiativeCards[!defined(page)].title, []), ...coalesce(initiativeCards[].summary, []),
  ...coalesce(donationSections[].title, []), ...coalesce(donationSections[].label, []), ...coalesce(donationSections[].summary, []),
  ...coalesce(donationSections[].ways[].title, []), ...coalesce(donationSections[].ways[].summary, []),
  ...coalesce(donationSections[].levels[].title, []), ...coalesce(donationSections[].levels[].summary, []),
  ...coalesce(timelineEntries[].dateLabel, []), ...coalesce(timelineEntries[].description, [])
]), " ")`

export const SEARCH_CATALOG_QUERY = defineQuery(`*[_type in ["page", "place", "event", "article"] && ${canonicalRoute} &&
  defined(title) && (defined(slug.current) || defined(externalUrl))]{
    ${routeFields}, title, "description": array::join(array::compact([subtitle, summary]), " "), "text": ${searchText}
}`)

export const SEARCH_CARDS_QUERY =
  defineQuery(`*[_type in ["page", "place", "event", "article"] && _id in $ids]{
  ${cardBase}, ${cardMeta}, subtitle,
  "image": select(_type == "place" => gallery[defined(asset)][0], image),
  "bodyText": select(!defined(externalUrl) =>
    pt::text(body[_type == "block" && (!defined(style) || style in ["normal", "lead"]) &&
      !defined(listItem) && pt::text([@]) match "*"][0...1]))
}`)
