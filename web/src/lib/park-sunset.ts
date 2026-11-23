// Coordinates of Olive Hill in the City of Los Angeles record, Council File 18-0769.
const latitude = 34.10023
const longitude = -118.29436
const radians = Math.PI / 180
const minute = 60_000
const day = 1440 * minute
const j2000 = Date.UTC(2000, 0, 1, 12)
const timeZone = 'America/Los_Angeles'
const parkDay = new Intl.DateTimeFormat('sv-SE', {timeZone})
const parkClock = new Intl.DateTimeFormat('en-US', {timeZone, hour: 'numeric', minute: '2-digit'})

// US Naval Observatory solar coordinates: https://aa.usno.navy.mil/faq/sun_approx
function sunsetMinutesUTC(daysSinceJ2000: number) {
  const anomaly = (357.529 + 0.98560028 * daysSinceJ2000) * radians
  const meanLongitude = (280.459 + 0.98564736 * daysSinceJ2000) * radians
  const eclipticLongitude =
    meanLongitude + (1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)) * radians
  const tilt = (23.439 - 0.00000036 * daysSinceJ2000) * radians
  const rightAscension = Math.atan2(
    Math.cos(tilt) * Math.sin(eclipticLongitude),
    Math.cos(eclipticLongitude),
  )
  const difference = meanLongitude - rightAscension
  const equationOfTime = Math.atan2(Math.sin(difference), Math.cos(difference)) / radians
  const declination = Math.asin(Math.sin(tilt) * Math.sin(eclipticLongitude))

  // The sun's upper edge meets a level horizon when its center is 0.833° below it.
  const latitudeRad = latitude * radians
  const hourAngle = Math.acos(
    (Math.sin(-0.833 * radians) - Math.sin(latitudeRad) * Math.sin(declination)) /
      (Math.cos(latitudeRad) * Math.cos(declination)),
  )
  return 720 + 4 * (hourAngle / radians - longitude - equationOfTime)
}

/** Sunset on the park's local calendar date, rounded to the nearest minute. */
export function getParkSunset(now: Date): Date {
  const midnightUTC = Date.parse(parkDay.format(now) + 'T00:00:00Z')
  // Sunset at Olive Hill falls early on the following UTC date. Refine the solar
  // coordinates at the first estimate to obtain the time for that evening.
  const firstEstimate = sunsetMinutesUTC((midnightUTC + day - j2000) / day)
  const minutes = sunsetMinutesUTC((midnightUTC + firstEstimate * minute - j2000) / day)
  return new Date(midnightUTC + Math.round(minutes) * minute)
}

export function formatParkSunset(sunset: Date): string {
  return parkClock.format(sunset)
}
