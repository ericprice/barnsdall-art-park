import {defineArrayMember, defineField, type ConditionalPropertyCallbackContext} from 'sanity'

const title = defineField({name: 'title', type: 'string', validation: (rule) => rule.required()})
const summary = defineField({name: 'summary', type: 'text', rows: 3})
const label = defineField({name: 'label', type: 'string'})
const link = defineField({name: 'link', type: 'link'})
const image = defineField({name: 'image', type: 'parkImage'})
const preview = {select: {title: 'title', subtitle: 'label', media: 'image'}}

function onlyOn(...slugs: string[]) {
  return ({document}: ConditionalPropertyCallbackContext) =>
    !slugs.some(
      (slug) => (document?.slug as {current?: string} | undefined)?.current === 'support/' + slug,
    )
}

export const supportPageFields = [
  defineField({
    name: 'supportLink',
    title: 'Supporter action',
    type: 'link',
    hidden: onlyOn('supporters'),
  }),
  defineField({
    name: 'supporterYears',
    title: 'Supporter acknowledgments',
    type: 'array',
    description:
      'Add a year or a named campaign. Reorder periods, groups and individual acknowledgments by dragging them. The first period opens on arrival.',
    hidden: onlyOn('supporters'),
    of: [
      defineArrayMember({
        name: 'supporterYear',
        type: 'object',
        fields: [
          defineField({...title, title: 'Year or campaign'}),
          defineField({
            name: 'groups',
            type: 'array',
            of: [
              defineArrayMember({
                name: 'supporterGroup',
                type: 'object',
                fields: [
                  title,
                  defineField({
                    name: 'layout',
                    type: 'string',
                    initialValue: 'names',
                    options: {
                      list: [
                        {title: 'Names in columns', value: 'names'},
                        {title: 'Organization logos', value: 'logos'},
                      ],
                      layout: 'radio',
                    },
                  }),
                  defineField({
                    name: 'supporters',
                    type: 'array',
                    of: [
                      defineArrayMember({
                        name: 'supporter',
                        type: 'object',
                        fields: [
                          defineField({
                            name: 'name',
                            type: 'string',
                            validation: (rule) => rule.required(),
                          }),
                          defineField({
                            name: 'note',
                            title: 'Recognition or dedication',
                            type: 'string',
                          }),
                          defineField({name: 'logo', type: 'parkImage'}),
                          defineField({name: 'url', title: 'Website', type: 'url'}),
                        ],
                        preview: {select: {title: 'name', subtitle: 'note', media: 'logo'}},
                      }),
                    ],
                  }),
                ],
                preview: {select: {title: 'title', subtitle: 'layout'}},
              }),
            ],
          }),
        ],
        preview: {select: {title: 'title'}},
      }),
    ],
  }),
  defineField({
    name: 'completedHeading',
    title: 'Past initiatives heading',
    type: 'string',
    hidden: onlyOn('initiatives'),
  }),
  defineField({
    name: 'initiativeCards',
    title: 'Initiatives',
    type: 'array',
    hidden: onlyOn('initiatives'),
    of: [
      defineArrayMember({
        name: 'initiativeCard',
        type: 'object',
        fields: [
          title,
          defineField({...label, title: 'Location or program'}),
          summary,
          image,
          link,
          defineField({
            name: 'completed',
            title: 'Completed initiative',
            type: 'boolean',
            initialValue: false,
          }),
          defineField({
            name: 'color',
            title: 'Shape color',
            type: 'string',
            initialValue: 'pale-green',
            options: {list: ['pale-green', 'lavender', 'green', 'yellow', 'olive', 'pink']},
          }),
        ],
        preview,
      }),
    ],
  }),
  defineField({
    name: 'donationSections',
    title: 'Donation page sections',
    type: 'array',
    hidden: onlyOn('donate'),
    of: [
      defineArrayMember({
        name: 'donationSection',
        type: 'object',
        fields: [
          defineField({
            name: 'kind',
            title: 'Layout',
            type: 'string',
            initialValue: 'text',
            options: {
              list: [
                {title: 'Featured initiative', value: 'feature'},
                {title: 'Text and link', value: 'text'},
                {title: 'Annual giving levels', value: 'levels'},
                {title: 'Other ways to give', value: 'ways'},
              ],
            },
          }),
          label,
          title,
          summary,
          image,
          link,
          defineField({
            name: 'ways',
            title: 'Ways to give',
            type: 'array',
            hidden: ({parent}) => parent?.kind !== 'ways',
            of: [
              defineArrayMember({
                name: 'givingMethod',
                type: 'object',
                fields: [title, summary, link],
                preview,
              }),
            ],
          }),
        ],
        preview,
      }),
    ],
  }),
  defineField({
    name: 'volunteerOpportunities',
    title: 'Volunteer opportunities',
    type: 'array',
    hidden: onlyOn('volunteer'),
    of: [
      defineArrayMember({
        name: 'volunteerOpportunity',
        type: 'object',
        fields: [title, summary, image, link],
        preview,
      }),
    ],
  }),
]
