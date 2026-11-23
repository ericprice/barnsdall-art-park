import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const organization = defineType({
  name: 'organization',
  title: 'Organization',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Display name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    ...['light', 'dark'].map((name) =>
      defineField({
        name,
        title: name === 'light' ? 'Highlight color' : 'Shadow color',
        description: 'Six-digit hex color, including #.',
        type: 'string',
        validation: (r) => r.required().regex(/^#[a-fA-F0-9]{6}$/),
      }),
    ),
  ],
  preview: {select: {title: 'title'}},
})

export const organizationReference = defineField({
  name: 'organizationRef',
  title: 'Organization',
  type: 'reference',
  to: [{type: 'organization'}],
})
