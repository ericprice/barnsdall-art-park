import type {StructureResolver} from 'sanity/structure'
import {HomeIcon} from '@sanity/icons/Home'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentsIcon} from '@sanity/icons/Documents'
import {PinIcon} from '@sanity/icons/Pin'
import {HeartIcon} from '@sanity/icons/Heart'
import {ClockIcon} from '@sanity/icons/Clock'
import {historyPageId} from '../shared/page-layouts'
import {interfaceText} from '../shared/interface'

export const singletonTypes = new Set(['siteSettings', 'homePage'])

export const structure: StructureResolver = (S) => {
  const section = (prefix: string, title: string, icon: typeof PinIcon) =>
    S.listItem()
      .title(title)
      .icon(icon)
      .child(
        S.documentTypeList('page')
          .title(title)
          .filter(
            '_type == "page" && (slug.current == $prefix || string::startsWith(slug.current, $prefix + "/"))',
          )
          .params({prefix})
          .initialValueTemplates([
            S.initialValueTemplateItem(prefix + '-page'),
            ...(prefix === 'support' ? [S.initialValueTemplateItem('initiative-page')] : []),
          ]),
      )
  return S.list()
    .title('Barnsdall')
    .items([
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Pages')
            .items([
              S.documentTypeListItem('page')
                .title('All Pages')
                .child(
                  S.documentTypeList('page')
                    .title('All Pages')
                    .initialValueTemplates([S.initialValueTemplateItem('page')]),
                ),
              section('visit', 'Visit', PinIcon),
              section('support', interfaceText.support, HeartIcon),
              S.listItem()
                .title('History')
                .icon(ClockIcon)
                .child(S.document().schemaType('page').documentId(historyPageId)),
            ]),
        ),
      S.documentTypeListItem('place').title('Park Locations'),
      S.documentTypeListItem('event').title(interfaceText.whatsOn),
      S.documentTypeListItem('article').title('News'),
      S.divider(),
      S.documentTypeListItem('organization').title('Organizations'),
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
}
