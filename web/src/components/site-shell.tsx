'use client'

import {useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import {usePathname} from 'next/navigation'

const colors = ['pink', 'lavender', 'yellow', 'pale-green', 'olive', 'green']
const dotCount = 14

export function SiteShell({seed, children}: {seed: number; children: ReactNode}) {
  const pathname = usePathname()
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
    <div className="site-shell" style={style}>
      {children}
    </div>
  )
}
