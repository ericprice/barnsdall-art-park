import type {ContentEntry} from './content'

const zone = 'America/Los_Angeles'
const losAngelesDay = new Intl.DateTimeFormat('en-CA', {timeZone: zone})
const localTime = new Intl.DateTimeFormat('en-US', {
  timeZone: zone,
  hour: 'numeric',
  minute: '2-digit',
})
const weekday = new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', weekday: 'long'})
const dayLabel = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const monthLabel = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
})
type Schedule = Pick<ContentEntry, 'date' | 'endsAt' | 'repeatsUntil' | 'allDay'>

export function eventDay(value: string): string | undefined {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? undefined : losAngelesDay.format(date)
}

// Perform calendar arithmetic on date-only keys after converting timestamps into park time.
// A seven-day interval then retains its weekday and wall-clock time through daylight saving.
function dayNumber(day: string) {
  return Date.parse(day + 'T00:00:00Z') / 86400000
}
function dateAfter(day: string, count: number) {
  return new Date((dayNumber(day) + count) * 86400000).toISOString().slice(0, 10)
}
export function eventBounds(event: Schedule) {
  const start = event.date && eventDay(event.date)
  if (!start) return
  if (event.repeatsUntil) {
    const weeks = Math.floor((dayNumber(event.repeatsUntil) - dayNumber(start)) / 7)
    if (!Number.isFinite(weeks) || weeks < 0) return
    return {start, end: dateAfter(start, weeks * 7)}
  }
  return {start, end: (event.endsAt && eventDay(event.endsAt)) || start}
}
export function overlapsDays(event: Schedule, from: string, to: string) {
  const bounds = eventBounds(event)
  if (!bounds || from > to || bounds.start > to || bounds.end < from) return false
  if (!event.repeatsUntil || from <= bounds.start) return true
  const next = dateAfter(
    bounds.start,
    Math.ceil((dayNumber(from) - dayNumber(bounds.start)) / 7) * 7,
  )
  return next <= to && next <= bounds.end
}
export function filterEvents(
  events: ContentEntry[],
  options: {
    q?: string
    kind?: string
    from?: string
    to?: string
    archive?: boolean
    today: string
  },
) {
  return events.filter((event) => {
    if (
      options.q &&
      ![event.title, event.summary, event.organization]
        .join(' ')
        .toLowerCase()
        .includes(options.q.toLowerCase())
    )
      return false
    if (options.kind && event.kind !== options.kind) return false
    if (options.from || options.to)
      return overlapsDays(event, options.from || '0001-01-01', options.to || '9999-12-31')
    const end = eventBounds(event)?.end
    return options.archive ? !!end && end < options.today : !end || end >= options.today
  })
}
export function validMonth(value: string | undefined, fallback: string) {
  return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : fallback
}
export function adjacentMonth(month: string, delta: number) {
  const d = new Date(month + '-01T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + delta)
  return d.toISOString().slice(0, 7)
}
export function monthRange(month: string) {
  const d = new Date(month + '-01T00:00:00Z')
  const offset = (d.getUTCDay() + 6) % 7 // Monday first, as in the calendar wireframe.
  d.setUTCMonth(d.getUTCMonth() + 1, 0)
  return {from: month + '-01', to: d.toISOString().slice(0, 10), days: d.getUTCDate(), offset}
}
export function readableMonth(month: string) {
  return monthLabel.format(new Date(month + '-01T00:00:00Z'))
}
export function readableDate(date: string) {
  const day = eventDay(date)
  return day ? dayLabel.format(new Date(day + 'T00:00:00Z')) : ''
}
export function scheduleLabel(event: Schedule, full = false) {
  const bounds = eventBounds(event)
  if (!event.date || !bounds) return ''
  const first = new Date(bounds.start + 'T00:00:00Z')
  const last = new Date(bounds.end + 'T00:00:00Z')
  const range = dayLabel.formatRange(first, last).replace(/\s*–\s*/g, ' – ')
  if (!event.repeatsUntil && bounds.end !== bounds.start) return range

  let label = event.repeatsUntil ? 'Every ' + weekday.format(first) : dayLabel.format(first)
  if (event.repeatsUntil && full) label += ', ' + range
  if (!event.allDay) {
    const clock = (v: string) =>
      localTime.format(new Date(v)).replace(':00', '').replace(/\s/g, '').toLowerCase()
    label += '  ' + clock(event.date)
    if (full && event.endsAt && event.endsAt !== event.date) label += '–' + clock(event.endsAt)
  }
  return label
}

// Group a continuing exhibition or weekly series under each month in which it actually happens.
export function eventMonths(
  events: ContentEntry[],
  today: string,
  archive: boolean,
  limit: number,
) {
  const groups = new Map<string, ContentEntry[]>()
  for (const event of filterEvents(events, {today, archive})) {
    const bounds = eventBounds(event)
    if (!bounds) continue
    const first = (archive || bounds.start >= today ? bounds.start : today).slice(0, 7)
    const last = bounds.end.slice(0, 7)
    let month = archive ? last : first
    let included = 0
    while (included < limit && month >= first && month <= last) {
      const {from, to} = monthRange(month)
      if (overlapsDays(event, !archive && from < today ? today : from, to)) {
        const entries = groups.get(month) || []
        entries.push(event)
        groups.set(month, entries)
        included++
      }
      month = adjacentMonth(month, archive ? -1 : 1)
    }
  }
  const sorted = [...groups].sort(([a], [b]) => (archive ? b.localeCompare(a) : a.localeCompare(b)))
  return sorted.slice(0, limit)
}

export function monthlyCalendar(events: ContentEntry[], month: string) {
  const range = monthRange(month)
  const entries = events.filter((event) => overlapsDays(event, range.from, range.to))
  const points: ContentEntry[] = []
  const spans: {event: ContentEntry; firstDay: number; lastDay: number; lane: number}[] = []
  for (const event of entries) {
    const bounds = eventBounds(event)!
    if (event.repeatsUntil || bounds.start === bounds.end) {
      points.push(event)
    } else {
      const firstDay = bounds.start < range.from ? 1 : Number(bounds.start.slice(-2))
      const lastDay = bounds.end > range.to ? range.days : Number(bounds.end.slice(-2))
      spans.push({event, firstDay, lastDay, lane: 0})
    }
  }

  // Keep overlapping exhibitions on separate tracks throughout the displayed month.
  spans.sort((a, b) => a.firstDay - b.firstDay || b.lastDay - a.lastDay)
  const trackEnds: number[] = []
  for (const span of spans) {
    const available = trackEnds.findIndex((end) => end < span.firstDay)
    span.lane = available < 0 ? trackEnds.length : available
    trackEnds[span.lane] = span.lastDay
  }

  const weeks = Array.from({length: Math.ceil((range.offset + range.days) / 7)}, (_, index) => {
    const first = Math.max(1, index * 7 - range.offset + 1)
    const last = Math.min(range.days, (index + 1) * 7 - range.offset)
    const column = (ordinal: number) => ((range.offset + ordinal - 1) % 7) + 1
    const days = Array.from({length: last - first + 1}, (_, offset) => {
      const ordinal = first + offset
      const date = month + '-' + String(ordinal).padStart(2, '0')
      return {
        date,
        ordinal,
        column: column(ordinal),
        events: points.filter((event) => overlapsDays(event, date, date)),
      }
    })
    const bars = spans
      .filter((span) => span.firstDay <= last && span.lastDay >= first)
      .map((span) => {
        const start = Math.max(first, span.firstDay)
        const end = Math.min(last, span.lastDay)
        return {
          event: span.event,
          lane: span.lane,
          column: column(start),
          length: end - start + 1,
          label: start === span.firstDay,
        }
      })
    return {days, bars}
  })
  return {entries, weeks}
}
