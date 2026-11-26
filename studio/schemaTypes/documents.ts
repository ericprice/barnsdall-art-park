import {contentSections} from './sections'
import {validateContentSlug} from '../../shared/routes'
import {destinationFields, quoteFields, validDestination} from './objects'
import {FeatureColor} from './feature-color'
import {footerFromPlainText} from '../../shared/footer-text'
import {defaultSearchPlaceholders} from '../../shared/search-placeholders'
import {
  pageLayouts,
  pageHasMainImage,
  historyPageId,
  rolesByLayout,
} from '../../shared/page-layouts'
import {organizationReference} from './organization'
import {hostsDetailPage, isExternalStoryUrl} from '../../shared/organizations'
import {supportPageFields} from './support-subpages'
import {directoryFields} from './foundation'
import {
  ALL_FIELDS_GROUP,
  defineArrayMember,
  defineField,
  defineType,
  type ConditionalPropertyCallback,
  type SanityDocument,
} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {DocumentIcon} from '@sanity/icons/Document'
import {PinIcon} from '@sanity/icons/Pin'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

const title = defineField({name: 'title', type: 'string', validation: (r) => r.required()})
const slug = defineField({
  name: 'slug',
  type: 'slug',
  options: {
    source: (doc) => {
      const current = (doc.slug as {current?: string})?.current || ''
      const prefix = current.includes('/') ? current.slice(0, current.lastIndexOf('/') + 1) : ''
      return prefix + String(doc.title || '')
    },
    slugify: (value) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9/]+/g, '-')
        .replace(/^-+|-+$/g, ''),
  },
  validation: (r) =>
    r
      .required()
      .custom((value, {document}) =>
        validateContentSlug(value?.current, document?._type ?? 'page'),
      ),
})
const summary = defineField({name: 'summary', type: 'text', rows: 3})
const subtitle = defineField({
  name: 'subtitle',
  type: 'string',
  description: 'Shown beneath the title on the website.',
})

const image = defineField({name: 'image', type: 'parkImage'})
const mainImage = {...image, title: 'Main image'}
const editorialImage = defineField({name: 'image', title: 'Main image', type: 'editorialImage'})
const body = defineField({name: 'body', type: 'richText'})
const gallery = defineField({
  name: 'gallery',
  title: 'Slideshow images',
  type: 'array',
  of: [defineArrayMember({type: 'parkImage'})],
})
const sidebarLinks = defineField({
  name: 'sidebarLinks',
  title: 'Sidebar links',
  type: 'array',
  of: [defineArrayMember({type: 'link'})],
})
const contentGroup = {name: 'content', title: 'Content', default: true}
const imagesGroup = {name: 'images', title: 'Images'}
const hideAllFields = {...ALL_FIELDS_GROUP, hidden: true}
const preview = {select: {title: 'title', subtitle: 'slug.current', media: 'image'}}

