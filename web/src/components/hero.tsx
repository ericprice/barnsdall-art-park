'use client'

import {useCallback, useEffect, useState} from 'react'
import type {HomeContent} from '@/lib/content'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {DisplayLinkContent} from './action-links'
import {FeatureContent} from './feature-content'
import Link from './route-link'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

// Studio allows five featured stories. Each uses a separate identity plate silhouette.
const slideDots = [3, 13, 9, 11, 14]

export function Hero({slides}: Pick<HomeContent, 'slides'>) {
  const [frame, setFrame] = useState({index: 0, previous: -1})
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touching, setTouching] = useState(false)
  const active = slides.length ? frame.index % slides.length : 0
  const slide = slides[active]

  const advance = useCallback(
    (direction: number) => {
      if (slides.length < 2) return
      setFrame(({index}) => ({
        index: (index + direction + slides.length) % slides.length,
        previous: index % slides.length,
      }))
    },
    [slides.length],
  )

  useEffect(() => {
    if (slides.length < 2 || paused || hovered || focused || touching) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    function schedule() {
      window.clearInterval(timer)
      if (document.visibilityState === 'visible' && !reducedMotion.matches) {
        timer = window.setInterval(() => advance(1), 6500)
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
  }, [slides.length, paused, hovered, focused, touching, advance])

  const swipe = useCarouselSwipe(slides.length, advance, setTouching)

  if (!slide) return null
  return (
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
        {slides.map(
          (story, i) =>
            (i === active || i === frame.previous) && (
              <div
                key={story.id}
                className="hero__frame"
                data-flipped={i % 2 === 1}
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
                    priority={i === 0 && frame.previous < 0}
                    sizes="(max-width: 44rem) 95vw, (max-width: 64rem) 75vw, 48rem"
                  />
                </div>
              </div>
            ),
        )}
      </div>
      <FeatureContent
        key={slide.id}
        className="hero__story"
        heading="h1"
        title={slide.title}
        summary={slide.summary}
        link={slide.link}
      />
      {slides.length > 1 && (
        <div className="hero__controls">
          <button type="button" onClick={() => advance(-1)} aria-label="Previous featured story">
            <CarouselChevron direction="previous" />
          </button>
          <span className="sr-only" aria-live={focused ? 'polite' : 'off'}>
            {active + 1} of {slides.length}
          </span>
          <button type="button" onClick={() => advance(1)} aria-label="Next featured story">
            <CarouselChevron direction="next" />
          </button>
        </div>
      )}
      {slides.length > 1 && (
        <button
          className="hero__pause"
          type="button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? 'Play featured stories' : 'Pause featured stories'}
        >
          {paused ? 'Play' : 'Pause'}
        </button>
      )}
    </section>
  )
}

export function CelebrationBadge({celebration}: Pick<HomeContent, 'celebration'>) {
  const [atPageEnd, setAtPageEnd] = useState(false)
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

  const badgeProps = {
    className: 'celebration',
    'data-at-page-end': atPageEnd,
    inert: atPageEnd,
  }
  if (!celebration?.title) return null
  const content = (
    <>
      <h2>{celebration.title}</h2>
      {celebration.link?.href && celebration.link.label && (
        <span className="display-link">
          <DisplayLinkContent>{celebration.link.label}</DisplayLinkContent>
        </span>
      )}
    </>
  )
  return celebration.link?.href ? (
    <Link {...badgeProps} href={celebration.link.href}>
      {content}
    </Link>
  ) : (
    <aside {...badgeProps}>{content}</aside>
  )
}
