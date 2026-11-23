'use client'

import {useState} from 'react'
import type {ImageSource, InterfaceText} from '@/lib/content'
import type {OrganizationTheme} from '../../../shared/organizations'
import {ParkImage} from './park-image'

export function StoryGallery({
  images,
  orgTheme,
  text,
}: {
  text: InterfaceText
  images: NonNullable<ImageSource>[]
  orgTheme?: OrganizationTheme
}) {
  const [index, setIndex] = useState(0)
  const image = images[index]
  if (!image) return null
  const caption =
    typeof image === 'string' ? null : [image.caption, image.credit].filter(Boolean).join(' · ')
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
            ‹
          </button>
          <button
            type="button"
            aria-label={text.nextPhoto}
            onClick={() => setIndex((index + 1) % images.length)}
          >
            ›
          </button>
        </div>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
