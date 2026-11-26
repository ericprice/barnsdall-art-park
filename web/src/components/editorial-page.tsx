import type {ReactNode} from 'react'
import type {ContentEntry} from '@/lib/content'
import {SidebarLinks} from './action-links'
import {PageHeading, type PageHeadingNavigation} from './page-heading'
import {RichText} from './rich-text'
import {StoryGallery} from './story-gallery'
import './editorial-page.scss'

export function EditorialPage({
  entry,
  title = entry.title,
  navigation,
  label,
  introHeading,
  children,
  afterBody,
  className,
}: {
  entry: ContentEntry
  title?: string
  navigation?: PageHeadingNavigation
  label?: string
  introHeading?: string
  children?: ReactNode
  afterBody?: ReactNode
  className?: string
}) {
  const images = entry.gallery?.length ? entry.gallery : entry.image ? [entry.image] : []
  return (
    <main
      id="main-content"
      className={className ? `editorial-page ${className}` : 'editorial-page'}
    >
      <PageHeading title={title} subtitle={entry.subtitle} label={label} navigation={navigation} />
      <StoryGallery key={entry.id} images={images} showCaption />
      <div className="editorial-page__columns">
        <SidebarLinks
          links={entry.sidebarLinks}
          label={entry.title}
          className="editorial-page__links"
        />
        <div className="editorial-page__body">
          {introHeading && <h2 className="mission-heading">{introHeading}</h2>}
          <RichText value={entry.body} />
          {children}
        </div>
      </div>
      {afterBody}
    </main>
  )
}
