'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {usePathname} from 'next/navigation'
import {RouteTransition} from './route-link'

const colors = ['pink', 'lavender', 'yellow', 'pale-green', 'olive', 'green']
const dotCount = 14
const loadingStartKey = 'barnsdall.loadingStart'
// The 14 dots and six colors line up again after 42 frames.
const loadingFrames = Array.from({length: 42}, (_, frame) => frame)

function placeLoadingDot(dot: HTMLSpanElement, image: HTMLImageElement, quadrant: number) {
  // All dimensions are percentages of the square container.
  const width = 50
  const height = width * image.naturalHeight / image.naturalWidth
  const tiltDegrees = (Math.random() * 2 - 1) * 30
  const angle = tiltDegrees * Math.PI / 180
  const cos = Math.abs(Math.cos(angle))
  const sin = Math.abs(Math.sin(angle))
  const rotatedWidth = width * cos + height * sin
  const rotatedHeight = width * sin + height * cos
  const x = (quadrant % 2 === 0 ? 0 : 0.8) + Math.random() * 0.2
  const y = (quadrant < 2 ? 0 : 0.8) + Math.random() * 0.2

  dot.style.width = `${width}%`
  dot.style.height = `${height}%`
  dot.style.left = `${rotatedWidth / 2 + x * (100 - rotatedWidth)}%`
  dot.style.top = `${rotatedHeight / 2 + y * (100 - rotatedHeight)}%`
  dot.style.rotate = `${tiltDegrees}deg`
  dot.style.maskImage = `url("${image.src}")`
}

export function LoadingDot({active = true}: {active?: boolean}) {
  const firstDot = useRef<HTMLSpanElement>(null)
  const secondDot = useRef<HTMLSpanElement>(null)
  const previousStart = useRef(-1)

  useEffect(() => {
    if (!active || !firstDot.current || !secondDot.current) return
    const layers = [firstDot.current, secondDot.current]
    for (const layer of layers) layer.hidden = true
    let last = previousStart.current
    try {
      last = Number(sessionStorage.getItem(loadingStartKey) ?? last)
    } catch {
      // The component still remembers its last start when tab storage is unavailable.
    }
    const starts = loadingFrames.filter(
      (frame) =>
        frame % dotCount !== last % dotCount && frame % colors.length !== last % colors.length,
    )
    const start = starts[Math.floor(Math.random() * starts.length)]
    const nextImage = new Image()
    nextImage.crossOrigin = 'anonymous'
    let timer: number | undefined
    let overlapTimer: number | undefined

    let frame = 0
    let quadrant = Math.floor(Math.random() * 4)

    const drawFrame = () => {
      // Keep the current dot on screen if the next mask is still downloading.
      if (!nextImage.complete || !nextImage.naturalWidth) return

      const incoming = layers[frame % 2]
      const outgoing = layers[(frame + 1) % 2]
      const color = colors[(start + frame) % colors.length]
      placeLoadingDot(incoming, nextImage, quadrant)
      incoming.style.backgroundColor = `var(--${color})`
      incoming.style.zIndex = '1'
      incoming.hidden = false
      outgoing.style.zIndex = '0'
      if (frame === 0) {
        outgoing.hidden = true
      } else {
        overlapTimer = window.setTimeout(() => {
          outgoing.hidden = true
        }, 80)
      }

      frame++
      nextImage.src = `/identity/dots/${((start + frame) % dotCount) + 1}.svg`
      quadrant = (quadrant + 1 + Math.floor(Math.random() * 3)) % 4
    }

    nextImage.onload = () => {
      nextImage.onload = null
      drawFrame()
      previousStart.current = start
      try {
        sessionStorage.setItem(loadingStartKey, String(start))
      } catch {
        // Use the in-memory start for subsequent navigations.
      }
      timer = window.setInterval(drawFrame, 1000 / 4.6875)
    }
    nextImage.src = `/identity/dots/${(start % dotCount) + 1}.svg`
    return () => {
      nextImage.onload = null
      window.clearInterval(timer)
      window.clearTimeout(overlapTimer)
    }
  }, [active])

  return (
    <span className="loading-dot" aria-hidden="true">
      <span ref={firstDot} hidden />
      <span ref={secondDot} hidden />
    </span>
  )
}

export function SiteShell({seed, children}: {seed: number; children: ReactNode}) {
  const pathname = usePathname()
  const [navigating, startNavigation] = useTransition()
  const [highlight, setHighlight] = useState({
    pathname,
    dot: seed % dotCount,
    color: Math.floor(seed / dotCount) % colors.length,
  })
  let active = highlight
  if (highlight.pathname !== pathname) {
    let hash = seed
    for (const char of pathname) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
    active = {
      pathname,
      dot: (highlight.dot + 1 + (hash % (dotCount - 1))) % dotCount,
      color:
        (highlight.color + 1 + (Math.floor(hash / dotCount) % (colors.length - 1))) % colors.length,
    }
    setHighlight(active)
  }

  const previousPath = useRef(pathname)
  const historyPath = useRef<string | null>(null)

  useLayoutEffect(() => {
    function allowBrowserRestoration() {
      historyPath.current = window.location.pathname
    }
    window.addEventListener('popstate', allowBrowserRestoration)
    return () => window.removeEventListener('popstate', allowBrowserRestoration)
  }, [])

  useLayoutEffect(() => {
    const changed = pathname !== previousPath.current
    previousPath.current = pathname
    const restoringHistory = pathname === historyPath.current
    historyPath.current = null
    if (restoringHistory) return

    const fragment = window.location.hash.slice(1)
    if (!fragment) {
      if (changed) window.scrollTo({top: 0, left: 0, behavior: 'instant'})
      return
    }

    let anchor: string
    try {
      anchor = decodeURIComponent(fragment)
    } catch {
      return
    }
    function scrollToAnchor() {
      if (window.location.hash.slice(1) !== fragment) return false
      const target = document.getElementById(anchor)
      if (!target?.getClientRects().length || target.closest('[hidden]')) return false
      target.scrollIntoView({block: 'start', behavior: 'instant'})
      return true
    }
    if (scrollToAnchor()) return

    // A direct fragment URL can arrive before its target has streamed in.
    const observer = new MutationObserver(() => {
      if (scrollToAnchor()) observer.disconnect()
    })
    const shell = document.querySelector('.site-shell')
    if (!shell) return
    observer.observe(shell, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['hidden'],
    })
    const timeout = window.setTimeout(() => observer.disconnect(), 5000)
    return () => {
      observer.disconnect()
      window.clearTimeout(timeout)
    }
  }, [pathname])

  const style = {
    '--nav-dot': `url('/identity/dots/${active.dot + 1}.svg')`,
    '--nav-color': `var(--${colors[active.color]})`,
    '--section-nav-dot': `url('/identity/dots/${((active.dot + 6) % dotCount) + 1}.svg')`,
    '--section-nav-color': `var(--${colors[(active.color + 3) % colors.length]})`,
  } as CSSProperties

  return (
    <RouteTransition value={startNavigation}>
      <div className="site-shell" style={style} data-navigating={navigating || undefined}>
        {children}
        <div className="route-progress" role="status">
          <LoadingDot active={navigating} />
          <span className="sr-only">Loading page</span>
        </div>
      </div>
    </RouteTransition>
  )
}
