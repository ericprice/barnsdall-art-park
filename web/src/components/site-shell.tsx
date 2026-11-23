'use client'

import {useState, type CSSProperties, type ReactNode} from 'react'
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
