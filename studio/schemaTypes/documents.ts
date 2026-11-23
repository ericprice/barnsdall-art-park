import {organizationReference} from './organization'
import {interfaceDefaults} from '../../shared/interface'
import {supportPageFields} from './support-subpages'
import {directoryFields, foundationHeadingsField} from './foundation'
import {ALL_FIELDS_GROUP, defineArrayMember, defineField, defineType} from 'sanity'
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
const editorialImage = defineField({name: 'image', type: 'editorialImage'})
const body = defineField({name: 'body', type: 'richText'})
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
    defineField({
      name: 'featuredNews',
      title: 'Featured news story',
      type: 'reference',
      to: [{type: 'article'}],
    }),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'headerMark', title: 'Header wordmark', type: 'parkImage'}),
    defineField({name: 'footerMark', title: 'Footer wordmark', type: 'parkImage'}),
    defineField({name: 'footerLinks', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({name: 'copyright', title: 'Copyright line', type: 'string'}),
    defineField({
      name: 'interfaceText',
      title: 'Navigation, forms and section labels',
      type: 'object',
      initialValue: interfaceDefaults,
      fields: Object.entries(interfaceDefaults).map(([name, initialValue]) =>
        defineField({
          name,
          type: 'string',
          initialValue,
          title:
            name === 'newsletterTitle'
              ? 'Newsletter signup prompt'
              : name.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
        }),
      ),
    }),
    defineField({
      name: 'sunsetLabel',
      title: 'Header sunset label',
      description: 'Appears after the sunset time calculated for Olive Hill each day.',
      type: 'string',
      initialValue: 'Sunset',
    }),
    defineField({
      name: 'cityRunLabel',
      title: 'Header city-run wording',
      type: 'string',
      initialValue: 'City-run since 1927',
    }),
    defineField({
      name: 'parkHoursLabel',
      title: 'Header park hours',
      type: 'string',
      initialValue: 'Open Until 10 PM',
    }),
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
      name: 'calendarResources',
      title: 'Calendar recurring program links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'calendarResource',
          type: 'object',
          fields: [title, summary, defineField({name: 'link', type: 'link'})],
          preview: {select: {title: 'title', subtitle: 'link.label'}},
        }),
      ],
    }),
    defineField({name: 'donationLink', type: 'link'}),
    defineField({
      name: 'newsletterUrl',
      type: 'url',
      description: 'Hosted signup page for the Foundation newsletter.',
    }),
    defineField({
      name: 'newsletterFormAction',
      title: 'Newsletter form submission URL',
      type: 'url',
      description:
        'The email-only HTTPS form action supplied by your newsletter provider. The footer submits directly to this URL by POST.',
      validation: (rule) => rule.uri({scheme: ['https']}),
    }),
    defineField({
      name: 'newsletterWidgetId',
      title: 'Contact page Bloomerang newsletter form ID',
      type: 'string',
      description:
        'The numeric ID of the newsletter signup widget in the Foundation’s Bloomerang account.',
      validation: (r) => r.regex(/^\d+$/),
    }),
    defineField({
      name: 'newsletterEmailField',
      title: 'Newsletter email field name',
      type: 'string',
      description:
        'Use the email field name specified by the provider (for example email or EMAIL). Defaults to email.',
    }),
    defineField({
      name: 'privacyUrl',
      title: 'Privacy policy URL',
      type: 'url',
      validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'termsUrl',
      title: 'Terms of use URL',
      type: 'url',
      validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https']}),
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
      name: 'featuredPlaces',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'place'}]})],
      validation: (r) => r.unique(),
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
  groups: [contentGroup, {name: 'settings', title: 'Page settings'}, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...slug, group: 'settings'},
    {...organizationReference, group: 'settings'},
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
    {...summary, group: 'content'},
    {...image, title: 'Main image', group: 'content'},
    {...body, group: 'content'},
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
export const place = defineType({
  name: 'place',
  icon: PinIcon,
  title: 'Park location',
  type: 'document',
  fields: [
    title,
    slug,
    defineField({
      name: 'directoryOrder',
      title: 'Park directory order',
      type: 'number',
      validation: (r) => r.integer().positive(),
    }),
    organizationReference,
    summary,
    image,
    body,
    defineField({
      name: 'website',
      type: 'link',
      description: 'Facility cards link directly to this website.',
    }),
  ],
  preview,
})
const featureCaption = defineField({
  name: 'featureCaption',
  title: 'Homepage link caption',
  type: 'string',
})
const gallery = defineField({
  name: 'gallery',
  title: 'Additional photographs',
  type: 'array',
  of: [defineArrayMember({type: 'parkImage'})],
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
    {...slug, group: 'publishing'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'storyDestination',
      group: 'publishing',
      title: 'Optional story destination',
      type: 'link',
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
        'Archived stories appear after current news. Leave the publication date blank when unknown.',
    }),
    {...gallery, group: 'images'},
    {...summary, group: 'content'},
    {...editorialImage, title: 'Main image', group: 'images'},
    {...body, group: 'content'},
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
  groups: [contentGroup, {name: 'schedule', title: 'Schedule'}, imagesGroup, hideAllFields],
  fields: [
    {...title, group: 'content'},
    {...slug, group: 'content'},
    defineField({
      ...organizationReference,
      group: 'content',
      validation: (rule) => rule.required(),
    }),
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
    {...summary, group: 'content'},
    {...image, title: 'Main image', group: 'images'},
    defineField({
      name: 'featureImage',
      group: 'images',
      title: 'Alternate homepage image',
      description: 'The homepage uses the main image when this is empty.',
      type: 'parkImage',
    }),
    {...gallery, group: 'images'},
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
    {...body, group: 'content'},
  ],
  preview,
})
