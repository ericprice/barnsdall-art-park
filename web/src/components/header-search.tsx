'use client'

import type {InterfaceText} from '@/lib/content'
import type {QuickSearchResult} from '@/lib/search'
import {DisplayLink} from './display-link'
import {RotatingPlaceholderInput} from './rotating-placeholder-input'
import Link, {useRouteNavigation} from './route-link'
import {useEffect, useRef, useState} from 'react'

type Preview = {term: string; matches: QuickSearchResult[] | null}

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
    if (!term) return
    const abort = new AbortController()
    async function search() {
      try {
        const response = await fetch('/api/search?' + new URLSearchParams({q: term}), {
          signal: abort.signal,
        })
        if (!response.ok) throw new Error('Search failed')
        const matches: QuickSearchResult[] = await response.json()
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
        <RotatingPlaceholderInput
          ref={field}
          id="site-search-field"
          type="search"
          name="q"
          phrases={placeholderOptions}
          initialIndex={initialPlaceholderIndex}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          maxLength={200}
        />
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
                  <span className="header-search__result-title">{result.title}</span>
                  {result.typeLabel !== 'Page' && (
                    <span className="header-search__result-type">{result.typeLabel}</span>
                  )}
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