export const siteSettings = defineType({
  name: 'siteSettings',
  icon: CogIcon,
  initialValue: {
    title: 'Barnsdall Art Park Foundation',
    footer: footerFromPlainText({address: '4800 Hollywood Blvd\nLos Angeles, CA 90027'}),
  },
  title: 'Site settings',
  type: 'document',
  fields: [
    title,
    defineField({name: 'description', title: 'Site description', type: 'text', rows: 3}),
    defineField({...subtitle, name: 'eventsSubtitle', title: 'What’s On subtitle'}),
    defineField({...subtitle, name: 'newsSubtitle', title: 'News subtitle'}),
    defineField({
      name: 'searchPlaceholders',
      title: 'Search placeholders',
      description: 'Example phrases that rotate in the empty search field, in the order listed.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      initialValue: defaultSearchPlaceholders,
    }),
    defineField({name: 'footerLinks', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({
      name: 'navigation',
      description:
        'Child links and labels are shared by the header dropdown and section navigation.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'navigationItem',
          type: 'object',
          fields: [
            title,
            ...destinationFields,
            defineField({name: 'children', type: 'array', of: [defineArrayMember({type: 'link'})]}),
          ],
          validation: (rule) =>
            rule.custom((item) => {
              if (!item) return true
              const destination = item as {
                internal?: {_ref?: string}
                href?: string
                children?: unknown[]
              }
              if (destination.internal?._ref || destination.href)
                return validDestination(destination)
              return (
                Boolean(destination.children?.length) ||
                'Add a destination or at least one child link.'
              )
            }),
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
    defineField({
      name: 'legalPages',
      title: 'Legal links',
      description: 'Select and reorder the pages that appear in the footer.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'page'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'quotes',
      title: 'Sitewide quotes',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'siteQuote',
          type: 'object',
          fields: [...quoteFields, defineField({name: 'link', type: 'link'})],
          preview: {select: {title: 'text', subtitle: 'attribution'}},
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({
      name: 'footer',
      type: 'object',
      fields: [
        defineField({name: 'footerText', title: 'Footer text', type: 'footerProse'}),
        defineField({name: 'address', type: 'footerProse'}),
        defineField({name: 'landAcknowledgment', type: 'footerProse'}),
      ],
    }),
    // Older site builds still read the original plain-text fields.
    defineField({
      name: 'address',
      type: 'text',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Use the rich text field under Footer.'},
    }),
    defineField({
      name: 'footerText',
      type: 'text',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Use the rich text field under Footer.'},
    }),
    defineField({
      name: 'landAcknowledgment',
      type: 'text',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Use the rich text field under Footer.'},
    }),
  ],
})

export const homePage = defineType({
  name: 'homePage',
  icon: HomeIcon,
  preview: {prepare: () => ({title: 'Homepage'})},
  title: 'Homepage',
  type: 'document',
  fields: [
    subtitle,
    defineField({
      name: 'heroSlides',
      title: 'Featured stories',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'heroSlide',
          type: 'object',
          fields: [
            title,
            summary,
            editorialImage,
            organizationReference,
            defineField({name: 'link', type: 'link'}),
          ],
          preview: {select: {title: 'title', media: 'image'}},
        }),
      ],
      validation: (r) => r.max(5),
    }),
    defineField({
      name: 'celebration',
      type: 'object',
      fields: [title, defineField({name: 'link', type: 'link'})],
    }),
    defineField({
      name: 'exploreLocations',
      title: 'Explore the Park',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'exploreLocation',
          type: 'object',
          fields: [
            defineField({
              name: 'location',
              type: 'reference',
              to: [{type: 'place'}],
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'image', type: 'parkImage'}),
          ],
          preview: {select: {title: 'location.title', media: 'image'}},
        }),
      ],
      validation: (rule) =>
        rule.custom((items) => {
          const ids = (items ?? []).flatMap(
            (item) => (item as {location?: {_ref?: string}} | null)?.location?._ref || [],
          )
          return new Set(ids).size === ids.length || 'Select each park location once.'
        }),
    }),
    defineField({
      name: 'features',
      title: 'Featured content',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'featureCard',
          title: 'Featured item',
          type: 'object',
          fields: [
            defineField({
              name: 'entry',
              title: 'Item',
              type: 'reference',
              to: ['event', 'article', 'place', 'page'].map((type) => ({type})),
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'image',
              title: 'Alternate image',
              type: 'editorialImage',
              description: 'Leave empty to use the selected item’s main image.',
            }),
            defineField({name: 'caption', title: 'Link caption', type: 'string'}),
            defineField({
              name: 'background',
              title: 'Shape color',
              type: 'string',
              components: {field: FeatureColor},
              validation: (r) => r.regex(/^#[a-f\d]{6}$/i),
            }),
          ],
          preview: {
            select: {title: 'entry.title', override: 'image', main: 'entry.image'},
            prepare: ({title, override, main}) => ({title, media: override || main}),
          },
        }),
      ],
      validation: (r) =>
        r.custom((items) => {
          const ids = (items || []).flatMap(
            (item) => (item as {entry?: {_ref?: string}}).entry?._ref || [],
          )
          return new Set(ids).size === ids.length || 'Select each item once.'
        }),
    }),
    defineField({
      name: 'historyLink',
      title: 'History section link',
      type: 'link',
      description: 'Choose the milestones shown here under Pages → History.',
    }),
  ],
})

