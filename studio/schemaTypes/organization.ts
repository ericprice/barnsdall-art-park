import {createElement} from 'react'
import {ColorPair} from './organization-preview'
import {OrganizationColorInput} from './organization-color-input'
import {defineField, defineType, type SortOrdering} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const organizationDisplayOrder: SortOrdering = {
  name: 'displayOrder',
  title: 'Display order',
  by: [
    {field: 'displayOrder', direction: 'asc'},
    {field: 'title', direction: 'asc'},
  ],
}

export const organization = defineType({
  name: 'organization',
  title: 'Organization',
  type: 'document',
  icon: TagIcon,
  orderings: [organizationDisplayOrder],
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
        description: 'Choose a color or enter a six-digit hex value, including #.',
        type: 'string',
        components: {input: OrganizationColorInput},
        validation: (r) => r.required().regex(/^#[a-fA-F0-9]{6}$/),
      }),
    ),
    defineField({
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description:
        'Lower numbers appear first in Organizations. Leave blank to sort by name after numbered entries.',
      validation: (r) => r.integer().min(1),
    }),
  ],
  preview: {
    select: {title: 'title', light: 'light', dark: 'dark'},
    prepare: ({title, light, dark}) => ({
      title,
      subtitle: [light, dark].filter(Boolean).join(' / '),
      media: () => createElement(ColorPair, {light, dark}),
    }),
  },
})

export const organizationReference = defineField({
  name: 'organizationRef',
  title: 'Organization',
  type: 'reference',
  to: [{type: 'organization'}],
})
