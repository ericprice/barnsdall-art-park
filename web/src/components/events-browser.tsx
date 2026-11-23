import {themeForEntry, themeStyle} from '@/lib/image-theme'
import Link from 'next/link'
import type {ContentEntry, SiteContent, InterfaceText} from '@/lib/content'
import {
  adjacentMonth,
  eventDay,
  eventBounds,
  monthRange,
  eventMonths,
  monthlyCalendar,
  scheduleLabel,
  readableMonth,
  validMonth,
} from '@/lib/event-filters'
import {ListingCard, ListingQuote} from './listing-card'
import {CalendarMonthSelect} from './calendar-month-select'
import {ListingFilter} from './listing-filter'

export type ListingParams = {
  view?: string
  period?: string
  month?: string
  organization?: string
  kind?: string
  page?: string
}
export function listingUrl(path: string, params: ListingParams) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (typeof value === 'string' && value) query.set(key, value)
  return query.size ? path + '?' + query : path
}
function Calendar({
  events,
  month,
  today,
  resources,
  filters,
  text,
  href,
}: {
  events: ContentEntry[]
  month: string
  today: string
  resources: SiteContent['settings']['calendarResources']
  filters: React.ReactNode
  text: InterfaceText
  href: (changes: ListingParams) => string
}) {
  const {weeks, entries} = monthlyCalendar(events, month)
  const monthChoices = new Set(Array.from({length: 25}, (_, i) => adjacentMonth(month, i - 12)))
  monthChoices.add(today.slice(0, 7))
  for (const event of events) {
    const bounds = eventBounds(event)
    if (bounds) {
      monthChoices.add(bounds.start.slice(0, 7))
      monthChoices.add(bounds.end.slice(0, 7))
    }
  }
  const choices = [...monthChoices]
    .sort()
    .map((value) => ({value, label: readableMonth(value), href: href({month: value})}))
  const spans = entries.filter(
    (event) =>
      !event.repeatsUntil &&
      event.date &&
      event.endsAt &&
      eventDay(event.date) !== eventDay(event.endsAt),
  )
  const continues = spans.some((event) => (eventBounds(event)?.end || '') > monthRange(month).to)
  const nextMonth = adjacentMonth(month, 1)

  return (
    <section className="programme-calendar" aria-label={text.calendar}>
      <div className="programme-calendar__filters">{filters}</div>
      <div className="programme-calendar__grid">
        <div className="programme-calendar__controls">
          <Link href={href({month: adjacentMonth(month, -1)})} aria-label="Previous month">
            ‹ {text.previous}
          </Link>
          <CalendarMonthSelect month={month} choices={choices} />
          <Link href={href({month: adjacentMonth(month, 1)})} aria-label="Next month">
            {text.next} ›
          </Link>
          <Link href={href({month: today.slice(0, 7)})}>{text.today}</Link>
        </div>
        <div className="programme-calendar__weekdays" aria-hidden="true">
          {Array.from({length: 7}, (_, i) =>
            new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'UTC'}).format(
              Date.UTC(2024, 0, 1 + i),
            ),
          ).map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="programme-calendar__weeks">
          {weeks.map(({days, bars}) => (
            <div key={days[0].date} className="programme-calendar__week">
              <ol className="programme-calendar__days">
                {days.map(({date, ordinal, column, events: occurrences}) => (
                  <li key={date} style={{gridColumnStart: column}}>
                    <time dateTime={date} aria-current={date === today ? 'date' : undefined}>
                      {ordinal}
                    </time>
                    {occurrences.map((event) => (
                      <Link
                        className="programme-calendar__point"
                        style={themeStyle(themeForEntry(event))}
                        key={event.id}
                        href={event.href}
                        aria-label={event.title}
                      >
                        <span>{event.title}</span>
                      </Link>
                    ))}
                  </li>
                ))}
              </ol>
              {bars.length > 0 && (
                <div className="programme-calendar__bars">
                  {bars.map(({event, column, length, lane, label}) => (
                    <Link
                      key={event.id}
                      href={event.href}
                      aria-label={event.title + ', ' + scheduleLabel(event)}
                      tabIndex={label ? undefined : -1}
                      className="programme-calendar__bar"
                      style={{
                        ...themeStyle(themeForEntry(event)),
                        gridColumn: column + ' / span ' + length,
                        gridRow: lane + 1,
                      }}
                    >
                      {label && <span>{event.title}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {!!spans.length && (
          <ul className="programme-calendar__legend">
            {spans.map((event) => (
              <li key={event.id} style={themeStyle(themeForEntry(event))}>
                <Link href={event.href}>{event.title}</Link> · {scheduleLabel(event)}
              </li>
            ))}
          </ul>
        )}
        {continues && (
          <Link href={href({month: nextMonth})}>
            {text.continuesIn.replace('{month}', readableMonth(nextMonth))} »
          </Link>
        )}
      </div>
      {!!resources?.length && (
        <aside className="programme-calendar__resources">
          <h2>{text.calendarPrograms}</h2>
          {resources.map((item) => (
            <section key={item._key}>
              <h3>{item.title}</h3>
              {item.summary && <p>{item.summary}</p>}
              {item.link?.href && <Link href={item.link.href}>{item.link.label} »</Link>}
            </section>
          ))}
        </aside>
      )}
      {entries.length > 0 && (
        <section className="programme-calendar__summary">
          <h2>{text.monthEvents.replace('{month}', readableMonth(month).split(' ')[0])}</h2>
          <ul>
            {entries.map((entry) => (
              <li key={entry.id}>
                <h3>
                  <Link href={entry.href}>{entry.title}</Link>
                </h3>
                <p>{entry.organization || entry.venue?.title || entry.category}</p>
                {entry.date && <time dateTime={entry.date}>{scheduleLabel(entry)}</time>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

export function EventsBrowser({
  events,
  params,
  resources,
  quote,
  text,
}: {
  events: ContentEntry[]
  params: ListingParams
  resources?: SiteContent['settings']['calendarResources']
  text: InterfaceText
  quote?: SiteContent['home']['quote']
}) {
  const today = eventDay(new Date().toISOString())!
  const calendar = params.view === 'calendar'
  const archive = !calendar && params.period === 'archive'
  const month = validMonth(params.month, today.slice(0, 7))
  const count = Math.max(1, Math.min(200, parseInt(params.page || '1') || 1)) * 2
  const organization = (e: ContentEntry) => e.organization || e.venue?.title || e.category
  const organizations = [...new Set(events.map(organization))].sort()
  const kinds = [...new Set(events.flatMap((e) => (e.kind ? [e.kind] : [])))].sort()
  const org = organizations.includes(params.organization || '') ? params.organization! : ''
  const kind = kinds.includes(params.kind || '') ? params.kind! : ''
  const filtered = events.filter(
    (event) => (!org || organization(event) === org) && (!kind || event.kind === kind),
  )
  const groups = calendar ? [] : eventMonths(filtered, today, archive, count + 1)
  const href = (change: ListingParams) =>
    listingUrl('/whats-on', {
      view: calendar ? 'calendar' : undefined,
      period: archive ? 'archive' : undefined,
      month: calendar ? month : undefined,
      organization: org,
      kind,
      ...change,
    })
  const filters = (
    <div className="listing-filters">
      <ListingFilter
        label={text.organization}
        all={text.all}
        value={org}
        choices={organizations}
        hrefs={['', ...organizations].map((v) => href({organization: v}))}
      />
      <ListingFilter
        label={text.eventType}
        all={text.all}
        value={kind}
        choices={kinds}
        hrefs={['', ...kinds].map((v) => href({kind: v}))}
      />
    </div>
  )
  return (
    <main id="main-content" className="programme listing">
      <header className="listing-head">
        <h1>{text.whatsOn}</h1>
        <nav className="listing-tabs" aria-label="Event views">
          <Link
            href={href({view: undefined, period: undefined, month: undefined})}
            aria-current={!calendar && !archive ? 'page' : undefined}
          >
            {text.upcoming}
          </Link>
          <Link
            href={href({view: undefined, period: 'archive', month: undefined})}
            aria-current={archive ? 'page' : undefined}
          >
            {text.archive}
          </Link>
          <Link
            href={href({view: 'calendar', period: undefined})}
            aria-current={calendar ? 'page' : undefined}
          >
            {text.calendar}
          </Link>
        </nav>
        {!calendar && filters}
      </header>
      {calendar ? (
        <Calendar
          resources={resources}
          filters={filters}
          text={text}
          events={filtered}
          month={month}
          today={today}
          href={href}
        />
      ) : (
        <>
          {groups.slice(0, count).map(([key, entries]) => (
            <section key={key} className="programme-month">
              <h2>{readableMonth(key)}</h2>
              <div className="listing-grid">
                {entries.map((entry) => (
                  <ListingCard entry={entry} key={entry.id} />
                ))}
              </div>
            </section>
          ))}
          {!groups.length && <p className="listing-empty">{text.noEvents}</p>}
          <nav className="listing-paging" aria-label="Event listings">
            {!archive && <Link href={href({period: 'archive'})}>‹‹ {text.previousEvents}</Link>}
            {groups.length > count && (
              <Link href={href({page: String(count / 2 + 1)})} scroll={false}>
                {text.loadMore} »
              </Link>
            )}
          </nav>
        </>
      )}
      <ListingQuote quote={quote} />
    </main>
  )
}
