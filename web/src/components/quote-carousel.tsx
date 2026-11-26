'use client'

import {useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

type Quote = {
  attribution?: string
  link: ReactNode
  text: string
  dotIndex: number
}
export type QuoteColors = {light: string; dark: string}
const quoteDots = [6, 13, 1, 9, 4, 12, 2, 7, 3, 11, 5, 10, 8, 14]

function QuoteText({quote}: {quote: Quote}) {
  const dot = quoteDots[(quote.dotIndex * 2) % quoteDots.length]
  return (
    <>
      <p>“{quote.text}”</p>
      {(quote.attribution || quote.link) && (
        <footer>
          {quote.attribution && (
            <span>
              <i
                className="small-seed"
                style={{'--olive-dot': `url('/identity/dots/${dot}.svg')`} as CSSProperties}
                aria-hidden="true"
              />
              {quote.attribution}
            </span>
          )}
          {quote.link}
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
    setSlide(({index, sequence, paletteIndex}) => ({
      index: (index + direction + quotes.length) % quotes.length,
      previous: index % quotes.length,
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
