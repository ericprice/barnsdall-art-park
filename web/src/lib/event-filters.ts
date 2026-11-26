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
  if (!event.date) return
  const start = eventDay(event.date)
  if (!start) return
  // Sanity imports and incomplete review drafts can bypass Studio validation.
  const endsAt =
    event.endsAt && Date.parse(event.endsAt) >= Date.parse(event.date) ? event.endsAt : undefined
  if (event.repeatsUntil) {
    const weeks = Math.floor((dayNumber(event.repeatsUntil) - dayNumber(start)) / 7)
    if (Number.isFinite(weeks) && weeks >= 0)
      return {start, end: dateAfter(start, weeks * 7), endsAt, weekly: true}
  }
  return {start, end: (endsAt && eventDay(endsAt)) || start, endsAt, weekly: false}
}
export function overlapsDays(event: Schedule, from: string, to: string) {
  const bounds = eventBounds(event)
  if (!bounds || from > to || bounds.start > to || bounds.end < from) return false
  if (!bounds.weekly || from <= bounds.start) return true
  const next = dateAfter(
    bounds.start,
    Math.ceil((dayNumber(from) - dayNumber(bounds.start)) / 7) * 7,
  )
  return next <= to && next <= bounds.end
}
function adjacentMonth(month: string, delta: number) {
  const d = new Date(month + '-01T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + delta)
  return d.toISOString().slice(0, 7)
}
export function monthRange(month: string) {
  const d = new Date(month + '-01T00:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + 1, 0)
  return {from: month + '-01', to: d.toISOString().slice(0, 10), days: d.getUTCDate()}
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
  if (!bounds.weekly && bounds.end !== bounds.start) return range

  let label = bounds.weekly ? 'Every ' + weekday.format(first) : dayLabel.format(first)
  if (bounds.weekly && full) label += ', ' + range
  if (!event.allDay) {
    const clock = (v: string) =>
      localTime.format(new Date(v)).replace(':00', '').replace(/\s/g, '').toLowerCase()
    label += (full ? '\n' : '  ') + clock(event.date)
    if (full && bounds.endsAt && bounds.endsAt !== event.date) label += '–' + clock(bounds.endsAt)
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
  for (const event of events) {
    const bounds = eventBounds(event)
    if (!bounds || (archive ? bounds.end >= today : bounds.end < today)) continue
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
