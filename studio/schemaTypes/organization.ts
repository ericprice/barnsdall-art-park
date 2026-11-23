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

export const imageArtFields = [
  defineField({
    name: 'treatment',
    title: 'Listing image treatment',
    type: 'string',
    options: {
      list: [
        {title: 'Organization duotone', value: 'organization'},
        {title: 'Cutout on an organic shape', value: 'cutout'},
        {title: 'Original colors', value: 'original'},
      ],
    },
  }),
  defineField({
    name: 'cutoutScale',
    title: 'Cutout scale',
    type: 'number',
    hidden: ({parent}) => parent?.treatment !== 'cutout',
    validation: (rule) => rule.min(0.25).max(3),
  }),
  ...['light', 'dark'].map((name) =>
    defineField({
      name,
      title: name === 'light' ? 'Custom highlight or cutout background' : 'Custom shadow',
      description: 'Optional six-digit hex color for art-directed images.',
      type: 'string',
      validation: (r) => r.regex(/^#[a-fA-F0-9]{6}$/),
    }),
  ),
]