export const page = defineType({
  name: 'page',
  icon: DocumentIcon,
  title: 'Page',
  type: 'document',
  groups: [
    contentGroup,
    {...imagesGroup, hidden: ({document}) => !pageHasMainImage(document?.template)},
    {
      name: 'directory',
      title: 'Directory',
      hidden: ({document}) => document?.template !== 'foundation',
    },
    {name: 'settings', title: 'Page settings'},
    hideAllFields,
  ],
  fields: [
    {...title, group: 'content'},
    {...organizationReference, group: 'content'},
    {...subtitle, group: 'content'},
    {...body, group: 'content'},
    {...slug, group: 'content'},
    {
      ...contentSections,
      group: 'content',
      hidden: ({document}) => !rolesByLayout[String(document?.template)]?.length,
    },
    {...mainImage, group: 'images', hidden: ({document}) => !pageHasMainImage(document?.template)},
    defineField({
      name: 'template',
      title: 'Page layout',
      group: 'settings',
      type: 'string',
      initialValue: 'standard',
      options: {
        list: Object.entries(pageLayouts).map(([value, title]) => ({value, title})),
      },
    }),
    ...directoryFields.map((field) => ({...field, group: 'directory'})),
    defineField({
      name: 'timelineHeading',
      group: 'content',
      title: 'Timeline section heading',
      type: 'string',
      hidden: ({document}) => document?.template !== 'timeline',
    }),
    defineField({
      name: 'timelineEntries',
      group: 'content',
      title: 'Timeline milestones',
      description:
        'Add a date or date range, description and optional photograph for each milestone. Drag the entries into chronological order.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'timelineEntry',
          type: 'object',
          icon: CalendarIcon,
          fields: [
            defineField({
              name: 'dateLabel',
              title: 'Year or date range',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'description',
              type: 'text',
              rows: 3,
              validation: (r) => r.required(),
            }),
            image,
            defineField({name: 'link', type: 'link'}),
            defineField({
              name: 'showOnHomepage',
              title: 'Show on homepage',
              type: 'boolean',
              hidden: ({document}) => document?._id?.replace(/^drafts\./, '') !== historyPageId,
            }),
            defineField({
              name: 'homeHighlight',
              title: 'Homepage wording',
              type: 'object',
              description: 'Leave the text blank to use the milestone’s date and description.',
              hidden: ({document, parent}) =>
                !parent?.showOnHomepage ||
                document?._id?.replace(/^drafts\./, '') !== historyPageId,
              fields: [
                defineField({name: 'year', title: 'Short date override', type: 'string'}),
                defineField({...summary, title: 'Short description override'}),
              ],
            }),
          ],
          preview: {select: {title: 'dateLabel', subtitle: 'description', media: 'image'}},
        }),
      ],
      hidden: ({document}) => document?.template !== 'timeline',
    }),
    ...supportPageFields.map((field) => ({...field, group: 'content'})),
  ],
  preview,
})
const linksOut: ConditionalPropertyCallback = ({document}) =>
  typeof document?.externalUrl === 'string' && Boolean(document.externalUrl)

export const place = defineType({
  name: 'place',
  icon: PinIcon,
  title: 'Park location',
  type: 'document',
  groups: [contentGroup, {...imagesGroup, hidden: linksOut}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...organizationReference, group: 'content'},
    defineField({
      name: 'externalUrl',
      title: 'Website',
      group: 'content',
      type: 'url',
      description: 'Enter the destination for a location with its own website.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'subtitle',
      group: 'content',
      type: 'string',
      description: 'Shown in Explore the Park and beneath the title on an on-site location page.',
    }),
    {...body, group: 'content', hidden: linksOut},
    {...slug, group: 'content'},
    {...contentSections, group: 'content', hidden: true},
    {...sidebarLinks, group: 'content', hidden: linksOut},
    {...gallery, group: 'images', hidden: linksOut},
  ],
  preview: {select: {title: 'title', subtitle: 'externalUrl', media: 'gallery.0'}},
})
function partnerOwned(document?: SanityDocument) {
  const owner = (document?.organizationRef as {_ref?: string} | undefined)?._ref
  return Boolean(owner && !hostsDetailPage(owner))
}
const partnerEvent: ConditionalPropertyCallback = ({document}) => partnerOwned(document)
const offsiteArticle: ConditionalPropertyCallback = ({document}) =>
  Boolean(document?.externalUrl || document?.targetPage || partnerOwned(document))

function externalStoryUrl(kind: 'event' | 'article') {
  return defineField({
    name: 'externalUrl',
    title: `External ${kind} URL`,
    type: 'url',
    group: 'content',
    description:
      kind === 'event'
        ? 'Link directly to the event on the organizer’s website. On-site body, gallery and ticket information is retained if ownership changes.'
        : 'Required for partner news. Leave empty for an on-site Foundation or Park story. Changing the destination retains existing on-site text and images.',
    hidden: ({document}) =>
      kind === 'event' ? !partnerOwned(document) : Boolean(document?.targetPage),
    validation: (rule) =>
      rule
        .uri({scheme: ['https', 'http']})
        .custom(
          (url, {document}) =>
            !partnerOwned(document) ||
            isExternalStoryUrl(url) ||
            `Enter the partner ${kind}’s URL.`,
        ),
  })
}
const eventClock = {displayTimeZone: 'America/Los_Angeles'}

