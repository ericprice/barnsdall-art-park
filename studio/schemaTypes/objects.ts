import {imageArtFields} from './organization'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {ImageIcon} from '@sanity/icons/Image'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const link = defineType({
  name: 'link',
  icon: LinkIcon,
  title: 'Link',
  type: 'object',
  fields: [
    defineField({name: 'icon', title: 'Icon (optional)', type: 'parkImage'}),
    defineField({
      name: 'attachment',
      title: 'Downloadable file',
      type: 'file',
      hidden: ({path}) => !(path.includes('sections') && path.includes('links')),
      description: 'Upload a file to use it as the destination of this section link.',
    }),
    defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'sectionLabel',
      title: 'Section navigation label',
      description: 'Use a shorter label below the page title.',
      type: 'string',
      hidden: ({path}) => !path.includes('navigation'),
    }),
    defineField({
      name: 'href',
      title: 'Destination',
      type: 'string',
      description: 'A site path (/visit), web address, mailto: or tel: link.',
      validation: (r) =>
        r.custom(
          (v, context) =>
            (!v &&
              Boolean((context.parent as {attachment?: {asset?: unknown}})?.attachment?.asset)) ||
            /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(v || '') ||
            'Enter a site path or an http, https, mailto or tel address.',
        ),
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

export const parkImage = defineType({
  name: 'parkImage',
  icon: ImageIcon,
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      validation: (r) =>
        r.required().warning('Describe the image for people using a screen reader.'),
    }),
    defineField({name: 'caption', type: 'string'}),
    defineField({name: 'credit', type: 'string'}),
    ...imageArtFields,
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
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                validation: (r) =>
                  r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({type: 'parkImage'}),
  ],
})

export const seo = defineType({
  name: 'seo',
  icon: DocumentTextIcon,
  title: 'Search & sharing',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.max(60).warning()}),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(160).warning(),
    }),
    defineField({name: 'image', title: 'Social image', type: 'parkImage'}),
  ],
})

export const contentSection = defineType({
  name: 'contentSection',
  title: 'Page section',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'anchor',
      type: 'string',
      description: 'A unique link target on this page, for example getting-here.',
      validation: (r) => r.required().regex(/^[a-z][a-z0-9-]*$/, {name: 'lowercase link target'}),
    }),
    defineField({name: 'lead', type: 'text', rows: 3}),
    defineField({name: 'body', type: 'richText'}),
    defineField({name: 'image', type: 'parkImage'}),
    defineField({name: 'links', type: 'array', of: [defineArrayMember({type: 'link'})]}),
    defineField({
      name: 'collapsible',
      title: 'Collapse entries into an accordion',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'entries',
      title: 'Related entries',
      description: 'For a vision, leadership group, questions, or ways to support the park.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'sectionEntry',
          type: 'object',
          fields: [
            defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'body', type: 'richText'}),
            defineField({name: 'link', type: 'link'}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'anchor', media: 'image'}},
})
