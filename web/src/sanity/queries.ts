import {defineQuery} from 'next-sanity'

const routeFields = `_id, _type, slug, organizationRef, externalUrl,
  "targetPageId": targetPage._ref, "targetSlug": targetPage->slug.current`
const owner = `coalesce(organizationRef->, *[_type == "organization" && _id == "organization-" + string::split(^.organizationRef._ref, ".")[1]][0])`
const cardFields = `${routeFields}, title, summary, image,
  "orgTheme": ${owner}{title, light, dark}, startsAt, endsAt, repeatsUntil, allDay, publishedAt`
const newsOrder = 'defined(publishedAt) desc, publishedAt desc, title asc, _id asc'

export const DESTINATIONS_QUERY = defineQuery(`*[_id in $ids]{${routeFields}}`)

export const SHELL_QUERY = defineQuery(`{
  "organizationColors": *[_type == "organization"] | order(displayOrder asc, lower(title) asc, _id asc){_id, light, dark},
  "settings": *[_id == "siteSettings" && _type == "siteSettings"][0]{
    title, description, eventsSubtitle, newsSubtitle, footer, address, socialLinks, footerText, landAcknowledgment, quotes,
    navigation, footerLinks, legalPages[]->{_id, title, "slug": slug.current}
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

export const SEARCH_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] &&
    (defined(slug.current) || defined(externalUrl)) && (
    title match $searchTerm || (!defined(organizationRef->title) && organizationRef._ref in $organizationIds) || organizationRef->title match $searchTerm ||
    summary match $searchTerm || subtitle match $searchTerm ||
    (!defined(externalUrl) && !defined(targetPage) && pt::text(body) match $searchTerm) ||
    contentSections[].title match $searchTerm || contentSections[].links[].label match $searchTerm ||
    contentSections[].entries[].title match $searchTerm || contentSections[].entries[].links[].label match $searchTerm ||
    count(contentSections[pt::text(body) match $searchTerm || count(entries[pt::text(body) match $searchTerm]) > 0]) > 0 ||
    boardMembers[].name match $searchTerm || boardMembers[].role match $searchTerm || boardMembers[].affiliation match $searchTerm || boardMembers[].bio match $searchTerm ||
    staffMembers[].name match $searchTerm || staffMembers[].role match $searchTerm || staffMembers[].affiliation match $searchTerm || staffMembers[].bio match $searchTerm ||
    partners[].name match $searchTerm || supporterYears[].groups[].supporters[].name match $searchTerm ||
    initiativeCards[!defined(page)].title match $searchTerm || initiativeCards[].summary match $searchTerm ||
    donationSections[].title match $searchTerm || donationSections[].label match $searchTerm || donationSections[].summary match $searchTerm ||
    donationSections[].ways[].title match $searchTerm || donationSections[].ways[].summary match $searchTerm ||
    donationSections[].levels[].title match $searchTerm || donationSections[].levels[].summary match $searchTerm ||
    timelineEntries[].dateLabel match $searchTerm || timelineEntries[].description match $searchTerm
  )] | order((lower(title) == $exactTerm) desc, (title match $searchTerm) desc, lower(title) asc, _id asc)[$from...$to]{${routeFields}, title}`,
)
