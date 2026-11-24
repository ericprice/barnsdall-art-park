import {defineArrayMember, defineField, type ConditionalPropertyCallbackContext} from 'sanity'

const title = defineField({name: 'title', type: 'string', validation: (rule) => rule.required()})
const summary = defineField({name: 'summary', type: 'text', rows: 3})
const label = defineField({name: 'label', type: 'string'})
const link = defineField({name: 'link', type: 'link'})
const image = defineField({name: 'image', type: 'parkImage'})
function logoGroup({document, path}: ConditionalPropertyCallbackContext) {
  const [year, group] = [path?.[1], path?.[3]]
  const years = document?.supporterYears as
    {_key: string; groups?: {_key: string; layout?: string}[]}[] | undefined
  return (
    typeof year === 'object' &&
    '_key' in year &&
    typeof group === 'object' &&
    '_key' in group &&
    years
      ?.find((value) => value._key === year._key)
      ?.groups?.find((value) => value._key === group._key)?.layout === 'logos'
  )
}
const preview = {select: {title: 'title', subtitle: 'label', media: 'image'}}

function onlyOn(...slugs: string[]) {
  return ({document}: ConditionalPropertyCallbackContext) =>
    !slugs.includes(String(document?.template))
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
                            description: 'Appears beneath the name when no logo is shown.',
                            hidden: (ctx) => Boolean(logoGroup(ctx) && ctx.parent?.logo?.asset),
                            type: 'string',
                          }),
                          defineField({
                            name: 'logo',
                            type: 'parkImage',
                            hidden: (ctx) => !logoGroup(ctx),
                          }),
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
          defineField({
            name: 'completed',
            title: 'Completed initiative',
            type: 'boolean',
            initialValue: false,
          }),
          {
            ...image,
            hidden: ({parent}: ConditionalPropertyCallbackContext) => Boolean(parent?.completed),
          },
          link,
          defineField({
            name: 'color',
            hidden: ({parent}) => Boolean(parent?.completed),
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
          {
            ...image,
            hidden: ({parent}: ConditionalPropertyCallbackContext) => parent?.kind !== 'feature',
          },
          link,
          defineField({
            name: 'levels',
            title: 'Annual giving levels',
            type: 'array',
            hidden: ({parent}) => parent?.kind !== 'levels',
            of: [
              defineArrayMember({
                name: 'givingLevel',
                type: 'object',
                fields: [title, summary, link],
                preview,
              }),
            ],
          }),
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
]
