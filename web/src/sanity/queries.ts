import {defineQuery} from 'next-sanity'

export const SITE_QUERY = defineQuery(`{
  "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    title, description, address, contactEmail, socialLinks, footerText, landAcknowledgment,
    navigation, footerLinks, legalPages[]->{_id, title, "slug": slug.current}
  },
  "home": *[_type == "homePage" && _id == "homePage"][0]{
    title, historyLink, heroSlides[]{..., "orgTheme": organizationRef->{title, light, dark}}, celebration, quote, timeline,
    featuredContent[]->{_id, _type, title, slug, summary, image, organizationRef, "orgTheme": organizationRef->{title, light, dark}, storyDestination, featureImage, featureBackground, featureCaption, kind, startsAt, endsAt, repeatsUntil, allDay, publishedAt, website},
    featuredPlaces[]->{_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, website}
  },
  "events": *[_type == "event" && defined(slug.current)] | order(startsAt asc){_id, _type, title, slug, summary, image, "orgTheme": organizationRef->{title, light, dark}, kind, startsAt, endsAt, repeatsUntil, allDay},
  "articles": *[_type == "article" && defined(slug.current) && excludeFromNews != true] | order(defined(publishedAt) desc, publishedAt desc, title asc){_id, _type, title, slug, summary, image, organizationRef, "orgTheme": organizationRef->{title, light, dark}, storyDestination, featureImage, featureBackground, featureCaption, publishedAt}
}`)

export const CONTENT_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] && _type == $type && slug.current == $slug][0]{..., "orgTheme": organizationRef->{title, light, dark}}`,
)

export const SEARCH_QUERY = defineQuery(
  `*[_type in ["page", "place", "event", "article"] && defined(slug.current) && (title match $searchTerm || organizationRef->title match $searchTerm || summary match $searchTerm || pt::text(body) match $searchTerm || boardMembers[].name match $searchTerm || boardMembers[].role match $searchTerm || boardMembers[].affiliation match $searchTerm || boardMembers[].bio match $searchTerm || staffMembers[].name match $searchTerm || staffMembers[].role match $searchTerm || staffMembers[].affiliation match $searchTerm || staffMembers[].bio match $searchTerm || partners[].name match $searchTerm || supporterYears[].groups[].supporters[].name match $searchTerm || initiativeCards[].title match $searchTerm || donationSections[].title match $searchTerm || timelineEntries[].dateLabel match $searchTerm || timelineEntries[].description match $searchTerm)] | order(title asc)[0...100]{_id, _type, title, slug, summary, image, organizationRef, "orgTheme": organizationRef->{title, light, dark}, website, storyDestination}`,
)
