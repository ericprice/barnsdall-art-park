'use client'

import type {InterfaceText} from '@/lib/content'
import Link, {useRouteNavigation} from './route-link'
import {useEffect, useRef, useState} from 'react'

type Result = {id: string; title: string; href: string}
type Preview = {term: string; matches: Result[] | null}

export function HeaderSearch({
  labels,
  initialQuery,
  onNavigate,
}: {
  labels: InterfaceText
  initialQuery: string
  onNavigate: () => void
}) {
  const [query, setQuery] = useState(initialQuery)
  const [preview, setPreview] = useState<Preview>()
  const term = query.trim()
  const matches = preview?.term === term ? preview.matches : undefined
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
        action="/search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (!term) return
          onNavigate()
          navigate('/search?' + new URLSearchParams({q: term}))
        }}
      >
        <label htmlFor="site-search-field" className="sr-only">
          {labels.search}
        </label>
        <input
          ref={field}
          id="site-search-field"
          type="search"
          name="q"
          placeholder={labels.searchPlaceholder}
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
        {matches?.length === 0 && labels.noResults}
        {!!matches?.length &&
          `${matches.length} quick ${matches.length === 1 ? 'result' : 'results'}`}
      </div>
      {!!matches?.length && (
        <ul role="list" aria-label="Search results">
          {matches.map((result) => (
            <li key={result.id}>
              <Link href={result.href} onClick={onNavigate}>
                {result.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
