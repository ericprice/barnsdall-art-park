'use client'

import {useLayoutEffect, useRef, useState, type CSSProperties} from 'react'
import type {SiteSettings} from '@/lib/content'
import {DotLink} from './action-links'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

type Quote = Pick<
  NonNullable<SiteSettings['quotes']>[number],
  'attribution' | 'link'
> & {
  text: string
  dotIndex: number
}
export type QuoteColors = {light: string; dark: string}
const quoteDots = [6, 13, 1, 9, 4, 12, 2, 7, 3, 11, 5, 10, 8, 14]

function QuoteText({quote}: {quote: Quote}) {
  const dot = (offset: number) =>
    ({
      '--olive-dot': `url('/identity/dots/${quoteDots[(quote.dotIndex * 2 + offset) % quoteDots.length]}.svg')`,
    }) as CSSProperties
  return (
    <>
      <p>“{quote.text}”</p>
      {(quote.attribution || quote.link?.href) && (
        <footer>
          {quote.attribution && (
            <span>
              <i className="small-seed" style={dot(0)} aria-hidden="true" />
              {quote.attribution}
            </span>
          )}
          {quote.link?.href && (
            <DotLink href={quote.link.href} style={dot(1)}>
              {quote.link.label}
            </DotLink>
          )}
        </footer>
      )}
    </>
  )
}

export function QuoteCarousel({quotes, palette}: {quotes: Quote[]; palette: QuoteColors[]}) {
  const [slide, setSlide] = useState({index: 0, previous: -1, sequence: 0, paletteIndex: 0})
  const content = useRef<HTMLDivElement>(null)
  const current = useRef<HTMLQuoteElement>(null)
  const paletteSize = Math.max(1, palette.length)
  const colors = palette[slide.paletteIndex % paletteSize]

  useLayoutEffect(() => {
    const frame = content.current
    const text = current.current
    if (!frame || !text) return
    const measure = () => {
      frame.style.height = `${text.getBoundingClientRect().height}px`
    }
    measure()
    let resizeFrame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(measure)
    })
    observer.observe(text)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(resizeFrame)
    }
  }, [slide.sequence])

  function advance(direction: number) {
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setSlide(({index, sequence, paletteIndex}) => ({
      index: (index + direction + quotes.length) % quotes.length,
      previous: motion ? index % quotes.length : -1,
      sequence: sequence + 1,
      paletteIndex: (paletteIndex + direction + paletteSize) % paletteSize,
    }))
  }
  const swipe = useCarouselSwipe(quotes.length, advance)

  return (
    <section
      className="quote-band"
      aria-label="Quotations"
      style={colors && ({'--quote-background': colors.light, color: colors.dark} as CSSProperties)}
      {...swipe}
    >
      {quotes.length > 1 && (
        <button type="button" aria-label="Previous quotation" onClick={() => advance(-1)}>
          <CarouselChevron direction="previous" />
        </button>
      )}
      <div className="quote-band__content" ref={content} aria-live="polite" aria-atomic="true">
        {quotes[slide.previous] && (
          <blockquote
            key={`previous-${slide.sequence}`}
            className="quote-band__outgoing"
            aria-hidden="true"
            inert
            onAnimationEnd={() => setSlide((value) => ({...value, previous: -1}))}
          >
            <QuoteText quote={quotes[slide.previous]} />
          </blockquote>
        )}
        <blockquote
          ref={current}
          key={slide.sequence}
          className={slide.sequence ? 'quote-band__incoming' : undefined}
        >
          <QuoteText quote={quotes[slide.index % quotes.length]} />
        </blockquote>
      </div>
      {quotes.length > 1 && (
        <button type="button" aria-label="Next quotation" onClick={() => advance(1)}>
          <CarouselChevron direction="next" />
        </button>
      )}
    </section>
  )
}
