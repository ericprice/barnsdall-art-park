import assert from 'node:assert/strict'
import test from 'node:test'
import {
  eventDay,
  eventMonths,
  monthlyCalendar,
  scheduleLabel,
  filterEvents,
  monthRange,
  overlapsDays,
  validMonth,
} from '../src/lib/event-filters.ts'
const exhibition = {
  id: 'exhibition',
  title: 'Long exhibition',
  href: '/event',
  organization: 'Gallery',
  date: '2027-01-01T19:00:00Z',
  endsAt: '2027-04-01T00:00:00Z',
}
const undated = {
  id: 'undated',
  title: 'Community gathering',
  href: '/gathering',
  organization: 'Foundation',
}
test('an exhibition is shown throughout its date span, including a month it began before', () => {
  assert.equal(overlapsDays(exhibition, '2027-02-01', '2027-02-28'), true)
  assert.equal(overlapsDays(exhibition, '2027-03-31', '2027-03-31'), true)
  assert.equal(overlapsDays(exhibition, '2027-04-01', '2027-04-30'), false)
})
test('event days use Los Angeles time at midnight and across daylight saving', () => {
  assert.equal(eventDay('2027-04-01T00:00:00Z'), '2027-03-31')
  assert.equal(eventDay('2027-03-15T07:00:00Z'), '2027-03-15')
  assert.equal(eventDay('2027-03-14T07:30:00Z'), '2027-03-13')
  assert.equal(eventDay('invalid'), undefined)
})
test('undated events remain discoverable but do not appear on arbitrary calendar days or in the archive', () => {
  assert.deepEqual(
    filterEvents([exhibition, undated], {today: '2027-04-01'}).map((e) => e.id),
    ['undated'],
  )
  assert.deepEqual(
    filterEvents([exhibition, undated], {today: '2027-04-01', archive: true}).map((e) => e.id),
    ['exhibition'],
  )
  assert.equal(overlapsDays(undated, '2027-02-01', '2027-02-28'), false)
})
test('organization search and dates combine instead of replacing one another', () => {
  assert.equal(
    filterEvents([exhibition, undated], {
      today: '2027-02-01',
      q: 'no match',
      from: '2027-02-01',
      to: '2027-02-28',
    }).length,
    0,
  )
  assert.equal(
    filterEvents([exhibition], {
      today: '2027-02-01',
      q: 'GALLERY',
      from: '2027-02-01',
      to: '2027-02-28',
    }).length,
    1,
  )
})
test('calendar validation handles invalid months, leap years, and year boundaries', () => {
  assert.equal(validMonth('2027-13', '2027-10'), '2027-10')
  assert.equal(validMonth('not-a-month', '2027-10'), '2027-10')
  assert.equal(monthRange('2028-02').days, 29)
  assert.equal(monthRange('2027-12').to, '2027-12-31')
})

const fridays = {
  id: 'fridays',
  title: 'Fridays at Barnsdall',
  organization: 'Foundation',
  href: '/fridays',
  date: '2027-03-06T02:00:00Z',
  endsAt: '2027-03-06T06:00:00Z',
  repeatsUntil: '2027-05-31',
}
test('weekly events appear only on their weekday, including Fridays after LA changes clocks', () => {
  for (const day of ['2027-03-05', '2027-03-12', '2027-03-19', '2027-05-28']) {
    assert.equal(overlapsDays(fridays, day, day), true)
  }
  for (const day of ['2027-02-26', '2027-03-06', '2027-03-20', '2027-05-31', '2027-06-04']) {
    assert.equal(overlapsDays(fridays, day, day), false)
  }
  assert.equal(overlapsDays(fridays, '2027-04-01', '2027-04-30'), true)
  assert.equal(filterEvents([fridays], {today: '2027-05-29', archive: true}).length, 1)
})
test('single-day events never spill onto the next UTC calendar day', () => {
  const event = {...fridays, repeatsUntil: null}
  assert.equal(overlapsDays(event, '2027-03-05', '2027-03-05'), true)
  assert.equal(overlapsDays(event, '2027-03-06', '2027-03-06'), false)
})

test('upcoming months skip an exhausted partial month without truncating later weekly dates', () => {
  const groups = eventMonths([fridays], '2027-03-30', false, 2)
  assert.deepEqual(
    groups.map(([month]) => month),
    ['2027-04', '2027-05'],
  )
  assert.deepEqual(
    groups.map(([, entries]) => entries.length),
    [1, 1],
  )
})

test('dates, weekly hours, and full season bounds are readable without conflating a series and an exhibition', () => {
  assert.equal(scheduleLabel(fridays), 'Every Friday  6pm')
  const detail = scheduleLabel(fridays, true)
  assert.match(detail, /Mar 5/)
  assert.match(detail, /May 28, 2027/)
  assert.match(detail, /\n6pm–10pm$/)
  assert.match(scheduleLabel(exhibition), /Jan 1.*Mar 31, 2027/)
})

test('a continuing exhibition covers every February day with four full-width week bars and a single label', () => {
  const {weeks} = monthlyCalendar([exhibition], '2027-02')
  assert.deepEqual(
    weeks.map((week) => week.bars[0].length),
    [7, 7, 7, 7],
  )
  assert.equal(weeks.flatMap((week) => week.bars).filter((bar) => bar.label).length, 1)
  assert.equal(weeks.flatMap((week) => week.days).flatMap((day) => day.events).length, 0)
})

test('the calendar clips overlapping spans at weekday boundaries and places weekly occurrences on Friday only', () => {
  const shorter = {
    ...exhibition,
    id: 'shorter',
    date: '2027-03-03T18:00:00Z',
    endsAt: '2027-03-09T18:00:00Z',
  }
  const {weeks, entries} = monthlyCalendar([exhibition, shorter, fridays], '2027-03')
  const bars = weeks.flatMap((week) => week.bars).filter((bar) => bar.event.id === 'shorter')
  assert.deepEqual(
    bars.map((bar) => [bar.column, bar.length, bar.lane]),
    [
      [3, 5, 1],
      [1, 2, 1],
    ],
  )
  assert.deepEqual(
    weeks
      .flatMap((week) => week.days)
      .filter((day) => day.events.some((e) => e.id === 'fridays'))
      .map((day) => day.ordinal),
    [5, 12, 19, 26],
  )
  assert.equal(entries.length, 3)
})
