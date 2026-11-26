import {isCutout, themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from './route-link'
import type {InterfaceText} from '@/lib/content'
import type {getNewsPage} from '@/lib/news'
import {listingUrl} from './events-browser'
import {ListingGrid} from './listing-card'
import {EntryDate} from './entry-meta'
import {FeatureContent} from './feature-content'
import {QuoteBand} from './quote-band'
import {ParkImage} from './park-image'
import {PageSubtitle} from './page-heading'

export function NewsListing({
  listing,
  text,
  subtitle,
}: {
  listing: Awaited<ReturnType<typeof getNewsPage>>
  text: InterfaceText
  subtitle?: string
}) {
  const {featured, entries, page, totalPages} = listing
  const featuredCutout = isCutout(featured?.image)
  const pageHref = (n: number) => listingUrl('/news', {page: n > 1 ? String(n) : undefined})
  return (
    <main id="main-content" className="news-index listing">
      <header className="listing-head">
        <h1>{text.news}</h1>
        <PageSubtitle subtitle={subtitle} />
      </header>
      {featured && (
        <article
          className="news-feature"
          style={themeStyle(themeForEntry(featured), featuredCutout ? undefined : featured.image)}
        >
          <div
            className="news-feature__photo"
            data-treatment={featuredCutout ? 'cutout' : undefined}
          >
            <ParkImage
              editorial={!featuredCutout}
              orgTheme={themeForEntry(featured)}
              image={featured.image}
              sizes="(max-width: 44rem) 90vw, 45vw"
              priority
            />
          </div>
          <FeatureContent
            label={featured.organization}
            title={featured.title}
            meta={<EntryDate entry={featured} />}
            summary={featured.summary}
            link={{href: featured.href, label: text.readMore}}
          />
        </article>
      )}
      {entries.length > 0 && <ListingGrid entries={entries} readMore={text.readMore} news />}
      {!featured && !entries.length && <p className="listing-empty">{text.noNews}</p>}
      {totalPages > 1 && (
        <nav className="listing-paging" aria-label="News pages">
          {page < totalPages && <Link href={pageHref(page + 1)}>‹‹ {text.previousNews}</Link>}
          {page > 1 && (
            <Link className="listing-paging__next" href={pageHref(page - 1)}>
              {text.nextNews} »
            </Link>
          )}
        </nav>
      )}
      <QuoteBand />
    </main>
  )
}
