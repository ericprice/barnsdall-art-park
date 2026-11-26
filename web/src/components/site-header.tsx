'use client'

import {ParkImage} from './park-image'
import Link from './route-link'
import {usePathname} from 'next/navigation'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {SiteSettings} from '@/lib/content'
import {interfaceText} from '../../../shared/interface'
import {ParkUtilityInfo} from './park-utility-info'
import {NavigationGroup} from './navigation-group'
import {usePinnedHeader} from './use-pinned-header'
import {HeaderSearch} from './header-search'
import {PageSubtitle} from './page-heading'

function Magnifier() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10" cy="10" r="7.3" />
      <path d="m15.3 15.3 6 6" />
    </svg>
  )
}

type Settings = Pick<SiteSettings, 'title' | 'navigation'>
type HeaderProps = {settings: Settings; initialSunset: string; homeSubtitle?: string}

export function SiteHeader({settings, initialSunset, homeSubtitle}: HeaderProps) {
  const pathname = usePathname()
  return (
    <Navigation
      key={pathname}
      pathname={pathname}
      settings={settings}
      initialSunset={initialSunset}
      homeSubtitle={homeSubtitle}
    />
  )
}

function Navigation({
  pathname,
  settings,
  initialSunset,
  homeSubtitle,
}: HeaderProps & {pathname: string}) {
  const isHome = pathname === '/'
  const {pinned, header, intro} = usePinnedHeader()
  const compact = !isHome || pinned
  const [open, setOpen] = useState<number | 'search' | null>(null)
  const [mobile, setMobile] = useState(false)
  const [initialQuery, setInitialQuery] = useState('')
  const opener = useRef<HTMLElement | null>(null)
  const mobileButton = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(null)
    setMobile(false)
    setInitialQuery('')
  }, [])

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
  }, [open, mobile, close, header])

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
          <PageSubtitle subtitle={homeSubtitle} />
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
            {settings.navigation.map((item, index) => (
              <NavigationGroup
                key={item.title}
                item={item}
                pathname={pathname}
                panelId={`navigation-panel-${index}`}
                expanded={open === index}
                onOpen={(trigger) => {
                  opener.current = trigger
                  setOpen(index)
                }}
                onToggle={(trigger) => {
                  opener.current = trigger
                  setOpen(open === index ? null : index)
                }}
                onClose={close}
              />
            ))}
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
