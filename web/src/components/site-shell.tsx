'use client'

import {
  useCallback,
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
import {trackKeyboardNavigation} from '@/lib/keyboard-navigation'
import type {NavItem} from '@/lib/content'
import {isCurrentNavigationItem} from '@/lib/navigation'

const colors = ['pink', 'lavender', 'yellow', 'pale-green', 'olive', 'green']
const dotCount = 14
const loadingStartKey = 'barnsdall.loadingStart'
// The 14 dots and six colors line up again after 42 frames.
const loadingFrames = Array.from({length: 42}, (_, frame) => frame)

function placeLoadingDot(dot: HTMLSpanElement, image: HTMLImageElement, quadrant: number) {
  // All dimensions are percentages of the square container.
  const width = 50
  const height = (width * image.naturalHeight) / image.naturalWidth
  const tiltDegrees = (Math.random() * 2 - 1) * 30
  const angle = (tiltDegrees * Math.PI) / 180
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

function nextIndex(count: number, hash: number, previous: number, reserved?: number) {
  const choices = Array.from({length: count}, (_, i) => i).filter(
    (i) => i !== previous && i !== reserved,
  )
  return choices[hash % choices.length]
}

function scrollToAnchor(fragment: string, focus: boolean) {
  let id: string
  try {
    id = decodeURIComponent(fragment)
  } catch {
    return
  }
  const href = window.location.href
  function scroll() {
    if (window.location.href !== href) return false
    const target = document.getElementById(id)
    if (!target?.getClientRects().length || target.closest('[hidden]')) return false
    target.scrollIntoView({block: 'start', behavior: 'instant'})
    if (focus && !target.contains(document.activeElement)) {
      if (target.tabIndex < 0) target.tabIndex = -1
      target.focus({preventScroll: true})
    }
    return true
  }
  if (scroll()) return

  // The destination can commit before its target has streamed in.
  const shell = document.querySelector('.site-shell')
  if (!shell) return
  const observer = new MutationObserver(() => {
    if (scroll()) stop()
  })
  observer.observe(shell, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['hidden'],
  })
  const timeout = window.setTimeout(stop, 5000)
  function stop() {
    observer.disconnect()
    window.clearTimeout(timeout)
  }
  return stop
}

export function SiteShell({
  seed,
  navigation,
  children,
}: {
  seed: number
  navigation: NavItem[]
  children: ReactNode
}) {
  useLayoutEffect(trackKeyboardNavigation, [])
  const pathname = usePathname()
  const [navigating, startNavigation] = useTransition()
  const [keepsSectionHeading, setKeepsSectionHeading] = useState(false)
  const previousPath = useRef<string | null>(null)
  const historyPath = useRef<string | null>(null)
  const pendingAnchor = useRef<{destination: string; fragment: string} | null>(null)
  const cancelAnchorScroll = useRef<(() => void) | undefined>(undefined)
  const navigate = useCallback(
    (action: () => void, target: URL, anchor?: string) => {
      const current = window.location
      cancelAnchorScroll.current?.()
      historyPath.current = null
      pendingAnchor.current = null
      if (anchor) {
        const destination = target.pathname + target.search
        if (destination === current.pathname + current.search) {
          action()
          cancelAnchorScroll.current = scrollToAnchor(anchor, true)
          return
        }
        pendingAnchor.current = {destination, fragment: anchor}
      }
      // A detail page can have the same URL prefix and a different heading.
      // Only sibling destinations in the current section menu share its heading.
      const sectionLinks = document.querySelectorAll<HTMLAnchorElement>(
        'main .subnav:has([aria-current="page"]) a[href]',
      )
      const sameSection = current.pathname.split('/')[1] === target.pathname.split('/')[1]
      const sibling =
        sameSection &&
        Array.from(sectionLinks).some(
          (link) => link.origin === target.origin && link.pathname === target.pathname,
        )
      setKeepsSectionHeading(
        target.origin === current.origin && (target.pathname === current.pathname || sibling),
      )
      startNavigation(action)
    },
    [startNavigation],
  )
  const section = navigation.findIndex((item) => isCurrentNavigationItem(item, pathname))
  const [highlight, setHighlight] = useState(() => {
    const dot = seed % dotCount
    const color = Math.floor(seed / dotCount) % colors.length
    return {
      pathname,
      section,
      dot,
      color,
      subDot: (dot + 6) % dotCount,
      subColor: (color + 3) % colors.length,
    }
  })
  let active = highlight
  if (highlight.pathname !== pathname) {
    let hash = seed
    for (const char of pathname) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0
    const colorHash = Math.floor(hash / dotCount)
    const changedSection = section !== -1 && section !== highlight.section
    const dot = changedSection ? nextIndex(dotCount, hash, highlight.dot) : highlight.dot
    const color = changedSection
      ? nextIndex(colors.length, colorHash, highlight.color)
      : highlight.color
    active = {
      pathname,
      section: changedSection ? section : highlight.section,
      dot,
      color,
      subDot: nextIndex(dotCount, hash, highlight.subDot, dot),
      subColor: nextIndex(colors.length, colorHash, highlight.subColor, color),
    }
    setHighlight(active)
  }

  useLayoutEffect(() => {
    function allowBrowserRestoration() {
      pendingAnchor.current = null
      cancelAnchorScroll.current?.()
      historyPath.current = window.location.pathname
    }
    window.addEventListener('popstate', allowBrowserRestoration)
    return () => {
      window.removeEventListener('popstate', allowBrowserRestoration)
      cancelAnchorScroll.current?.()
      previousPath.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (navigating) return
    const previous = previousPath.current
    previousPath.current = pathname
    const restoringHistory = pathname === historyPath.current
    historyPath.current = null
    if (restoringHistory) return

    const current = window.location
    const requested = pendingAnchor.current
    pendingAnchor.current = null
    if (requested?.destination === current.pathname + current.search) {
      cancelAnchorScroll.current = scrollToAnchor(requested.fragment, true)
      return
    }
    if (pathname === previous) return
    if (current.hash) {
      cancelAnchorScroll.current = scrollToAnchor(current.hash.slice(1), false)
    } else if (previous !== null) {
      window.scrollTo({top: 0, left: 0, behavior: 'instant'})
    }
  }, [pathname, navigating])

  const style = {
    '--nav-dot': `url('/identity/dots/${active.dot + 1}.svg')`,
    '--nav-color': `var(--${colors[active.color]})`,
    '--section-nav-dot': `url('/identity/dots/${active.subDot + 1}.svg')`,
    '--section-nav-color': `var(--${colors[active.subColor]})`,
  } as CSSProperties

  return (
    <RouteTransition value={navigate}>
      <div
        className="site-shell"
        style={style}
        data-navigating={navigating ? (keepsSectionHeading ? 'section' : 'page') : undefined}
      >
        {children}
        <div className="route-progress" role="status">
          <LoadingDot active={navigating} />
          <span className="sr-only">Loading page</span>
        </div>
      </div>
    </RouteTransition>
  )
}
