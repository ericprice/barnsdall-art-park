import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {publicOrganizationId} from '../shared/organizations'
import {structure, singletonTypes} from './structure'
export default defineConfig({
  name: 'default',
  title: 'Barnsdall Art Park Foundation',

  projectId: 'i18fhbsv',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  tools: (tools, {currentUser}) =>
    tools.filter(
      (tool) =>
        tool.name !== 'vision' ||
        currentUser?.roles.some((role) => ['administrator', 'developer'].includes(role.name)),
    ),
  document: {
    newDocumentOptions: (items, {creationContext}) =>
      creationContext.type === 'global'
        ? items.filter(
            (item) => !['support-page', 'visit-page', 'initiative-page'].includes(item.templateId),
          )
        : items,
    actions: (actions, context) => {
      if (
        context.schemaType === 'organization' &&
        publicOrganizationId(context.documentId) !== context.documentId
      )
        return []
      return singletonTypes.has(context.schemaType)
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : actions
    },
  },

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      {
        id: 'initiative-page',
        title: 'Initiative page',
        schemaType: 'page',
        value: {template: 'initiative', slug: {_type: 'slug', current: 'support/initiatives/'}},
      },
      ...['visit', 'support'].map((prefix) => ({
        id: prefix + '-page',
        title: prefix === 'visit' ? 'Visit page' : 'Support page',
        schemaType: 'page',
        value: {template: 'standard', slug: {_type: 'slug', current: prefix + '/'}},
      })),
    ],
  },
})
