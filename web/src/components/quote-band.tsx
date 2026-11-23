'use client'

import {useState} from 'react'
import Link from 'next/link'
import type {SiteContent} from '@/lib/content'

export function QuoteBand({quote}: {quote: SiteContent['home']['quote']}) {
  const [index, setIndex] = useState(0)
  const quotes = [quote, ...(quote?.additional || [])].filter((item) => item?.text)
  const active = quotes[index % quotes.length]
  if (!active) return null
  return (
    <section className="quote-band" aria-label="Quotations">
      {quotes.length > 1 && (
        <button
          type="button"
          aria-label="Previous quotation"
          onClick={() => setIndex((index + quotes.length - 1) % quotes.length)}
        >
          ‹
        </button>
      )}
      <blockquote aria-live="polite">
        <p>“{active.text}”</p>
        <footer>
          {active.attribution && (
            <span>
              <i className="small-seed" aria-hidden="true" />
              {active.attribution}
            </span>
          )}
          {active.link?.href && (
            <Link href={active.link.href}>
              <i className="small-seed" aria-hidden="true" />
              {active.link.label}
            </Link>
          )}
        </footer>
      </blockquote>
      {quotes.length > 1 && (
        <button
          type="button"
          aria-label="Next quotation"
          onClick={() => setIndex((index + 1) % quotes.length)}
        >
          ›
        </button>
      )}
    </section>
  )
}
