import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from './route-link'
import type {ContentEntry, SiteContent} from '@/lib/content'
import {scheduleLabel} from '@/lib/event-filters'
import {SidebarLinks} from './action-links'
import {ListingGrid} from './listing-card'
import {EntryDate, EntryLabel} from './entry-meta'
import {QuoteBand} from './quote-band'
import {RichText} from './rich-text'
import {StoryGallery} from './story-gallery'
import {interfaceText as text} from '../../../shared/interface'

export function ListingStory({
  entry,
  site,
  event,
}: {
  entry: ContentEntry
  site: SiteContent
  event: boolean
}) {
  const images = [...(entry.image ? [entry.image] : []), ...(entry.gallery || [])]
  const ticketLinks = entry.link?.href
    ? [{_key: 'tickets', href: entry.link.href, label: entry.link.label || text.getTickets}]
    : undefined
  const index = site.articles.findIndex((article) => article.id === entry.id)
  const related = (entry.relatedStoryIds || []).flatMap(
    (id) => site.articles.find((item) => item.id === id && id !== entry.id) || [],
  )
  const previous = index >= 0 ? site.articles[index + 1] : undefined
  const next = index > 0 ? site.articles[index - 1] : undefined
  return (
    <main
      id="main-content"
      style={themeStyle(themeForEntry(entry))}
      className={'listing-story ' + (event ? 'programme-story' : 'news-story')}
    >
      <article>
        <header className="listing-head">
          <EntryLabel label={entry.organization} large />
          <h1>{entry.title}</h1>
          {!event && <EntryDate entry={entry} />}
        </header>
        <StoryGallery
          text={text}
          key={entry.id}
          images={images}
          showCaption={!event}
          orgTheme={event ? themeForEntry(entry) : undefined}
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
            {entry.summary && (
              <p className={event ? 'listing-story__summary lead' : 'listing-story__summary'}>
                {entry.summary}
              </p>
            )}
            <RichText value={entry.body} orgTheme={event ? themeForEntry(entry) : undefined} />
            {!event && entry.link?.href && <Link href={entry.link.href}>{entry.link.label}</Link>}
          </div>
        </div>
      </article>
      {!event && related.length > 0 && (
        <section className="related-stories">
          <h2>{text.seeAlso}</h2>
          <ListingGrid entries={related} readMore={text.readMore} news />
        </section>
      )}
      {!event && (previous || next) && (
        <nav className="listing-paging" aria-label="News stories">
          {previous && <Link href={previous.href}>‹‹ {text.previousStory}</Link>}
          {next && (
            <Link className="listing-paging__next" href={next.href}>
              {text.nextStory} »
            </Link>
          )}
        </nav>
      )}
      <QuoteBand quote={site.settings.quotes} />
    </main>
  )
}
