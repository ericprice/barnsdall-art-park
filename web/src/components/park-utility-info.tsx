'use client'

import {useEffect, useState, useSyncExternalStore} from 'react'
import {formatParkSunset, getParkSunset} from '@/lib/park-sunset'

function subscribeToClock(refresh: () => void) {
  const interval = window.setInterval(refresh, 60_000)
  document.addEventListener('visibilitychange', refresh)
  window.addEventListener('pageshow', refresh)
  return () => {
    window.clearInterval(interval)
    document.removeEventListener('visibilitychange', refresh)
    window.removeEventListener('pageshow', refresh)
  }
}

function currentSunset() {
  return getParkSunset(new Date()).toISOString()
}

function Sunset({initialSunset}: {initialSunset: string}) {
  const sunset = useSyncExternalStore(subscribeToClock, currentSunset, () => initialSunset)
  return (
    <>
      <time dateTime={sunset}>{formatParkSunset(new Date(sunset))}</time> Sunset
    </>
  )
}

export function ParkUtilityInfo({initialSunset}: {initialSunset: string}) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const items = [
    {id: 'city-run', content: 'City-run since 1927'},
    {id: 'hours', content: 'Open Until 10 PM'},
    {id: 'sunset', content: <Sunset initialSunset={initialSunset} />},
  ]
  const itemCount = items.length

  useEffect(() => {
    if (paused) return
    const mobile = window.matchMedia(
      '(max-width: 48rem) and (prefers-reduced-motion: no-preference)',
    )
    let timer: number | undefined
    function updateTimer() {
      window.clearInterval(timer)
      if (mobile.matches) {
        timer = window.setInterval(() => setActive((item) => (item + 1) % itemCount), 4000)
      }
    }
    function onViewportChange() {
      setActive(0)
      updateTimer()
    }
    updateTimer()
    mobile.addEventListener('change', onViewportChange)
    return () => {
      window.clearInterval(timer)
      mobile.removeEventListener('change', onViewportChange)
    }
  }, [itemCount, paused])

  return (
    <div className="park-utility__info">
      <div className="park-utility__items">
        {items.map(({id, content}, index) => (
          <span data-active={index === active} key={id}>
            {content}
          </span>
        ))}
      </div>
      <button
        type="button"
        className="park-utility__pause"
        aria-label={paused ? 'Resume park information' : 'Pause park information'}
        onClick={() => setPaused(!paused)}
      >
        <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      </button>
    </div>
  )
}
