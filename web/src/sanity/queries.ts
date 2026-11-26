import {defineQuery} from 'next-sanity'

const routeFields = `_id, _type, slug, organizationRef, externalUrl,
  "targetPageId": targetPage._ref, "targetSlug": targetPage->slug.current`
const owner = `coalesce(organizationRef->, *[_type == "organization" && _id == "organization-" + string::split(^.organizationRef._ref, ".")[1]][0])`
const cardBase = `${routeFields}, title, summary`
const cardMeta = `"orgTheme": ${owner}{title, light, dark}, startsAt, endsAt, repeatsUntil, allDay, publishedAt`
const cardFields = `${cardBase}, image,
  ${cardMeta}`
const newsOrder = 'defined(publishedAt) desc, publishedAt desc, title asc, _id asc'

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
  `*[_type == "article" && defined(slug.current) && excludeFromNews != true] | order(${newsOrder}){${routeFields}, title}`,
)

// Use the same stable sort as the News index. Undated stories follow all dated stories.
const tiedAfter = '(title > $title || (title == $title && _id > $id))'
const tiedBefore = '(title < $title || (title == $title && _id < $id))'
const olderStory = `select(defined($date) =>
  (!defined(publishedAt) || publishedAt < $date || (publishedAt == $date && ${tiedAfter})),
  !defined(publishedAt) && ${tiedAfter})`
const newerStory = `select(defined($date) =>
  (publishedAt > $date || (publishedAt == $date && ${tiedBefore})),
  defined(publishedAt) || ${tiedBefore})`
const listedStory = `_type == "article" && defined(title) && defined(slug.current) && excludeFromNews != true &&
  select(defined(targetPage) => defined(targetPage->slug.current),
    organizationRef._ref in $hostIds => true,
    string::startsWith(externalUrl, "https://") || string::startsWith(externalUrl, "http://"))`

export const NEWS_NEIGHBORS_QUERY = defineQuery(`{
  "previous": *[${listedStory} && ${olderStory}] | order(${newsOrder})[0]{${routeFields}},
  "next": *[${listedStory} && ${newerStory}] | order(defined(publishedAt) asc, publishedAt asc, title desc, _id desc)[0]{${routeFields}}
}`)

export const NEWS_CARDS_QUERY = defineQuery(`*[_type == "article" && _id in $ids]{${cardFields}}`)

export const CONTENT_QUERY = defineQuery(
  `*[_type == $type && slug.current == $slug && _type in ["page","place","event","article"]][0]{
    ...,
    _type == "page" => {initiativeCards[]{..., "detail": page->{title, "slug": slug.current, "summary": coalesce(subtitle, pt::text(body[0...1][style == "lead"])), "organization": ${owner}.title}}},
    _type == "article" => {"relatedCards": relatedStories[]->{${cardFields}}},
    "orgTheme": ${owner}{title, light, dark}, "targetPageId": targetPage._ref, "targetSlug": targetPage->slug.current
  }`,
)

export const SITEMAP_QUERY = defineQuery(
  `*[_type in ["page","place","event","article"] && defined(slug.current)]{${routeFields}}`,
)

// Project plain text once for all searches. Keep titles and summaries separate for ranking.
const searchText = `array::join(array::compact([
  slug.current,
  coalesce(organizationRef->title, $organizations[id == ^.organizationRef._ref][0].title),
  select(!defined(externalUrl) && !defined(targetPage) => pt::text(body)),
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

export const SEARCH_CATALOG_QUERY = defineQuery(`*[_type in ["page", "place", "event", "article"] &&
  defined(title) && (defined(slug.current) || defined(externalUrl))]{
    ${routeFields}, title, "description": array::join(array::compact([subtitle, summary]), " "), "text": ${searchText}
}`)

export const SEARCH_CARDS_QUERY =
  defineQuery(`*[_type in ["page", "place", "event", "article"] && _id in $ids]{
  ${cardBase}, ${cardMeta}, subtitle,
  "image": select(_type == "place" => gallery[defined(asset)][0], image),
  "bodyText": select(!defined(externalUrl) && !defined(targetPage) =>
    pt::text(body[_type == "block" && (!defined(style) || style in ["normal", "lead"]) &&
      !defined(listItem) && pt::text([@]) match "*"][0...1]))
}`)
