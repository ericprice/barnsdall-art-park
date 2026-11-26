import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {ImageIcon} from '@sanity/icons/Image'
import {DottedLinkStyle, LeadStyle, PullQuoteStyle} from './body-styles'

const label = defineField({name: 'label', type: 'string', validation: (rule) => rule.required()})
const destinationPattern = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/
export const destinationFields = [
  defineField({
    name: 'internal',
    title: 'Site page',
    type: 'reference',
    weak: true,
    to: ['page', 'place', 'event', 'article'].map((type) => ({type})),
    hidden: ({parent}) => Boolean(parent?.href && !parent?.internal),
  }),
  defineField({
    name: 'href',
    title: 'URL or fragment',
    type: 'string',
    description: 'For external websites, email, telephone, or a specific site path or anchor.',
    hidden: ({parent}) => Boolean(parent?.internal && !parent?.href),
    validation: (rule) => rule.regex(destinationPattern),
  }),
]
type Destination = {internal?: {_ref?: string}; href?: string}
export const validDestination = (value: Destination | undefined) =>
  !value ||
  Boolean(value.internal?._ref) !== Boolean(value.href) ||
  'Choose a site page or enter one URL.'

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    label,
    defineField({
      name: 'href',
      title: 'Website',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https', 'http']}),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})
export const link = defineType({
  name: 'link',
  icon: LinkIcon,
  title: 'Link',
  type: 'object',
  fields: [label, ...destinationFields],
  validation: (rule) => rule.custom(validDestination),
  preview: {
    select: {title: 'label', url: 'href', page: 'internal.title'},
    prepare: ({title, url, page}) => ({title, subtitle: page || url}),
  },
})

const imageFields = [
  defineField({
    name: 'decorative',
    title: 'Decorative image',
    type: 'boolean',
    description: 'Screen readers skip decorative images.',
  }),
  defineField({
    name: 'alt',
    title: 'Alternative text',
    type: 'string',
    hidden: ({document, parent}) =>
      Boolean(parent?.decorative) ||
      (document?._type === 'page' && document?.template === 'timeline'),
  }),
  defineField({
    name: 'caption',
    type: 'string',
    description: 'Visible credit or caption where the layout includes one.',
  }),
]
export const parkImage = defineType({
  name: 'parkImage',
  icon: ImageIcon,
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: imageFields,
})
export const editorialImage = defineType({
  name: 'editorialImage',
  icon: ImageIcon,
  title: 'Featured artwork',
  type: 'image',
  options: {hotspot: true},
  fields: [
    ...imageFields,
    defineField({
      name: 'presentation',
      title: 'Card and feature treatment',
      type: 'string',
      initialValue: 'organization',
      options: {
        list: [
          {title: 'Organization colors', value: 'organization'},
          {title: 'Rose duotone', value: 'rose'},
          {title: 'Cutout on rose', value: 'roseCutout'},
          {title: 'Close-up cutout on organization color', value: 'closeCutout'},
        ],
      },
    }),
  ],
})

export const quoteFields = [
  defineField({name: 'text', type: 'text', rows: 3, validation: (rule) => rule.required()}),
  defineField({name: 'attribution', type: 'string'}),
]
const inlineLink = defineArrayMember({
  name: 'link',
  title: 'Link',
  icon: LinkIcon,
  type: 'object',
  fields: destinationFields,
  validation: (rule) => rule.custom(validDestination),
})
const emphasis = {title: 'Italic', value: 'em'}

export const footerProse = defineType({
  name: 'footerProse',
  title: 'Footer text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Paragraph', value: 'normal'}],
      lists: [],
      marks: {decorators: [emphasis], annotations: [inlineLink]},
    }),
  ],
})

export const richText = defineType({
  name: 'richText',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Lead', value: 'lead', component: LeadStyle},
        {title: 'Pull quote', value: 'pullQuote', component: PullQuoteStyle},
        {
          title: 'Dotted link (link the entire paragraph)',
          value: 'dotLink',
          component: DottedLinkStyle,
        },
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
      ],
      marks: {
        decorators: [emphasis],
        annotations: [
          defineArrayMember({name: 'download', title: 'File download', type: 'file'}),
          inlineLink,
        ],
      },
      validation: (rule) =>
        rule.custom((value) => {
          const block = value as
            | {
                style?: string
                children?: {text?: string; marks?: string[]}[]
                markDefs?: {_key: string}[]
              }
            | undefined
          if (block?.style !== 'dotLink') return true
          const spans = block.children?.filter(
            (span) => 'text' in span && typeof span.text === 'string' && span.text.length,
          )
          return (
            Boolean(
              spans?.length &&
              block.markDefs?.some((mark) =>
                spans.every((span) => Array.isArray(span.marks) && span.marks.includes(mark._key)),
              ),
            ) || 'Link the entire paragraph to one destination.'
          )
        }),
    }),
    defineArrayMember({type: 'parkImage'}),
  ],
})
