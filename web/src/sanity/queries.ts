import {defineQuery} from 'next-sanity'

// Internal links can occur in any rich text annotation, card, or navigation item.
// Resolve only destinations actually requested by the current document or listing.
export const DESTINATIONS_QUERY = defineQuery(
  `*[_id in $ids]{_id, _type, slug, organizationRef, externalUrl, "targetPageId":targetPage._ref, "targetSlug":targetPage->slug.current}`,
)
export const SITE_QUERY = defineQuery(`{
  "organizationColors": *[_type == "organization"] | order(_id asc){_id, light, dark},
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title, description, footer, address, socialLinks, footerText, landAcknowledgment, quotes,
    navigation, footerLinks, legalPages[]->{_id, title, "slug": slug.current}
  },
  "home": *[_type == "homePage" && _id == "homePage"][0]{
    historyLink, heroSlides[]{..., "orgTheme": organizationRef->{title, light, dark}}, celebration,
    features[]{image,caption,background,entry->{_id,_type,title,slug,summary,image,organizationRef,"orgTheme":organizationRef->{title,light,dark},externalUrl,"targetPageId":targetPage._ref, "targetSlug":targetPage->slug.current,startsAt,endsAt,repeatsUntil,allDay,publishedAt}},
    exploreLocations[]{image, location->{_id, _type, title, slug, subtitle, "orgTheme": organizationRef->{title, light, dark}, externalUrl}}
  },
  "milestones": *[_id == $historyId][0].timelineEntries[showOnHomepage == true]{_key, "year":coalesce(homeHighlight.year,dateLabel), "summary":coalesce(homeHighlight.summary,description),"link":homeHighlight.link},
  "events": *[_type == "event"] | order(startsAt asc){_id, _type, title, slug, summary, image, organizationRef, externalUrl, "orgTheme": organizationRef->{title, light, dark}, startsAt, endsAt, repeatsUntil, allDay},
  "articles": *[_type == "article" && defined(slug.current) && excludeFromNews != true] | order(defined(publishedAt) desc, publishedAt desc, title asc){_id, _type, title, slug, summary, image, organizationRef, "orgTheme": organizationRef->{title, light, dark}, externalUrl, publishedAt}
}`)

export const CONTENT_QUERY = defineQuery(
  `*[_type == $type && slug.current == $slug && _type in ["page","place","event","article"]][0]{..., _type == "page" => {initiativeCards[]{..., "detail": page->{title, "slug": slug.current, summary, "organization": organizationRef->title}}}, "orgTheme": organizationRef->{title, light, dark}, "targetPageId":targetPage._ref, "targetSlug":targetPage->slug.current}`,
)

export const SEARCH_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] && (defined(slug.current) || (_type == "event" && defined(externalUrl))) && (title match $searchTerm || organizationRef->title match $searchTerm || summary match $searchTerm || subtitle match $searchTerm || (!defined(externalUrl) && !defined(targetPage) && pt::text(body) match $searchTerm) || contentSections[].title match $searchTerm || contentSections[].links[].label match $searchTerm || contentSections[].entries[].title match $searchTerm || contentSections[].entries[].links[].label match $searchTerm || count(contentSections[pt::text(body) match $searchTerm || count(entries[pt::text(body) match $searchTerm]) > 0]) > 0 || boardMembers[].name match $searchTerm || boardMembers[].role match $searchTerm || boardMembers[].affiliation match $searchTerm || boardMembers[].bio match $searchTerm || staffMembers[].name match $searchTerm || staffMembers[].role match $searchTerm || staffMembers[].affiliation match $searchTerm || staffMembers[].bio match $searchTerm || partners[].name match $searchTerm || supporterYears[].groups[].supporters[].name match $searchTerm || initiativeCards[!defined(page)].title match $searchTerm || donationSections[].title match $searchTerm || timelineEntries[].dateLabel match $searchTerm || timelineEntries[].description match $searchTerm)] | order(title asc)[0...100]{_id, _type, title, slug, summary, image, organizationRef, "orgTheme": organizationRef->{title, light, dark}, externalUrl, "targetPageId":targetPage._ref, "targetSlug":targetPage->slug.current}`,
)
