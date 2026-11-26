# Barnsdall editorial handoff

The standalone Studio and website use project `i18fhbsv`, dataset `production`. The protected Vercel preview displays saved drafts when the page is refreshed.

## Editing

- **Homepage** holds the hero slides, anniversary callout, Explore photographs, and ordered featured cards. Choose an item and optionally override its homepage artwork or caption.
- **Pages** contains All Pages and shortcuts for Visit, Support the Park, and History. Choose the page layout under Page settings. Use Body for prose and Sections for columns, accordions, links, and layout-specific features. Keep an existing page anchor when renaming a section that readers link to.
- **History** contains the chronology. Drag milestones into chronological order. Select **Show on homepage** for the short overview. A selected milestone uses its date and description unless you supply shorter wording.
- **Support the Park** contains the Foundation directory and the Support pages. Edit people and partners under Directory. Under Supporters, open the year, group, and acknowledgment. Edit annual giving levels inside their donation section.
- **Park Locations** contains The Park and the facility websites. Subtitle supplies the short text in the homepage’s Explore the Park section and beneath the title on an on-site location page. On The Park, use Body for prose and quotations, Sidebar links for page actions, and Images for the slideshow.
- **What’s On** holds events and exhibitions. Choose the organization first. For partner events, enter the external event URL. The Park and The Foundation have on-site event pages with body text and an optional ticket link. Use Schedule for dates and weekly recurrence. Times use Los Angeles local time.
- **News** lists stories from all organizations. Partner stories open the External article URL. Foundation and Park stories can use Body, Images, See also, and a source link. Display date controls the visible date and order. A promotion can link to a page and appear on the homepage.
- **Organizations** holds the highlight and shadow colors used for each organization’s artwork.
- **Site Settings** holds navigation, the footer address and copy, social links, legal pages, and sitewide quotes. Choose and reorder legal pages to set the footer links.

Choose a site page for an internal destination, or enter a URL for an external site, file path, or fragment. In Body, choose Lead from the style dropdown for a larger paragraph. For a quotation, use Lead and Italic and put the attribution on its own line. To add a Dotted link, link the entire paragraph and select Dotted link from the style dropdown. Studio highlights those paragraphs with a tint. Use Alternative text for an image description and Caption for visible wording or credit. Select Decorative image when screen readers can skip the image.

## Review and publication

The website’s production configuration reads published documents. Review and publish the individual records before their referencing homepage and settings documents. Refresh the protected preview after saving a draft.

The footer signup prefills the email address on the Foundation’s Bloomerang registration form on Contact. The provider’s form collects first name, last name and email. Annual giving amounts and benefits, confirmed event dates and image permissions remain launch inputs.

The roster and supporters’ acknowledgments follow the Foundation’s records. Historical dates follow the Foundation’s timeline and grove history. The six-organization color plate and desktop interface supply the colors, type sizes and spacing. The responsive layouts adapt those dimensions for narrower screens. [Leadership](https://www.barnsdall.org/leadership) · [Timeline](https://www.barnsdall.org/timeline) · [Grove history](https://www.barnsdall.org/grove-history)

## Launch verification

Run `npm run check:published` from the repository root to check the public homepage, navigation, Visit, Donate and organization references in the published perspective. Add `-- https://your-public-domain` to verify the deployed routes, sitemap and robots file after configuring the public origin. Draft-only pages will appear as outstanding until their editors publish them.

Before public launch, review the first homepage slide, Volunteer and the seven initiative detail pages for placeholder copy. Replace the sample telephone number in the footer address. Confirm the display dates of the News spotlights with the editorial team.
