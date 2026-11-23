'use client'

import {ParkImage} from './park-image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState, useSyncExternalStore} from 'react'
import type {SiteContent} from '@/lib/content'
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

type Settings = SiteContent['settings']
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

function Sunset({initialSunset, label}: {initialSunset: string; label: string}) {
  const sunset = useSyncExternalStore(subscribeToClock, currentSunset, () => initialSunset)
  return (
    <span>
      <time dateTime={sunset}>{formatParkSunset(new Date(sunset))}</time> {label}
    </span>
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
  const [open, setOpen] = useState<number | 'search' | null>(null)
  const [mobile, setMobile] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const header = useRef<HTMLElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const mobileButton = useRef<HTMLButtonElement>(null)
  const active = typeof open === 'number' ? settings.navigation[open] : undefined

  function close() {
    setOpen(null)
    setMobile(false)
    setInitialQuery('')
  }

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
      header.current?.scrollIntoView({behavior: 'instant', block: 'start'})
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
    if (open === null && !mobile) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      close()
      const target = mobile
        ? mobileButton.current
        : opener.current?.offsetParent
          ? opener.current
          : header.current?.querySelector<HTMLButtonElement>('.park-navigation__search')
      target?.focus()
    }
    function onPointer(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open, mobile])

  function toggleSearch(trigger: HTMLButtonElement) {
    opener.current = trigger
    setMobile(false)
    setInitialQuery('')
    setOpen(open === 'search' ? null : 'search')
  }

  const submenu = active?.children?.length ? (
    <div className="park-navigation__links" id="navigation-panel">
      {active.children.map((item) => (
        <Link key={item.href} href={item.href} onClick={close}>
          {item.label}
        </Link>
      ))}
    </div>
  ) : null

  return (
    <header
      ref={header}
      className={`park-header ${isHome ? 'park-header--home' : 'park-header--compact'}`}
      data-expanded={open !== null || mobile}
      onPointerLeave={(event) => {
        if (
          event.pointerType === 'mouse' &&
          !mobile &&
          open !== 'search' &&
          !header.current?.contains(document.activeElement)
        )
          setOpen(null)
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      {isHome && (
        <>
          <div className="park-utility">
            <div className="park-utility__info">
              {settings.sunsetLabel && (
                <Sunset initialSunset={initialSunset} label={settings.sunsetLabel} />
              )}
              {settings.cityRunLabel && <span>{settings.cityRunLabel}</span>}
            </div>
            <div className="park-utility__actions">
              {settings.donationLink?.href && (
                <Link href={settings.donationLink.href}>{settings.donationLink.label}</Link>
              )}
              {settings.subscribeLink?.href && (
                <a href={settings.subscribeLink.href} onClick={close}>
                  {settings.subscribeLink.label}
                </a>
              )}
            </div>
          </div>
          <Link href="/" className="park-masthead" aria-label={settings.title} onClick={close}>
            <ParkImage image={settings.headerMark} sizes="96vw" priority />
          </Link>
        </>
      )}
      <div className="park-navigation">
        {!isHome && (
          <Link href="/" className="compact-home" onClick={close} aria-label={settings.title}>
            B
          </Link>
        )}
        <div className="park-navigation__mobile">
          <button
            type="button"
            ref={mobileButton}
            aria-expanded={mobile}
            aria-controls="primary-navigation"
            onClick={(event) => {
              opener.current = event.currentTarget
              setMobile(!mobile)
              setOpen(null)
            }}
          >
            {mobile ? settings.interfaceText.close : settings.interfaceText.menu}
          </button>
          <button
            type="button"
            aria-label={settings.interfaceText.search}
            aria-expanded={open === 'search'}
            aria-controls="site-search-panel"
            onClick={(event) => toggleSearch(event.currentTarget)}
          >
            <Magnifier />
          </button>
        </div>
        <nav id="primary-navigation" aria-label="Main navigation" data-open={mobile}>
          {settings.navigation.map((item, index) => {
            const current = Boolean(
              item.href && (pathname === item.href || pathname.startsWith(item.href + '/')),
            )
            return (
              <div
                key={item.title}
                className="park-navigation__group"
                data-open={open === index}
                data-current={current}
                onBlur={(event) => {
                  if (
                    open === index &&
                    event.relatedTarget &&
                    !event.currentTarget.contains(event.relatedTarget)
                  )
                    setOpen(null)
                }}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType === 'mouse' &&
                    !mobile &&
                    !mobileButton.current?.offsetParent &&
                    open !== 'search'
                  ) {
                    opener.current = event.currentTarget.querySelector('a')
                    setOpen(item.children?.length ? index : null)
                  }
                }}
              >
                <span className="park-navigation__label">
                  <Link
                    href={item.href || '/'}
                    aria-current={current ? 'page' : undefined}
                    aria-expanded={item.children?.length ? open === index : undefined}
                    aria-controls={
                      item.children?.length && open === index ? 'navigation-panel' : undefined
                    }
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                      if (item.children?.length && open !== index) {
                        event.preventDefault()
                        opener.current = event.currentTarget
                        setOpen(index)
                      } else {
                        close()
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'ArrowDown' || !item.children?.length) return
                      event.preventDefault()
                      opener.current = event.currentTarget
                      setOpen(index)
                      requestAnimationFrame(() => {
                        header.current
                          ?.querySelector<HTMLAnchorElement>('#navigation-panel a')
                          ?.focus()
                      })
                    }}
                  >
                    {item.title}
                  </Link>
                </span>
                {open === index && submenu}
              </div>
            )
          })}
          <button
            className="park-navigation__search"
            type="button"
            aria-label={settings.interfaceText.search}
            aria-expanded={open === 'search'}
            aria-controls="site-search-panel"
            onClick={(event) => toggleSearch(event.currentTarget)}
          >
            <Magnifier />
          </button>
        </nav>
      </div>
      {open === 'search' && (
        <HeaderSearch
          labels={settings.interfaceText}
          initialQuery={initialQuery}
          onNavigate={close}
        />
      )}
    </header>
  )
}
