import type {Metadata} from 'next'
import Form from 'next/form'
import {PageHeading} from '@/components/page-heading'
import Link from '@/components/route-link'
import {searchContent} from '@/lib/search'
import {interfaceText} from '../../../../shared/interface'
import './search-page.scss'

export const metadata: Metadata = {title: interfaceText.search, robots: {index: false, follow: false}}

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{q?: string | string[]}>
}) {
  const {q} = await searchParams
  const term = Array.isArray(q) ? q[0] : q
  const query = term?.trim().slice(0, 200) ?? ''
  const results = query ? await searchContent(query) : []

  return (
    <main id="main-content" className="search-page">
      <PageHeading title={interfaceText.search} />
      <div className="search-page__content">
        <Form action="/search" role="search" aria-label="Site search" className="search-page__form">
          <label htmlFor="search-page-field" className="sr-only">
            {interfaceText.search}
          </label>
          <input
            key={query}
            id="search-page-field"
            name="q"
            type="search"
            placeholder={interfaceText.searchPlaceholder}
            defaultValue={query}
            maxLength={200}
          />
          <button type="submit">{interfaceText.search}</button>
        </Form>
        {results.length > 0 ? (
          <ul className="search-page__results" role="list" aria-label="Search results">
            {results.map(({id, title, href}) => (
              <li key={id}>
                <Link href={href}>{title}</Link>
              </li>
            ))}
          </ul>
        ) : (
          query && <p className="search-page__empty">{interfaceText.noResults}</p>
        )}
      </div>
    </main>
  )
}
