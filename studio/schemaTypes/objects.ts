import {defineArrayMember, defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'
import {ImageIcon} from '@sanity/icons/Image'

const linkLabel = defineField({
  name: 'label',
  type: 'string',
  validation: (rule) => rule.required(),
})
const linkDestination = defineField({
  name: 'href',
  title: 'Destination',
  type: 'string',
  description: 'A site path (/visit), web address, mailto: or tel: link.',
  validation: (rule) =>
    rule.required().regex(/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/, {name: 'link destination'}),
})

export const socialLink = defineType({
  name: 'socialLink',
  title: 'Social link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    linkLabel,
    linkDestination,
    defineField({name: 'icon', title: 'Social media mark', type: 'parkImage'}),
  ],
  preview: {select: {title: 'label', subtitle: 'href', media: 'icon'}},
})

export const link = defineType({
  name: 'link',
  icon: LinkIcon,
  title: 'Link',
  type: 'object',
  fields: [linkLabel, linkDestination],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

const imageCaption = defineField({
  name: 'caption',
  type: 'string',
  description: 'Also used as the alternative text for this image.',
})

export const parkImage = defineType({
  name: 'parkImage',
  icon: ImageIcon,
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [imageCaption],
})

export const editorialImage = defineType({
  name: 'editorialImage',
  icon: ImageIcon,
  title: 'Featured artwork',
  type: 'image',
  options: {hotspot: true},
  fields: [
    imageCaption,
    defineField({
      name: 'presentation',
      title: 'Artwork presentation',
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

export const richText = defineType({
  name: 'richText',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Dotted link', value: 'dotLink'},
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
          defineArrayMember({name: 'download', title: 'File download', type: 'file'}),
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
