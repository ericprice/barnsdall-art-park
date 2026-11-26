'use client'

import {useCallback, useEffect, useState} from 'react'
import type {HomeContent} from '@/lib/content'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {DisplayLinkContent} from './display-link'
import {FeatureContent} from './feature-content'
import Link from './route-link'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

// Studio allows five featured stories. Each uses a separate identity plate silhouette.
const slideDots = [3, 13, 9, 11, 14]

export function Hero({slides}: Pick<HomeContent, 'slides'>) {
  const [frame, setFrame] = useState({index: 0, previous: -1})
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
    if (slides.length < 2 || hovered || focused || touching) return
    let timer: number | undefined
    function schedule() {
      window.clearInterval(timer)
      if (document.visibilityState === 'visible') {
        timer = window.setInterval(() => advance(1), 6500)
      }
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [slides.length, hovered, focused, touching, advance])

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
    </section>
  )
}

export function CelebrationBadge({celebration}: Pick<HomeContent, 'celebration'>) {
  const [footerVisible, setFooterVisible] = useState(false)
  useEffect(() => {
    if (!celebration?.title) return
    const footer = document.getElementById('connect')
    if (!footer) return

    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [celebration?.title])

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
  return (
    <div className="celebration" data-footer-visible={footerVisible} inert={footerVisible}>
      <span className="celebration__dot" aria-hidden="true" />
      {celebration.link?.href ? (
        <Link className="celebration__content" href={celebration.link.href}>
          {content}
        </Link>
      ) : (
        <aside className="celebration__content">{content}</aside>
      )}
    </div>
  )
}
