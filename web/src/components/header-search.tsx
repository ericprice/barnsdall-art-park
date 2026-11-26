'use client'

import type {InterfaceText} from '@/lib/content'
import {DisplayLink} from './action-links'
import Link, {useRouteNavigation} from './route-link'
import {useEffect, useRef, useState} from 'react'

type Result = {id: string; title: string; href: string}
type Preview = {term: string; matches: Result[] | null}

export function HeaderSearch({
  labels,
  initialQuery,
  placeholderOptions,
  initialPlaceholderIndex,
  onNavigate,
}: {
  labels: InterfaceText
  initialQuery: string
  placeholderOptions: string[]
  initialPlaceholderIndex: number
  onNavigate: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [preview, setPreview] = useState<Preview>()
  const [placeholderIndex, setPlaceholderIndex] = useState(initialPlaceholderIndex)
  const placeholderCount = placeholderOptions.length
  const initialPlaceholder = placeholderCount
    ? placeholderOptions[initialPlaceholderIndex % placeholderCount]
    : undefined
  const showPlaceholder = query === ''
  const term = query.trim()
  const resultsHref = '/search?' + new URLSearchParams({q: term})
  // Keep the list in place while a refinement loads. Clear it on an empty or unrelated query.
  const matches =
    term &&
    preview &&
    (preview.term === term ||
      (preview.matches?.length && (term.startsWith(preview.term) || preview.term.startsWith(term))))
      ? preview.matches
      : undefined
  const field = useRef<HTMLInputElement>(null)
  const navigate = useRouteNavigation()

  useEffect(() => {
    field.current?.focus({preventScroll: true})
  }, [])
  useEffect(() => {
    if (!showPlaceholder || placeholderCount < 2) return
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let timer: number | undefined

    function updateTimer() {
      window.clearInterval(timer)
      if (motion.matches) {
        timer = window.setInterval(() => {
          setPlaceholderIndex((index) => (index + 1) % placeholderCount)
        }, 4000 / 1.5)
      }
    }

    updateTimer()
    motion.addEventListener('change', updateTimer)
    return () => {
      window.clearInterval(timer)
      motion.removeEventListener('change', updateTimer)
    }
  }, [placeholderCount, showPlaceholder])
  useEffect(() => {
    if (!term) return
    const abort = new AbortController()
    async function search() {
      try {
        const response = await fetch('/api/search?' + new URLSearchParams({q: term}), {
          signal: abort.signal,
        })
        if (!response.ok) throw new Error('Search failed')
        const matches: Result[] = await response.json()
        if (!abort.signal.aborted) setPreview({term, matches})
      } catch {
        if (!abort.signal.aborted) setPreview({term, matches: null})
      }
    }
    const timer = window.setTimeout(search, 250)
    return () => {
      window.clearTimeout(timer)
      abort.abort()
    }
  }, [term])

  return (
    <div id="site-search-panel" className="header-search">
      <form
        className="inline-form"
        action="/search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (!term) return
          onNavigate()
          navigate(resultsHref)
        }}
      >
        <label htmlFor="site-search-field" className="sr-only">
          {labels.search}
        </label>
        <div className="header-search__field">
          <input
            ref={field}
            id="site-search-field"
            type="search"
            name="q"
            placeholder={initialPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={200}
          />
          {placeholderCount > 0 && (
            <div
              className="inline-form__placeholder header-search__placeholders"
              aria-hidden="true"
            >
              {placeholderOptions.map((placeholder, index) => (
                <span
                  key={`${index}:${placeholder}`}
                  data-active={index === placeholderIndex % placeholderCount}
                >
                  {placeholder}
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit">
          <span>{labels.search}</span>
          <i aria-hidden="true" />
        </button>
      </form>
      <div role="status" className={matches?.length ? 'sr-only' : undefined}>
        {matches === null && labels.searchError}
        {!!matches?.length &&
          `${matches.length} quick ${matches.length === 1 ? 'result' : 'results'}`}
      </div>
      {!!matches?.length && (
        <>
          <ul role="list" aria-label="Search results">
            {matches.map((result) => (
              <li key={result.id}>
                <Link href={result.href} onClick={onNavigate}>
                  {result.title}
                </Link>
              </li>
            ))}
          </ul>
          <DisplayLink
            className="header-search__view-all"
            href={resultsHref}
            prefetch={false}
            onNavigate={onNavigate}
          >
            {labels.viewAll}
          </DisplayLink>
        </>
      )}
    </div>
  )
}