export const article = defineType({
  name: 'article',
  icon: DocumentTextIcon,
  title: 'News',
  type: 'document',
  groups: [contentGroup, imagesGroup, {name: 'publishing', title: 'Publishing'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...subtitle, group: 'content'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    {
      ...summary,
      title: 'Card summary',
      description: 'Shown on News cards and above the article body.',
      group: 'content',
    },
    externalStoryUrl('article'),
    defineField({
      name: 'targetPage',
      title: 'Promotion destination',
      type: 'reference',
      weak: true,
      to: [{type: 'page'}],
      group: 'content',
      validation: (r) =>
        r.custom(
          (v, ctx) =>
            !v ||
            ctx.document?.excludeFromNews === true ||
            'Clear the promotion destination to turn this into a news story.',
        ),
      hidden: ({document}) =>
        !document?.targetPage &&
        (!document?.excludeFromNews ||
          Boolean(document?.externalUrl) ||
          !hostsDetailPage((document?.organizationRef as {_ref?: string})?._ref)),
    }),
    {...body, group: 'content', hidden: ({document}) => Boolean(document?.targetPage)},
    {...slug, group: 'content'},
    {...editorialImage, group: 'images'},
    {...gallery, group: 'images', hidden: offsiteArticle},
    defineField({
      name: 'excludeFromNews',
      group: 'publishing',
      title: 'Use as a promotional card only',
      type: 'boolean',
      initialValue: false,
      description:
        'Keep this card available for features and omit it from the chronological News listing.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Display date',
      description:
        'Shown on the listing and used to order news. Use Studio publishing controls to release a story.',
      group: 'publishing',
      type: 'datetime',
      options: eventClock,
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourceLink',
      hidden: offsiteArticle,
      group: 'content',
      title: 'Original story or source',
      type: 'link',
    }),
    defineField({
      name: 'relatedStories',
      hidden: offsiteArticle,
      group: 'content',
      title: 'See also',
      type: 'array',
      description: 'Select and reorder up to three related news stories.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (rule) => rule.unique().max(3),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      owner: 'organizationRef.title',
      url: 'externalUrl',
      promo: 'excludeFromNews',
      media: 'image',
    },
    prepare: ({title, owner, url, promo, media}) => ({
      title,
      media,
      subtitle: [owner, promo ? 'Promotion' : url ? 'External article' : 'On-site story']
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
export const event = defineType({
  name: 'event',
  icon: CalendarIcon,
  title: 'Event',
  type: 'document',
  groups: [contentGroup, imagesGroup, {name: 'schedule', title: 'Schedule'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    externalStoryUrl('event'),
    {...subtitle, group: 'content'},
    {...body, group: 'content'},
    defineField({
      ...slug,
      group: 'content',
      hidden: partnerEvent,
      validation: (rule) =>
        rule.custom(
          (value, {document}) =>
            partnerOwned(document) || validateContentSlug(value?.current, 'event'),
        ),
    }),
    {...mainImage, group: 'images'},
    {...gallery, group: 'images', hidden: partnerEvent},
    defineField({
      name: 'startsAt',
      group: 'schedule',
      title: 'Starts',
      type: 'datetime',
      options: eventClock,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'allDay',
      group: 'schedule',
      title: 'All day',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'endsAt',
      group: 'schedule',
      title: 'Ends',
      description:
        'For an exhibition, enter the closing date. For a weekly event, enter the end time of its first occurrence.',
      type: 'datetime',
      options: eventClock,
      validation: (r) =>
        r.custom(
          (v, ctx) =>
            !v ||
            !ctx.document?.startsAt ||
            new Date(v) >= new Date(String(ctx.document.startsAt)) ||
            'End must be after the start.',
        ),
    }),
    defineField({
      name: 'repeatsUntil',
      group: 'schedule',
      title: 'Repeat weekly through',
      description:
        'Optional. Repeats on the weekday of the first occurrence, at the same Los Angeles time, through this date inclusive.',
      type: 'date',
      validation: (rule) =>
        rule.custom((last, context) => {
          if (!last || !context.document?.startsAt) return true
          const localDay = new Intl.DateTimeFormat('en-CA', {timeZone: eventClock.displayTimeZone})
          const first = localDay.format(new Date(String(context.document.startsAt)))
          if (last < first) return 'The repeat end date must be on or after the first occurrence.'
          if (
            context.document.endsAt &&
            localDay.format(new Date(String(context.document.endsAt))) !== first
          )
            return 'A weekly occurrence must start and finish on the same Los Angeles date.'
          return true
        }),
    }),
    defineField({
      name: 'ticketLink',
      hidden: partnerEvent,
      title: 'Ticket link',
      group: 'schedule',
      type: 'object',
      fields: [
        defineField({name: 'label', title: 'Label', type: 'string', placeholder: 'Get Tickets'}),
        ...destinationFields,
      ],
      validation: (rule) => rule.custom(validDestination),
    }),
  ],
  preview: {
    select: {title: 'title', owner: 'organizationRef.title', date: 'startsAt', media: 'image'},
    prepare: ({title, date, owner, media}) => ({
      title,
      media,
      subtitle: [
        date &&
          new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeZone: eventClock.displayTimeZone,
          }).format(new Date(date)),
        owner,
      ]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
