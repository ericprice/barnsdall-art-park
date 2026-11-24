import type {ContentEntry} from '@/lib/content'
import {readableDate, scheduleLabel} from '@/lib/event-filters'

export function EntryLabel({label, large = false}: {label?: string | null; large?: boolean}) {
  if (!label) return null
  return <p className={large ? 'entry-label entry-label--large' : 'entry-label'}>{label}</p>
}

export function EntryDate({entry}: {entry: ContentEntry}) {
  if (!entry.date) return null
  return (
    <time className="entry-date" dateTime={entry.date}>
      {entry.type === 'event' ? scheduleLabel(entry) : readableDate(entry.date)}
    </time>
  )
}
