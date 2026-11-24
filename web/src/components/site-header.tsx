'use client'

import {ParkImage} from './park-image'
import Link from './route-link'
import {usePathname} from 'next/navigation'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import type {SiteContent} from '@/lib/content'
import {interfaceText} from '../../../shared/interface'
import {formatParkSunset, getParkSunset} from '@/lib/park-sunset'
import {HeaderSearch} from './header-search'

function Magnifier() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="7.3" />
      <path d="m15.3 15.3 6 6" />
    </svg>
  )
}

type Settings = Pick<SiteContent['settings'], 'title' | 'navigation'>
type HeaderProps = {settings: Settings; initialSunset: string}

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

function ParkUtilityInfo({initialSunset}: {initialSunset: string}) {
  const [active, setActive] = useState(0)
  const items = [
    {id: 'city-run', content: 'City-run since 1927'},
    {id: 'hours', content: 'Open Until 10 PM'},
    {id: 'sunset', content: <Sunset initialSunset={initialSunset} />},
  ]
  const itemCount = items.length

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 48rem)')
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
  }, [itemCount])

  return (
    <div className="park-utility__info">
      {items.map(({id, content}, index) => (
        <span data-active={index === active} key={id}>
          {content}
        </span>
      ))}
    </div>
  )
}

export function SiteHeader({settings, initialSunset}: HeaderProps) {
  const pathname = usePathname()
  return (
    <Navigation
      key={pathname}
      pathname={pathname}
      settings={settings}
      initialSunset={initialSunset}
    />
  )
}

