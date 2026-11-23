import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {ImageIcon} from '@sanity/icons/Image'
import {foundationHeadings} from '../../shared/foundation'

export const foundationPerson = defineType({
  name: 'foundationPerson',
  title: 'Person',
  type: 'object',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Full name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({name: 'role', title: 'Foundation role', type: 'string'}),
    defineField({name: 'affiliation', title: 'Professional title or affiliation', type: 'string'}),
    defineField({name: 'bio', title: 'Biography', type: 'text', rows: 3}),
    defineField({name: 'profileUrl', title: 'Profile link', type: 'url'}),
  ],
  preview: {
    select: {title: 'name', role: 'role', affiliation: 'affiliation'},
    prepare: ({title, role, affiliation}) => ({title, subtitle: role || affiliation}),
  },
})

export const foundationPartner = defineType({
  name: 'foundationPartner',
  title: 'Partner',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Organization name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({name: 'logo', title: 'Logo', type: 'parkImage'}),
    defineField({name: 'website', title: 'Website', type: 'url'}),
  ],
  preview: {select: {title: 'name', subtitle: 'website', media: 'logo'}},
})

export const directoryFields = [
  {name: 'boardMembers', title: 'Board of directors', type: 'foundationPerson'},
  {name: 'staffMembers', title: 'Staff', type: 'foundationPerson'},
  {name: 'partners', title: 'Partner logos', type: 'foundationPartner'},
].map(({name, title, type}) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [defineArrayMember({type})],
    hidden: ({parent, value}) =>
      parent?.template !== 'foundation' && parent?.slug?.current !== 'support' && value == null,
  }),
)

export const foundationHeadingsField = defineField({
  name: 'foundationHeadings',
  title: 'Foundation section headings',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: Object.entries(foundationHeadings).map(([name, title]) =>
    defineField({name, title, type: 'string'}),
  ),
  hidden: ({parent}) => parent?.template !== 'foundation' && parent?.slug?.current !== 'support',
})
