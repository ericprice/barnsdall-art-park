import Link from 'next/link'
import type {ContentEntry, SiteContent, InterfaceText} from '@/lib/content'
import {eventDay, eventMonths, readableMonth} from '@/lib/event-filters'
import {ListingGrid, ListingQuote} from './listing-card'
import {ListingFilter} from './listing-filter'

export type ListingParams = {
  period?: string
  organization?: string
  page?: string
}
export function listingUrl(path: string, params: ListingParams) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (typeof value === 'string' && value) query.set(key, value)
  return query.size ? path + '?' + query : path
}
export function EventsBrowser({
  events,
  params,
  quote,
  text,
}: {
  events: ContentEntry[]
  params: ListingParams
  text: InterfaceText
  quote?: SiteContent['home']['quote']
}) {
  const today = eventDay(new Date().toISOString())!
  const archive = params.period === 'archive'
  const count = Math.max(1, Math.min(200, parseInt(params.page || '1') || 1)) * 2
  const organizations = [...new Set(events.flatMap((event) => event.organization || []))].sort()
  const org = organizations.includes(params.organization || '') ? params.organization! : ''
  const filtered = org ? events.filter((event) => event.organization === org) : events
  const groups = eventMonths(filtered, today, archive, count + 1)
  const href = (change: ListingParams) =>
    listingUrl('/whats-on', {
      period: archive ? 'archive' : undefined,
      organization: org,
      ...change,
    })
  return (
    <main id="main-content" className="programme listing">
      <header className="listing-head">
        <h1>{text.whatsOn}</h1>
        <nav className="listing-tabs" aria-label="Event views">
          <Link href={href({period: undefined})} aria-current={!archive ? 'page' : undefined}>
            {text.upcoming}
          </Link>
          <Link href={href({period: 'archive'})} aria-current={archive ? 'page' : undefined}>
            {text.archive}
          </Link>
        </nav>
        <div className="listing-filters">
          <ListingFilter
            label={text.organization}
            all={text.all}
            value={org}
            choices={organizations}
            hrefs={['', ...organizations].map((value) => href({organization: value}))}
          />
        </div>
      </header>
      {groups.slice(0, count).map(([key, entries]) => (
        <section key={key} className="programme-month">
          <h2>{readableMonth(key)}</h2>
          <ListingGrid entries={entries} />
        </section>
      ))}
      {!groups.length && <p className="listing-empty">{text.noEvents}</p>}
      <nav className="listing-paging" aria-label="Event listings">
        {!archive && <Link href={href({period: 'archive'})}>‹‹ {text.previousEvents}</Link>}
        {groups.length > count && (
          <Link className="listing-paging__next" href={href({page: String(count / 2 + 1)})} scroll={false}>
            {text.loadMore} »
          </Link>
        )}
      </nav>
      <ListingQuote quote={quote} />
    </main>
  )
}
