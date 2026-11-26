'use client'

import {useState, type CSSProperties} from 'react'
import type {ImageSource} from '@/lib/content'
import {interfaceText as labels} from '../../../shared/interface'
import {imageAspectRatio} from '@/sanity/image'
import type {OrganizationTheme} from '../../../shared/organizations'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

export function StoryGallery({
  images,
  orgTheme,
  showCaption,
}: {
  images: NonNullable<ImageSource>[]
  orgTheme?: OrganizationTheme
  showCaption: boolean
}) {
  const [index, setIndex] = useState(0)
  function advance(direction: number) {
    if (images.length < 2) return
    setIndex(
      (value) => (Math.min(value, images.length - 1) + direction + images.length) % images.length,
    )
  }
  const swipe = useCarouselSwipe(images.length, advance)
  const image = images[Math.min(index, images.length - 1)]
  if (!image) return null
  const caption = typeof image === 'string' ? undefined : image.caption
  const imageRatio = imageAspectRatio(image)
  return (
    <figure
      className="story-gallery"
      style={imageRatio ? ({'--story-image-ratio': imageRatio} as CSSProperties) : undefined}
      {...swipe}
    >
      <div className="story-gallery__frame">
        <div className="story-gallery__photo">
          <ParkImage
            orgTheme={orgTheme}
            image={image}
            priority
            sizes="(max-width: 44rem) 90vw, (max-width: 64rem) 66vw, 42rem"
          />
        </div>
        {images.length > 1 && (
          <div
            className="story-gallery__buttons"
            style={
              orgTheme && ({color: orgTheme.dark, '--hover-color': 'var(--ink)'} as CSSProperties)
            }
          >
            <button type="button" aria-label={labels.previousPhoto} onClick={() => advance(-1)}>
              <CarouselChevron direction="previous" />
            </button>
            <button type="button" aria-label={labels.nextPhoto} onClick={() => advance(1)}>
              <CarouselChevron direction="next" />
            </button>
          </div>
        )}
      </div>
      {showCaption && caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
