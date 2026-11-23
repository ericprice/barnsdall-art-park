'use client'

import {useState} from 'react'
import type {ImageSource, InterfaceText} from '@/lib/content'
import type {OrganizationTheme} from '../../../shared/organizations'
import {ParkImage} from './park-image'
import {CarouselChevron} from './carousel-chevron'

export function StoryGallery({
  images,
  orgTheme,
  showCaption,
  chevrons = false,
  text,
}: {
  text: InterfaceText
  images: NonNullable<ImageSource>[]
  orgTheme?: OrganizationTheme
  showCaption: boolean
  chevrons?: boolean
}) {
  const [index, setIndex] = useState(0)
  const image = images[index]
  if (!image) return null
  const caption = typeof image === 'string' ? undefined : image.caption
  return (
    <figure className="story-gallery">
      <div className="story-gallery__photo">
        <ParkImage
          orgTheme={orgTheme}
          image={image}
          priority
          sizes="(max-width: 44rem) 90vw, 64vw"
        />
      </div>
      {images.length > 1 && (
        <div className="story-gallery__buttons">
          <button
            type="button"
            aria-label={text.previousPhoto}
            onClick={() => setIndex((index + images.length - 1) % images.length)}
          >
            {chevrons ? <CarouselChevron direction="previous" /> : '‹'}
          </button>
          <button
            type="button"
            aria-label={text.nextPhoto}
            onClick={() => setIndex((index + 1) % images.length)}
          >
            {chevrons ? <CarouselChevron direction="next" /> : '›'}
          </button>
        </div>
      )}
      {showCaption && caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
