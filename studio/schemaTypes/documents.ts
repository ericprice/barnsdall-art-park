import {organizationReference} from './organization'
import {hostsNewsPage, isExternalNewsLink} from '../../shared/organizations'
import {supportPageFields} from './support-subpages'
import {directoryFields, foundationHeadingsField} from './foundation'
import {
  ALL_FIELDS_GROUP,
  defineArrayMember,
  defineField,
  defineType,
  type ConditionalPropertyCallback,
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
  options: {source: 'title'},
  validation: (r) => r.required(),
})
const summary = defineField({name: 'summary', type: 'text', rows: 3})
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
    address: '4800 Hollywood Blvd\nLos Angeles, CA 90027',
  },
  title: 'Site settings',
  type: 'document',
  fields: [
    title,
    defineField({name: 'description', type: 'text', rows: 3}),
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
            defineField({name: 'href', type: 'string'}),
            defineField({name: 'children', type: 'array', of: [defineArrayMember({type: 'link'})]}),
          ],
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
    defineField({name: 'address', type: 'text', rows: 2}),
    defineField({name: 'contactEmail', type: 'string', validation: (r) => r.email()}),
    defineField({
      name: 'socialLinks',
      type: 'array',
      of: [defineArrayMember({type: 'socialLink'})],
    }),
    defineField({name: 'footerText', type: 'text', rows: 5}),
    defineField({name: 'landAcknowledgment', type: 'text', rows: 4}),
  ],
})

export const homePage = defineType({
  name: 'homePage',
  icon: HomeIcon,
  initialValue: {title: 'Home'},
  title: 'Homepage',
  type: 'document',
  fields: [
    title,
    defineField({name: 'historyLink', title: 'History section link', type: 'link'}),
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
      name: 'featuredContent',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'event'}, {type: 'article'}, {type: 'place'}, {type: 'page'}],
        }),
      ],
      validation: (r) => r.max(6).unique(),
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
      name: 'quote',
      type: 'object',
      fields: [
        defineField({
          name: 'additional',
          title: 'More quotations',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'quotation',
              type: 'object',
              fields: [
                defineField({name: 'text', type: 'text', rows: 3}),
                defineField({name: 'attribution', type: 'string'}),
                defineField({name: 'link', type: 'link'}),
              ],
              preview: {select: {title: 'text', subtitle: 'attribution'}},
            }),
          ],
        }),
        defineField({name: 'text', type: 'text', rows: 3}),
        defineField({name: 'attribution', type: 'string'}),
        defineField({name: 'link', type: 'link'}),
      ],
    }),
    defineField({
      name: 'timeline',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'milestone',
          type: 'object',
          fields: [
            defineField({name: 'year', type: 'string', validation: (r) => r.required()}),
            summary,
            defineField({name: 'link', type: 'link'}),
          ],
          preview: {select: {title: 'year', subtitle: 'summary'}},
        }),
      ],
    }),
  ],
})

export const page = defineType({
  name: 'page',
  icon: DocumentIcon,
  title: 'Page',
  type: 'document',
  groups: [contentGroup, imagesGroup, {name: 'settings', title: 'Page settings'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...slug, group: 'content'},
    {...organizationReference, group: 'content'},
    {...summary, group: 'content'},
    {...body, group: 'content'},
    {...mainImage, group: 'images'},
    defineField({
      name: 'template',
      group: 'settings',
      type: 'string',
      initialValue: 'standard',
      options: {
        list: [
          {title: 'Standard / story', value: 'standard'},
          {title: 'Visit', value: 'visit'},
          {title: 'Foundation', value: 'foundation'},
          {title: 'Initiative', value: 'initiative'},
          {title: 'History / Timeline', value: 'timeline'},
        ],
      },
    }),
    {...foundationHeadingsField, group: 'content'},
    ...directoryFields.map((field) => ({...field, group: 'content'})),
    defineField({
      name: 'timelineHeading',
      group: 'content',
      title: 'Timeline section heading',
      type: 'string',
      hidden: ({parent}) =>
        parent?.template !== 'timeline' &&
        !['history', 'timeline', 'grove-history'].includes(parent?.slug?.current),
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
          ],
          preview: {select: {title: 'dateLabel', subtitle: 'description', media: 'image'}},
        }),
      ],
      hidden: ({parent}) =>
        parent?.template !== 'timeline' &&
        !['history', 'timeline', 'grove-history'].includes(parent?.slug?.current),
    }),
    ...supportPageFields.map((field) => ({...field, group: 'content'})),
    defineField({
      name: 'givingLevels',
      group: 'content',
      hidden: ({document}) =>
        (document?.slug as {current?: string} | undefined)?.current !== 'support/donate',
      title: 'Annual giving program',
      description:
        'Up to three approved giving levels. Link to the external donation provider; no payment details are collected here.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'givingLevel',
          fields: [title, summary, defineField({name: 'link', type: 'link'})],
        }),
      ],
      validation: (r) => r.max(3),
    }),
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
    {...slug, group: 'content'},
    {...organizationReference, group: 'content'},
    {...summary, group: 'content'},
    defineField({
      name: 'externalUrl',
      title: 'Website',
      group: 'content',
      type: 'url',
      description: 'Enter the destination for a location with its own website.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'subtitle', group: 'content', type: 'string', hidden: linksOut}),
    {...body, group: 'content', hidden: linksOut},
    {...sidebarLinks, group: 'content', hidden: linksOut},
    {...gallery, group: 'images', hidden: linksOut},
  ],
  preview: {select: {title: 'title', subtitle: 'externalUrl', media: 'gallery.0'}},
})
const featureCaption = defineField({
  name: 'featureCaption',
  title: 'Homepage link caption',
  type: 'string',
})
const eventClock = {displayTimeZone: 'America/Los_Angeles'}

