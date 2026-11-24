'use client'

import {useEffect, useState} from 'react'
import type {SiteContent} from '@/lib/content'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {DotLink} from './action-links'
import {FeatureContent} from './feature-content'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

// Studio allows five featured stories. Each uses a separate identity plate silhouette.
const slideDots = [3, 13, 9, 11, 14]

export function Hero({slides, celebration}: Pick<SiteContent['home'], 'slides' | 'celebration'>) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touching, setTouching] = useState(false)
  const [atPageEnd, setAtPageEnd] = useState(false)
  const stories = slides
  const active = stories.length ? index % stories.length : 0
  const slide = stories[active]

  useEffect(() => {
    if (slides.length < 2 || hovered || focused || touching) return
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
  }, [slides.length, hovered, focused, touching])

  useEffect(() => {
    if (!celebration?.title) return

    function updatePageEnd() {
      const page = document.scrollingElement
      if (!page) return

      const scrollLimit = page.scrollHeight - page.clientHeight
      setAtPageEnd(scrollLimit > 0 && scrollLimit - page.scrollTop <= 1)
    }

    updatePageEnd()
    window.addEventListener('scroll', updatePageEnd, {passive: true})
    window.addEventListener('resize', updatePageEnd)
    const observer = new ResizeObserver(updatePageEnd)
    observer.observe(document.body)
    return () => {
      window.removeEventListener('scroll', updatePageEnd)
      window.removeEventListener('resize', updatePageEnd)
      observer.disconnect()
    }
  }, [celebration?.title])

  function advance(direction: number) {
    setIndex((value) => (value + direction + stories.length) % stories.length)
  }

  const swipe = useCarouselSwipe(stories.length, advance, setTouching)

  if (!slide) return null
  return (
    <>
      <section
        className="hero"
        style={themeStyle(themeForEntry(slide), slide.image)}
        aria-roledescription="carousel"
        aria-label="Featured stories"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        {...swipe}
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
              style={{
                ...themeStyle(themeForEntry(story), story.image),
                maskImage: `url('/identity/dots/${slideDots[i % slideDots.length]}.svg')`,
              }}
              data-current={i === active}
              aria-hidden={i !== active}
            >
              <div className="hero__photo">
                <ParkImage
                  editorial
                  orgTheme={themeForEntry(story)}
                  image={story.image}
                  priority={i === 0}
                  sizes="(max-width: 44rem) 95vw, (max-width: 75rem) 75vw, 56.25rem"
                />
              </div>
            </div>
          ))}
        </div>
        <FeatureContent
          key={slide.id}
          className="hero__story"
          heading="h1"
          title={slide.title}
          summary={slide.summary}
          link={slide.link}
        />
        {stories.length > 1 && (
          <div className="hero__controls">
            <button type="button" onClick={() => advance(-1)} aria-label="Previous featured story">
              <CarouselChevron direction="previous" />
            </button>
            <span className="sr-only" aria-live={focused ? 'polite' : 'off'}>
              {active + 1} of {stories.length}
            </span>
            <button type="button" onClick={() => advance(1)} aria-label="Next featured story">
              <CarouselChevron direction="next" />
            </button>
          </div>
        )}
      </section>
      {celebration?.title && (
        <aside className="celebration" data-at-page-end={atPageEnd} inert={atPageEnd}>
          <h2>{celebration.title}</h2>
          {celebration.link?.href && (
            <DotLink href={celebration.link.href}>{celebration.link.label}</DotLink>
          )}
        </aside>
      )}
    </>
  )
}
