import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'i18fhbsv',
    dataset: 'production',
  },
  deployment: {
    appId: 'xq92o78e2z9s4txvvty46eny',
    // Ship the Studio runtime verified against the schema and package lock.
    autoUpdates: false,
  },
  typegen: {
    enabled: true,
    path: '../web/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
  },
})
