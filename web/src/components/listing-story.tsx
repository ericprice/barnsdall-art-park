import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import type {ContentEntry, SiteContent} from '@/lib/content'
import {scheduleLabel} from '@/lib/event-filters'
import {PageSections} from './page-sections'
import {ListingCard, ListingQuote, NewsCredit} from './listing-card'
import {RichText} from './rich-text'
import {StoryGallery} from './story-gallery'

export function ListingStory({
  entry,
  site,
  event,
}: {
  entry: ContentEntry
  site: SiteContent
  event: boolean
}) {
  const text = site.settings.interfaceText
  const organization = entry.organization || entry.venue?.title || entry.category
  const images = [...(entry.image ? [entry.image] : []), ...(entry.gallery || [])]
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
          <h1>{entry.title}</h1>
          {event ? <h2>{organization}</h2> : <NewsCredit entry={entry} />}
        </header>
        <StoryGallery
          text={text}
          key={entry.id}
          images={images}
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
              {entry.venue?.title && (
                <p>
                  {entry.venue.href ? (
                    <Link href={entry.venue.href}>{entry.venue.title}</Link>
                  ) : (
                    entry.venue.title
                  )}
                </p>
              )}
              {entry.link?.href && (
                <Link className="programme-story__tickets" href={entry.link.href}>
                  {entry.link.label || text.getTickets} »
                </Link>
              )}
            </aside>
          )}
          <div className="listing-story__body">
            {entry.summary && <p className="lead">{entry.summary}</p>}
            <RichText value={entry.body} />
            {event && <PageSections sections={entry.sections} />}
            {!event && entry.link?.href && <Link href={entry.link.href}>{entry.link.label}</Link>}
          </div>
        </div>
      </article>
      {!event && related.length > 0 && (
        <section className="related-stories">
          <h2>{text.seeAlso}</h2>
          <div className="listing-grid">
            {related.map((story) => (
              <ListingCard key={story.id} entry={story} readMore={text.readMore} news />
            ))}
          </div>
        </section>
      )}
      {!event && (previous || next) && (
        <nav className="listing-paging" aria-label="News stories">
          {previous && <Link href={previous.href}>‹‹ {text.previousStory}</Link>}
          {next && <Link href={next.href}>{text.nextStory} »</Link>}
        </nav>
      )}
      <ListingQuote quote={site.home.quote} />
    </main>
  )
}
