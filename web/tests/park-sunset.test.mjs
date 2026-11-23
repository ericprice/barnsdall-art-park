import assert from 'node:assert/strict'
import test from 'node:test'
import {formatParkSunset, getParkSunset} from '../src/lib/park-sunset.ts'

// USNO one-day rise/set tables at 34.10023° N, 118.29436° W.
// https://aa.usno.navy.mil/api/rstt/oneday?date=2026-11-19&coords=34.10023,-118.29436&tz=-8
test('park sunset matches USNO through both solstices and daylight saving transitions', () => {
  const expectedTimes = {
    '2026-03-08': '6:55 PM',
    '2026-06-21': '8:08 PM',
    '2026-11-01': '5:00 PM',
    '2026-11-19': '4:47 PM',
    '2026-11-23': '4:45 PM',
    '2026-12-21': '4:48 PM',
  }
  for (const [date, time] of Object.entries(expectedTimes)) {
    const sunset = getParkSunset(new Date(date + 'T12:00:00Z'))
    assert.equal(formatParkSunset(sunset), time, date)
  }
})

test('sunset changes at midnight in Los Angeles, including after the UTC date rolls over', () => {
  const sunsetBeforeMidnight = getParkSunset(new Date('2026-11-19T07:59:59Z'))
  const sunsetAtMidnight = getParkSunset(new Date('2026-11-19T08:00:00Z'))
  const sunsetAtEndOfDay = getParkSunset(new Date('2026-11-20T07:59:59Z'))
  assert.equal(sunsetBeforeMidnight.toISOString(), '2026-11-19T00:48:00.000Z')
  assert.equal(sunsetAtMidnight.toISOString(), '2026-11-20T00:47:00.000Z')
  assert.equal(sunsetAtEndOfDay.valueOf(), sunsetAtMidnight.valueOf())
})
