import {defineQuery} from 'next-sanity'

export const SITE_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0],
  "home": *[_type == "homePage" && _id == "homePage"][0]{
    title, historyLink, heroSlides[]{..., "orgTheme": organizationRef->{title, light, dark}}, celebration, quote, timeline, seo,
    featuredContent[]->{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, category, storyDestination, featureCategory, featureImage, featureBackground, featureCaption, organization, kind, startsAt, endsAt, repeatsUntil, allDay, publishedAt, website},
    featuredPlaces[]->{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, website}
  },
  "places": *[_type == "place" && defined(slug.current)] | order(coalesce(directoryOrder, 9999) asc, title asc)[0...100]{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, website},
  "events": *[_type == "event" && defined(slug.current)] | order(startsAt asc){_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, organization, kind, startsAt, endsAt, repeatsUntil, allDay, "venue": select(defined(place) || defined(venueLabel) => {"title": coalesce(venueLabel, place->title), "href": select(defined(place) => coalesce(place->website.href, "/park/" + place->slug.current))})},
  "articles": *[_type == "article" && defined(slug.current)] | order(coalesce(archiveEntry, false) asc, defined(publishedAt) desc, publishedAt desc, title asc){_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, organization, category, storyDestination, featureCategory, featureImage, featureBackground, featureCaption, publishedAt},
  "pages": *[_type == "page" && defined(slug.current)] | order(title asc)[0...100]{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, template}
}`)

export const CONTENT_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] && _type == $type && slug.current == $slug][0]{..., sections[]{..., links[]{..., "href": coalesce(attachment.asset->url,href)}}, "orgTheme": organizationRef->{title, light, dark}, "venue": select(defined(place) || defined(venueLabel) => {"title": coalesce(venueLabel, place->title), "href": select(defined(place) => coalesce(place->website.href, "/park/" + place->slug.current))})}`,
)

export const SEARCH_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] && defined(slug.current) && (title match $searchTerm || summary match $searchTerm || pt::text(body) match $searchTerm || boardMembers[].name match $searchTerm || boardMembers[].role match $searchTerm || boardMembers[].affiliation match $searchTerm || boardMembers[].bio match $searchTerm || staffMembers[].name match $searchTerm || staffMembers[].role match $searchTerm || staffMembers[].affiliation match $searchTerm || staffMembers[].bio match $searchTerm || partners[].name match $searchTerm || supporterYears[].groups[].supporters[].name match $searchTerm || initiativeCards[].title match $searchTerm || volunteerOpportunities[].title match $searchTerm || donationSections[].title match $searchTerm || timelineEntries[].dateLabel match $searchTerm || timelineEntries[].description match $searchTerm || sections[].title match $searchTerm || sections[].lead match $searchTerm || pt::text(sections[].body[]) match $searchTerm || sections[].entries[].title match $searchTerm || pt::text(sections[].entries[].body[]) match $searchTerm)] | order(title asc)[0...100]{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, website}`,
)
