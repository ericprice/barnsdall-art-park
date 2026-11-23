'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import type {SiteContent} from '@/lib/content'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {ParkImage} from './park-image'

export function Hero({slides, celebration}: Pick<SiteContent['home'], 'slides' | 'celebration'>) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const heroRef = useRef<HTMLElement>(null)
  const [heroInView, setHeroInView] = useState(true)
  const stories = slides
  const active = stories.length ? index % stories.length : 0
  const slide = stories[active]

  useEffect(() => {
    if (slides.length < 2 || hovered || focused) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    function schedule() {
      window.clearInterval(timer)
      if (document.visibilityState === 'visible' && !reducedMotion.matches) {
        timer = window.setInterval(() => setIndex((value) => (value + 1) % slides.length), 6500)
      }
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    reducedMotion.addEventListener('change', schedule)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', schedule)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [slides.length, hovered, focused])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || !celebration?.title) return
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting))
    observer.observe(hero)
    return () => observer.disconnect()
  }, [celebration?.title, slides.length])

  function advance(direction: number) {
    setIndex((value) => (value + direction + stories.length) % stories.length)
  }
  if (!slide) return null
  return (
    <section
      ref={heroRef}
      className="hero"
      data-has-celebration={celebration?.title ? true : undefined}
      style={themeStyle(themeForEntry(slide), slide.image)}
      aria-roledescription="carousel"
      aria-label="Featured stories"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <div className="hero__shape">
        {stories.map((story, i) => (
          <div
            key={story.id}
            className="hero__frame"
            data-current={i === active}
            aria-hidden={i !== active}
          >
            <ParkImage
              editorial
              orgTheme={themeForEntry(story)}
              image={story.image}
              priority={i === 0}
              sizes="(max-width: 44rem) 95vw, 75vw"
            />
          </div>
        ))}
      </div>
      <div className="hero__story" key={slide.id}>
        <h1>{slide.title}</h1>
        {slide.summary && <p>{slide.summary}</p>}
        {slide.link?.href && (
          <Link className="display-link" href={slide.link.href}>
            {slide.link.label} <span aria-hidden="true">»</span>
          </Link>
        )}
      </div>
      {stories.length > 1 && (
        <div className="hero__controls">
          <button type="button" onClick={() => advance(-1)} aria-label="Previous featured story">
            ‹
          </button>
          <span className="sr-only" aria-live={focused ? 'polite' : 'off'}>
            {active + 1} of {stories.length}
          </span>
          <button type="button" onClick={() => advance(1)} aria-label="Next featured story">
            ›
          </button>
        </div>
      )}
      {celebration?.title && heroInView && (
        <aside className="celebration">
          <h2>{celebration.title}</h2>
          {celebration.link?.href && (
            <Link href={celebration.link.href}>
              <span className="small-seed" aria-hidden="true" />
              {celebration.link.label}
            </Link>
          )}
        </aside>
      )}
    </section>
  )
}
