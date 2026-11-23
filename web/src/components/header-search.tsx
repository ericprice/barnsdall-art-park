'use client'

import type {InterfaceText} from '@/lib/content'
import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

type Result = {id: string; title: string; href: string}

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
  const [request, setRequest] = useState({term: initialQuery})
  const [results, setResults] = useState<Result[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    initialQuery ? 'loading' : 'idle',
  )
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => {
    field.current?.focus({preventScroll: true})
  }, [])
  useEffect(() => {
    if (!request.term) return
    const abort = new AbortController()
    async function search() {
      try {
        const response = await fetch('/api/search?' + new URLSearchParams({q: request.term}), {
          signal: abort.signal,
        })
        if (!response.ok) throw new Error('Search failed')
        const matches: Result[] = await response.json()
        if (!abort.signal.aborted) {
          setResults(matches)
          setState('ready')
        }
      } catch {
        if (!abort.signal.aborted) setState('error')
      }
    }
    void search()
    return () => abort.abort()
  }, [request])

  return (
    <div id="site-search-panel" className="header-search">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          const term = query.trim()
          if (!term || (term === request.term && state !== 'error')) return
          setState('loading')
          setRequest({term})
        }}
      >
        <label htmlFor="site-search-field" className="sr-only">
          {labels.search}
        </label>
        <input
          ref={field}
          id="site-search-field"
          type="search"
          placeholder={labels.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
          maxLength={200}
        />
        <button type="submit">
          {labels.search} <i aria-hidden="true" />
        </button>
      </form>
      <div
        role="status"
        aria-live="polite"
        className={state === 'ready' && results.length > 0 ? 'sr-only' : undefined}
      >
        {state === 'loading' && labels.searching}
        {state === 'error' && labels.searchError}
        {state === 'ready' && (results.length ? `${results.length} results` : labels.noResults)}
      </div>
      {state === 'ready' && results.length > 0 && (
        <ul aria-label="Search results">
          {results.map((result) => (
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
