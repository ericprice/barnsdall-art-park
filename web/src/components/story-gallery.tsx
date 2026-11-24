'use client'

import {useState} from 'react'
import type {ImageSource, InterfaceText} from '@/lib/content'
import type {OrganizationTheme} from '../../../shared/organizations'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'
import {useCarouselSwipe} from './use-carousel-swipe'

export function StoryGallery({
  images,
  orgTheme,
  showCaption,
  text,
}: {
  text: InterfaceText
  images: NonNullable<ImageSource>[]
  orgTheme?: OrganizationTheme
  showCaption: boolean
}) {
  const [index, setIndex] = useState(0)
  function advance(direction: number) {
    setIndex((value) => (value + direction + images.length) % images.length)
  }
  const swipe = useCarouselSwipe(images.length, advance)
  const image = images[index]
  if (!image) return null
  const caption = typeof image === 'string' ? undefined : image.caption
  return (
    <figure className="story-gallery" {...swipe}>
      <div className="story-gallery__frame">
        <div className="story-gallery__photo">
          <ParkImage
            orgTheme={orgTheme}
            image={image}
            priority
            sizes="(max-width: 44rem) 90vw, 64vw"
          />
        </div>
        {images.length > 1 && (
          <div className="story-gallery__buttons" style={orgTheme && {color: orgTheme.dark}}>
            <button type="button" aria-label={text.previousPhoto} onClick={() => advance(-1)}>
              <CarouselChevron direction="previous" />
            </button>
            <button type="button" aria-label={text.nextPhoto} onClick={() => advance(1)}>
              <CarouselChevron direction="next" />
            </button>
          </div>
        )}
      </div>
      {showCaption && caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
