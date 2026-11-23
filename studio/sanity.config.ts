import {defineConfig, type InitialValueResolverContext} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes} from './structure'
import {createHistoryStudioPage, historyPhotos} from '../shared/history-timeline'

export default defineConfig({
  name: 'default',
  title: 'Barnsdall Art Park Foundation',

  projectId: 'i18fhbsv',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  document: {
    actions: (actions, context) =>
      singletonTypes.has(context.schemaType)
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : actions,
  },

  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
      {
        id: 'history-timeline',
        title: 'History / Timeline',
        schemaType: 'page',
        value: async (_params: unknown, {getClient}: InitialValueResolverContext) => {
          const assets = await getClient({apiVersion: '2026-10-23'}).fetch<
            {_id: string; sha1hash: string}[]
          >('*[_type == "sanity.imageAsset" && sha1hash in $hashes]{_id, sha1hash}', {
            hashes: historyPhotos.map((photo) => photo.sha1),
          })
          const assetsByPath: Record<string, string> = {}
          for (const photo of historyPhotos) {
            const asset = assets.find((item) => item.sha1hash === photo.sha1)
            if (asset) assetsByPath[photo.path] = asset._id
          }
          return createHistoryStudioPage(assetsByPath)
        },
      },
    ],
  },
})
