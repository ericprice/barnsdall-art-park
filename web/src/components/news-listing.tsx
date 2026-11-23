import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import type {ContentEntry, SiteContent, InterfaceText} from '@/lib/content'
import {listingUrl, type ListingParams} from './events-browser'
import {ListingCard, ListingQuote, NewsCredit} from './listing-card'
import {ListingFilter} from './listing-filter'
import {ParkImage} from './park-image'

export function NewsListing({
  articles,
  featuredId,
  params,
  quote,
  text,
}: {
  articles: ContentEntry[]
  featuredId?: string
  params: ListingParams
  text: InterfaceText
  quote?: SiteContent['home']['quote']
}) {
  const organizations = [...new Set(articles.map((a) => a.organization || a.category))].sort()
  const selected = organizations.includes(params.organization || '') ? params.organization! : ''
  const filtered = articles.filter((a) => !selected || (a.organization || a.category) === selected)
  const pageSize = 9
  const lead = filtered.find((article) => article.id === featuredId) ?? filtered[0]
  const otherArticles = filtered.filter((article) => article !== lead)
  const totalPages = Math.max(1, Math.ceil(otherArticles.length / pageSize))
  const page = Math.min(totalPages, Math.max(1, parseInt(params.page || '1') || 1))
  const featured = page === 1 ? lead : null
  const entries = otherArticles.slice((page - 1) * pageSize, page * pageSize)
  const pageHref = (n: number) =>
    listingUrl('/news', {organization: selected, page: n > 1 ? String(n) : undefined})
  return (
    <main id="main-content" className="news-index listing">
      <header className="listing-head">
        <h1>{text.news}</h1>
        <div className="listing-filters">
          <ListingFilter
            label={text.organization}
            all={text.all}
            value={selected}
            choices={organizations}
            hrefs={['', ...organizations].map((org) => listingUrl('/news', {organization: org}))}
          />
        </div>
      </header>
      {featured && (
        <article
          className="news-feature"
          style={themeStyle(themeForEntry(featured), featured.image)}
        >
          <div className="news-feature__photo">
            <ParkImage
              orgTheme={themeForEntry(featured)}
              image={featured.image}
              sizes="(max-width: 44rem) 90vw, 45vw"
              priority
            />
          </div>
          <h2>
            <Link href={featured.href}>{featured.title}</Link>
          </h2>
          <NewsCredit entry={featured} />
          {featured.summary && <p className="news-feature__summary">{featured.summary}</p>}
          <Link className="news-feature__read" href={featured.href}>
            {text.readMore} »
          </Link>
        </article>
      )}
      {entries.length > 0 && (
        <div className="listing-grid">
          {entries.map((entry) => (
            <ListingCard key={entry.id} entry={entry} readMore={text.readMore} news />
          ))}
        </div>
      )}
      {!filtered.length && <p className="listing-empty">{text.noNews}</p>}
      {totalPages > 1 && (
        <nav className="listing-paging" aria-label="News pages">
          {page < totalPages && <Link href={pageHref(page + 1)}>‹‹ {text.previousNews}</Link>}
          {page > 1 && <Link href={pageHref(page - 1)}>{text.nextNews} »</Link>}
        </nav>
      )}
      <ListingQuote quote={quote} />
    </main>
  )
}