export const article = defineType({
  name: 'article',
  icon: DocumentTextIcon,
  title: 'News',
  type: 'document',
  groups: [contentGroup, imagesGroup, {name: 'publishing', title: 'Publishing'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...slug, group: 'content'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    {...summary, group: 'content'},
    {...body, group: 'content'},
    {...editorialImage, group: 'images'},
    {...gallery, group: 'images'},
    defineField({
      name: 'storyDestination',
      group: 'content',
      title: 'Article destination',
      type: 'link',
      description:
        'Enter the original article URL for partner news. The Foundation and The Park can leave this blank to use an on-site story.',
      validation: (rule) =>
        rule.custom((link, context) => {
          const organization = context.document?.organizationRef as {_ref?: string} | undefined
          if (!organization?._ref || hostsNewsPage(organization._ref)) return true
          return (
            isExternalNewsLink((link as {href?: string} | undefined)?.href) ||
            'Enter an external article URL for this organization.'
          )
        }),
    }),
    defineField({
      name: 'excludeFromNews',
      group: 'publishing',
      title: 'Use as a promotional card only',
      type: 'boolean',
      initialValue: false,
      description:
        'Keep this card available for features and omit it from the chronological News listing.',
    }),
    {...featureCaption, group: 'publishing'},
    defineField({
      name: 'featureBackground',
      group: 'images',
      title: 'Homepage shape color',
      description: 'Optional six-digit hex color for a feature without an image.',
      type: 'string',
      validation: (r) => r.regex(/^#[a-fA-F0-9]{6}$/),
    }),
    defineField({
      name: 'featureImage',
      group: 'images',
      title: 'Homepage image',
      type: 'editorialImage',
    }),
    defineField({name: 'publishedAt', group: 'publishing', type: 'datetime', options: eventClock}),
    defineField({
      name: 'sourceLink',
      group: 'content',
      title: 'Original story or source',
      type: 'link',
    }),
    defineField({
      name: 'archiveEntry',
      group: 'publishing',
      title: 'File in the news archive',
      type: 'boolean',
      initialValue: false,
      description:
        'Marks a story imported from the archive. Leave the publication date blank when unknown.',
    }),
    defineField({
      name: 'relatedStories',
      group: 'content',
      title: 'See also',
      type: 'array',
      description: 'Select and reorder up to three related news stories.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'article'}]})],
      validation: (rule) => rule.unique().max(3),
    }),
  ],
  preview,
})
export const event = defineType({
  name: 'event',
  icon: CalendarIcon,
  title: 'Event',
  type: 'document',
  groups: [contentGroup, imagesGroup, {name: 'schedule', title: 'Schedule'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...slug, group: 'content'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    {...summary, group: 'content'},
    {...body, group: 'content'},
    defineField({
      name: 'kind',
      group: 'content',
      title: 'Event type',
      type: 'string',
      options: {
        list: [
          'Exhibition',
          'Performance',
          'Screening',
          'Tour',
          'Workshop',
          'Community',
          'Foundation',
        ],
      },
    }),
    {...mainImage, group: 'images'},
    {...gallery, group: 'images'},
    defineField({
      name: 'featureImage',
      group: 'images',
      title: 'Homepage image',
      description: 'The homepage uses the main image when this is empty.',
      type: 'parkImage',
    }),
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
    defineField({name: 'ticketLink', group: 'content', type: 'link'}),
  ],
  preview,
})
