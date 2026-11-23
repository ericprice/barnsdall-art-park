import type {StructureResolver} from 'sanity/structure'
import {HomeIcon} from '@sanity/icons/Home'
import {CogIcon} from '@sanity/icons/Cog'

export const singletonTypes = new Set(['siteSettings', 'homePage'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Barnsdall')
    .items([
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.listItem()
        .title('History / Timeline')
        .child(
          S.documentTypeList('page')
            .title('History / Timeline')
            .filter('_type == "page" && template == "timeline"')
            .initialValueTemplates([S.initialValueTemplateItem('history-timeline')]),
        ),
      S.listItem()
        .title('Support the park')
        .child(
          S.documentTypeList('page')
            .title('Foundation, leadership, partners and giving')
            .filter(
              '_type == "page" && (slug.current == "support" || slug.current match "support/*")',
            ),
        ),
      S.documentTypeListItem('page').title('All pages'),
      S.documentTypeListItem('place').title('Park locations'),
      S.documentTypeListItem('organization').title('Organizations and colors'),
      S.documentTypeListItem('event').title('What’s on'),
      S.documentTypeListItem('article').title('News'),
    ])
