import {
  defineArrayMember,
  defineField,
  set,
  unset,
  useFormValue,
  type StringInputProps,
} from 'sanity'
import {Select} from '@sanity/ui'
import {rolesByLayout, sectionRoles} from '../../shared/page-layouts'

function SectionLayout({elementProps, value, onChange}: StringInputProps) {
  const template = useFormValue(['template'])
  const choices = rolesByLayout[String(template)] || []
  return (
    <Select
      {...elementProps}
      value={value || ''}
      onChange={(event) =>
        onChange(event.currentTarget.value ? set(event.currentTarget.value) : unset())
      }
    >
      <option value="">Choose a layout</option>
      {choices.map((choice) => (
        <option key={choice} value={choice}>
          {sectionRoles[choice]}
        </option>
      ))}
    </Select>
  )
}
const actions = defineField({
  name: 'links',
  title: 'Links',
  type: 'array',
  of: [
    defineArrayMember({type: 'link'}),
    defineArrayMember({
      name: 'download',
      title: 'File download',
      type: 'file',
      fields: [defineField({name: 'label', type: 'string', validation: (r) => r.required()})],
    }),
  ],
})
const title = defineField({name: 'title', type: 'string', validation: (r) => r.required()})
const body = defineField({name: 'body', type: 'richText'})
export const contentSections = defineField({
  name: 'contentSections',
  title: 'Sections',
  type: 'array',
  of: [
    defineArrayMember({
      name: 'contentSection',
      title: 'Section',
      type: 'object',
      fields: [
        title,
        defineField({
          name: 'role',
          title: 'Layout',
          type: 'string',
          components: {input: SectionLayout},
          validation: (rule) =>
            rule.required().custom(
              (role, ctx) =>
                !role ||
                (rolesByLayout[String(ctx.document?.template)] || []).includes(
                  role as keyof typeof sectionRoles,
                ) ||
                'Choose a layout available on this page.',
            ),
        }),
        defineField({
          name: 'anchor',
          title: 'Page anchor',
          type: 'string',
          description: 'Optional stable address after # for links to this section.',
          validation: (r) => r.regex(/^[\p{L}\p{N}_-]+$/u),
        }),
        body,
        defineField({
          name: 'image',
          type: 'parkImage',
          hidden: ({parent}) => Boolean(parent?.role && parent.role !== 'prose'),
        }),
        actions,
        defineField({
          name: 'entries',
          title: 'Items',
          type: 'array',
          hidden: ({parent}) => parent?.role !== 'columns',
          of: [
            defineArrayMember({
              name: 'sectionItem',
              type: 'object',
              fields: [title, body, actions],
            }),
          ],
        }),
      ],
      preview: {
        select: {title: 'title', role: 'role'},
        prepare: ({title, role}) => ({
          title,
          subtitle: sectionRoles[role as keyof typeof sectionRoles] || sectionRoles.prose,
        }),
      },
    }),
  ],
  validation: (rule) =>
    rule.custom((sections) => {
      const anchors = new Set<string>(),
        slots = new Set<string>()
      for (const {anchor, role} of (sections || []) as {anchor?: string; role?: string}[]) {
        if (anchor && anchors.has(anchor)) return 'Each page anchor must be unique.'
        if (anchor) anchors.add(anchor)
        if (role && !['prose', 'columns'].includes(role)) {
          if (slots.has(role)) return 'Use each special layout only once on a page.'
          slots.add(role)
        }
      }
      return true
    }),
})
