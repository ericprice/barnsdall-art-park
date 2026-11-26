import type {Metadata} from 'next'
import {DisplayLinkContent} from '@/components/display-link'
import {SearchResultCard} from '@/components/listing-card'
import {PageHeading} from '@/components/page-heading'
import Link from '@/components/route-link'
import {searchResultPage} from '@/lib/search'
import {interfaceText} from '../../../../shared/interface'
import './search-page.scss'

export const metadata: Metadata = {
  title: interfaceText.search,
  robots: {index: false, follow: false},
}

const graphemes = new Intl.Segmenter(undefined, {granularity: 'grapheme'})
const headingQueryLimit = 24

function resultsHeading(query: string) {
  if (!query) return 'Search results'
  const characters = Array.from(graphemes.segment(query), ({segment}) => segment)
  const label =
    characters.length > headingQueryLimit
      ? characters.slice(0, headingQueryLimit).join('') + '…'
      : query
  return `Results for “${label}”`
}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{q?: string | string[]; page?: string | string[]}>
}) {
  const {q, page: requestedPage} = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 200) ?? ''
  const {entries, hasMore, page} = await searchResultPage(
    query,
    Number(Array.isArray(requestedPage) ? requestedPage[0] : requestedPage),
  )

  return (
    <main id="main-content" className="search-page listing">
      <PageHeading title={resultsHeading(query)} />
      {entries.length > 0 && (
        <ul className="search-page__grid listing-grid" role="list" aria-label="Search results">
          {entries.map((entry) => (
            <li key={entry.id}>
              <SearchResultCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
      {query && !entries.length && <p className="listing-empty">{interfaceText.noResults}</p>}
      {hasMore && (
        <nav className="listing-paging search-page__paging" aria-label="More search results">
          <Link
            href={'/search?' + new URLSearchParams({q: query, page: String(page + 1)})}
            prefetch={false}
            scroll={false}
          >
            <DisplayLinkContent>{interfaceText.loadMore}</DisplayLinkContent>
          </Link>
        </nav>
      )}
    </main>
  )
}
