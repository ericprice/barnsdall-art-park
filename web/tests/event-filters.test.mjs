import assert from 'node:assert/strict'
import test from 'node:test'
import {
  eventDay,
  eventMonths,
  scheduleLabel,
  monthRange,
  overlapsDays,
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
test('undated drafts have no month; leap days and year boundaries remain valid', () => {
  assert.deepEqual(eventMonths([undated], '2027-04-01', false, 2), [])
  assert.deepEqual(eventMonths([undated], '2027-04-01', true, 2), [])
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
  assert.equal(eventMonths([fridays], '2027-05-29', true, 1)[0][0], '2027-05')
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

test('invalid and inverted end dates display the valid start time only', () => {
  const startOnly = {...fridays, endsAt: undefined, repeatsUntil: undefined}
  for (const endsAt of ['invalid', '2027-02-25T02:00:00Z']) {
    assert.equal(scheduleLabel({...startOnly, endsAt}, true), scheduleLabel(startOnly, true))
    assert.equal(overlapsDays({...startOnly, endsAt}, '2027-03-05', '2027-03-05'), true)
  }
})
