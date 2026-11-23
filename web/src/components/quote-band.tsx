'use client'

import {useState, type CSSProperties} from 'react'
import Link from 'next/link'
import {CarouselChevron} from './carousel-chevron'
import type {SiteContent} from '@/lib/content'

const quoteDots = [6, 13, 1, 9, 4, 12, 2, 7, 3, 11, 5, 10, 8, 14]

export function QuoteBand({quote}: {quote: SiteContent['home']['quote']}) {
  const [index, setIndex] = useState(0)
  const quotes = [quote, ...(quote?.additional || [])].filter((item) => item?.text)
  const activeIndex = index % quotes.length
  const active = quotes[activeIndex]
  if (!active) return null
  const dot = (offset: number) =>
    ({
      '--olive-dot': `url('/identity/dots/${quoteDots[(activeIndex * 2 + offset) % quoteDots.length]}.svg')`,
    }) as CSSProperties
  return (
    <section className="quote-band" aria-label="Quotations">
      {quotes.length > 1 && (
        <button
          type="button"
          aria-label="Previous quotation"
          onClick={() => setIndex((index + quotes.length - 1) % quotes.length)}
        >
          <CarouselChevron direction="previous" />
        </button>
      )}
      <blockquote aria-live="polite">
        <p>“{active.text}”</p>
        <footer>
          {active.attribution && (
            <span>
              <i className="small-seed" style={dot(0)} aria-hidden="true" />
              {active.attribution}
            </span>
          )}
          {active.link?.href && (
            <Link href={active.link.href}>
              <i className="small-seed" style={dot(1)} aria-hidden="true" />
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
          <CarouselChevron direction="next" />
        </button>
      )}
    </section>
  )
}