function Navigation({pathname, settings, initialSunset}: HeaderProps & {pathname: string}) {
  const isHome = pathname === '/'
  const [pinned, setPinned] = useState(false)
  const compact = !isHome || pinned
  const [open, setOpen] = useState<number | 'search' | null>(null)
  const [mobile, setMobile] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const header = useRef<HTMLElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const previousNavPositions = useRef<Map<HTMLElement, number> | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const mobileButton = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(null)
    setMobile(false)
    setInitialQuery('')
  }, [])

  useEffect(() => {
    if (!intro.current) return
    let wasPinned: boolean | undefined
    const observer = new IntersectionObserver(([entry]) => {
      const nextPinned = entry.boundingClientRect.bottom < 0
      if (nextPinned === wasPinned) return
      if (
        wasPinned !== undefined &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        const labels = header.current?.querySelectorAll<HTMLElement>(
          '.park-navigation__label, .park-navigation__mobile > button:first-child',
        )
        previousNavPositions.current = new Map(
          Array.from(labels ?? [], (label) => [label, label.getBoundingClientRect().left]),
        )
      }
      wasPinned = nextPinned
      setPinned(nextPinned)
    })
    observer.observe(intro.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const previous = previousNavPositions.current
    previousNavPositions.current = null
    if (!previous) return

    // Let flexbox set the final spacing, then ease each label from its previous position.
    const moves = Array.from(
      previous,
      ([label, left]) => [label, left - label.getBoundingClientRect().left] as const,
    )
    const timing = {duration: 260, easing: 'ease-out'}
    const animations = moves.flatMap(([label, distance]) =>
      distance ? [label.animate({transform: [`translateX(${distance}px)`, 'none']}, timing)] : [],
    )
    if (pinned) {
      header.current?.querySelectorAll('.compact-home').forEach((mark) => {
        animations.push(mark.animate({opacity: [0, 1]}, {...timing, easing: 'ease-in'}))
      })
    }
    return () => animations.forEach((animation) => animation.cancel())
  }, [pinned])

  useEffect(() => {
    function openFromFooter(event: MouseEvent) {
      const link =
        event.target instanceof Element &&
        event.target.closest<HTMLAnchorElement>('a[href="#site-search"]')
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      opener.current = link
      setOpen('search')
      setMobile(false)
    }
    function openFromLocation() {
      const [fragment, params] = window.location.hash.slice(1).split('?')
      if (fragment !== 'site-search') return
      setInitialQuery(new URLSearchParams(params).get('q')?.slice(0, 200) || '')
      setOpen('search')
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      )
    }
    openFromLocation()
    document.addEventListener('click', openFromFooter)
    window.addEventListener('hashchange', openFromLocation)
    return () => {
      document.removeEventListener('click', openFromFooter)
      window.removeEventListener('hashchange', openFromLocation)
    }
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (open === null && !mobile) return
      close()
      const target = mobile
        ? mobileButton.current
        : opener.current?.offsetParent
          ? opener.current
          : header.current?.querySelector<HTMLButtonElement>('.park-navigation__search')
      target?.focus({preventScroll: true})
    }
    function dismissFromOutside(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      if (!header.current?.contains(target)) {
        close()
      } else if (
        typeof open === 'number' &&
        !target.closest(
          '.park-navigation__label > [aria-controls], .park-navigation__group[data-open="true"] > .park-navigation__links',
        )
      ) {
        setOpen(null)
      }
    }
    const outsideEvent = typeof open === 'number' ? 'click' : 'pointerdown'
    document.addEventListener('keydown', onKey)
    document.addEventListener(outsideEvent, dismissFromOutside, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener(outsideEvent, dismissFromOutside, true)
    }
  }, [open, mobile, close])

  function toggleSearch(trigger: HTMLButtonElement) {
    opener.current = trigger
    setMobile(false)
    setInitialQuery('')
    setOpen(open === 'search' ? null : 'search')
  }

  function returnHome(event: {preventDefault: () => void}) {
    close()
    if (!isHome) return
    event.preventDefault()
    window.scrollTo({top: 0})
    intro.current?.querySelector<HTMLAnchorElement>('.park-masthead')?.focus({preventScroll: true})
  }

  const expanded = open !== null || mobile
  const mobileExpanded = mobile || open === 'search'
  return (
    <>
      {isHome && (
        <div className="park-header park-header__intro" ref={intro} data-expanded={expanded}>
          <div className="park-utility">
            <ParkUtilityInfo initialSunset={initialSunset} />
            <Link className="park-utility__donate" href="/support/donate">
              Donate
            </Link>
          </div>
          <Link href="/" className="park-masthead" aria-label={settings.title} onClick={close}>
            <ParkImage image="/identity/barnsdall-art-park.svg" sizes="96vw" priority />
          </Link>
        </div>
      )}
      <header
        ref={header}
        className={`park-header ${compact ? 'park-header--compact' : 'park-header--home'}`}
        data-expanded={expanded}
        onBlur={(event) => {
          if (
            typeof open !== 'number' &&
            event.relatedTarget &&
            !event.currentTarget.contains(event.relatedTarget)
          ) {
            close()
          }
        }}
      >
        <div className="park-navigation">
          {compact && (
            <Link
              href="/"
              className="compact-home compact-home--mobile"
              onNavigate={returnHome}
              aria-label={settings.title}
            >
              B
            </Link>
          )}
          <div className="park-navigation__mobile">
            <button
              type="button"
              ref={mobileButton}
              aria-expanded={mobileExpanded}
              aria-controls={open === 'search' ? 'site-search-panel' : 'primary-navigation'}
              onClick={(event) => {
                if (mobileExpanded) {
                  close()
                  return
                }
                opener.current = event.currentTarget
                setMobile(true)
                setOpen(null)
              }}
            >
              {mobileExpanded ? interfaceText.close : interfaceText.menu}
            </button>
            <button
              type="button"
              aria-label={interfaceText.search}
              aria-expanded={open === 'search'}
              aria-controls="site-search-panel"
              onClick={(event) => toggleSearch(event.currentTarget)}
            >
              <Magnifier />
            </button>
          </div>
          <nav id="primary-navigation" aria-label="Main navigation" data-open={mobile}>
            {compact && (
              <Link
                href="/"
                className="compact-home compact-home--desktop"
                onNavigate={returnHome}
                aria-label={settings.title}
              >
                B
              </Link>
            )}
            {settings.navigation.map((item, index) => {
              const panelId = `navigation-panel-${index}`
              const hasChildren = Boolean(item.children?.length)
              if (!item.href && !hasChildren) return null
              const current = item.href
                ? pathname === item.href || pathname.startsWith(item.href + '/')
                : item.children?.some((child) => {
                    const target = child.href.split(/[?#]/)[0]
                    return pathname === target || pathname.startsWith(target + '/')
                  })

              function toggleSubmenu(trigger: HTMLElement) {
                opener.current = trigger
                setOpen(open === index ? null : index)
              }

              function focusSubmenu(event: ReactKeyboardEvent<HTMLElement>) {
                if (event.key !== 'ArrowDown' || !hasChildren) return
                event.preventDefault()
                opener.current = event.currentTarget
                setOpen(index)
                requestAnimationFrame(() => {
                  header.current?.querySelector<HTMLAnchorElement>(`#${panelId} a`)?.focus()
                })
              }
              return (
                <div
                  key={item.title}
                  className="park-navigation__group"
                  data-open={open === index}
                  data-current={current}
                >
                  <span className="park-navigation__label">
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-current={current ? 'page' : undefined}
                        aria-expanded={hasChildren ? open === index : undefined}
                        aria-controls={hasChildren ? panelId : undefined}
                        onClick={(event) => {
                          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                            return
                          if (hasChildren) {
                            event.preventDefault()
                            toggleSubmenu(event.currentTarget)
                          } else {
                            close()
                          }
                        }}
                        onKeyDown={focusSubmenu}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        aria-current={current ? 'true' : undefined}
                        aria-expanded={open === index}
                        aria-controls={panelId}
                        onClick={(event) => toggleSubmenu(event.currentTarget)}
                        onKeyDown={focusSubmenu}
                      >
                        {item.title}
                      </button>
                    )}
                  </span>
                  {!!item.children?.length && (
                    <div className="park-navigation__links" id={panelId} inert={open !== index}>
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href} onClick={close}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <button
              className="park-navigation__search"
              type="button"
              aria-label={interfaceText.search}
              aria-expanded={open === 'search'}
              aria-controls="site-search-panel"
              onClick={(event) => toggleSearch(event.currentTarget)}
            >
              <Magnifier />
            </button>
          </nav>
        </div>
        {open === 'search' && (
          <HeaderSearch labels={interfaceText} initialQuery={initialQuery} onNavigate={close} />
        )}
      </header>
    </>
  )
}
