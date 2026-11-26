import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from './route-link'
import type {ContentEntry} from '@/lib/content'
import {getNewsNeighbors} from '@/lib/news'
import {blockText} from '@/lib/body-layout'
import {scheduleLabel} from '@/lib/event-filters'
import {SidebarLinks} from './action-links'
import {ListingGrid} from './listing-card'
import {EntryDate} from './entry-meta'
import {PageHeading} from './page-heading'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'
import {PageSections} from './page-sections'
import {StoryGallery} from './story-gallery'
import {interfaceText as text} from '../../../shared/interface'

function subtitleComparison(text?: string | null) {
  return text?.trim().replace(/\.$/, '').toLowerCase()
}

export async function ListingStory({entry}: {entry: ContentEntry}) {
  const event = entry.type === 'event'
  const news = entry.type === 'article'
  const firstBlock = entry.body?.[0]
  const bodyIntro = firstBlock?._type === 'block' ? blockText(firstBlock) : undefined
  const showSummary =
    news &&
    entry.summary &&
    subtitleComparison(entry.summary) !== subtitleComparison(entry.subtitle) &&
    entry.summary !== bodyIntro
  const theme = themeForEntry(entry)
  const images = [...(entry.image ? [entry.image] : []), ...(entry.gallery || [])]
  const ticketLinks = entry.link?.href
    ? [{_key: 'tickets', href: entry.link.href, label: entry.link.label || text.getTickets}]
    : undefined
  const related = entry.relatedStories ?? []
  const {previous, next} = await getNewsNeighbors(entry)
  return (
    <main
      id="main-content"
      style={themeStyle(theme)}
      className={'listing-story ' + (news ? 'news-story' : 'programme-story')}
    >
      <article>
        <PageHeading
          title={entry.title}
          label={entry.organization}
          subtitle={entry.subtitle}
          className="listing-head"
        >
          {news && <EntryDate entry={entry} />}
        </PageHeading>
        <StoryGallery
          key={entry.id}
          images={images}
          showCaption={!event}
          orgTheme={news ? undefined : theme}
        />
        <div className="listing-story__columns">
          {event && (
            <aside className="programme-story__schedule">
              {entry.date && (
                <p>
                  <time dateTime={entry.date}>{scheduleLabel(entry, true)}</time>
                </p>
              )}
              <SidebarLinks label={text.getTickets} links={ticketLinks} />
            </aside>
          )}
          <div className="listing-story__body">
            {showSummary && <p className="listing-story__summary">{entry.summary}</p>}
            <RichText value={entry.body} orgTheme={event ? theme : undefined} />
            {!event && entry.link?.href && <Link href={entry.link.href}>{entry.link.label}</Link>}
          </div>
        </div>
        {entry.template === 'initiative' && <PageSections sections={entry.sections} />}
      </article>
      {news && related.length > 0 && (
        <section className="related-stories">
          <h2>{text.seeAlso}</h2>
          <ListingGrid entries={related} readMore={text.readMore} news />
        </section>
      )}
      {news && (previous || next) && (
        <nav className="listing-paging" aria-label="News stories">
          {previous && <Link href={previous}>‹‹ {text.previousStory}</Link>}
          {next && (
            <Link className="listing-paging__next" href={next}>
              {text.nextStory} »
            </Link>
          )}
        </nav>
      )}
      <QuoteBand />
    </main>
  )
}
