'use client'

import Link from 'next/link'
import {useRef, useState, type CSSProperties} from 'react'
import type {ContentEntry} from '@/lib/content'
import {themeForEntry, themeStyle} from '@/lib/image-theme'
import {DotLink} from './action-links'
import {ParkImage} from './park-image'

const dots = [1, 7, 9, 10, 11, 2, 5, 6, 8, 12, 3, 4, 13, 14]

export function ExplorePark({places, title}: {places: ContentEntry[]; title: string}) {
  const [selectedId, select] = useState(places[0]?.id)
  const previewTap = useRef(false)
  const selected = places.find((place) => place.id === selectedId) ?? places[0]
  if (!selected) return null

  // A location keeps its silhouette when an editor reorders the list.
  const ids = places.map((place) => place.id).sort()
  const locations = places.map((place) => {
    const index = ids.indexOf(place.id)
    return {place, photoDot: dots[index % dots.length], labelDot: dots[(index + 5) % dots.length]}
  })
  const selectedIndex = places.indexOf(selected)
  const column = selectedIndex % 3
  const rowSize = Math.min(3, places.length - selectedIndex + column)
  const photoPosition = rowSize === 1 ? 1 : rowSize === 2 ? column + 3 : column
  const descriptionDot = dots[(ids.indexOf(selected.id) + 10) % dots.length]

  return (
    <section className="explore" aria-labelledby="explore-heading">
      <div className="explore__picture" data-position={photoPosition} aria-hidden="true">
        {locations.map(({place, photoDot}) => (
          <div
            key={place.id}
            style={{
              ...themeStyle(themeForEntry(place)),
              maskImage: `url("/identity/dots/${photoDot}.svg")`,
            }}
            data-current={place.id === selected.id}
          >
            <ParkImage
              orgTheme={themeForEntry(place)}
              image={place.image}
              sizes="(max-width: 44rem) 70vw, 35vw"
            />
          </div>
        ))}
      </div>
      <h2 id="explore-heading">{title}</h2>
      <ul className="explore__places">
        {locations.map(({place, labelDot}) => (
          <li
            key={place.id}
            data-wrap={/^hollyhock\s+house$/i.test(place.title.trim()) ? 'words' : undefined}
          >
            <Link
              href={place.href}
              style={
                {
                  '--label-dot': `url("/identity/dots/${labelDot}.svg?fit=label")`,
                } as CSSProperties
              }
              data-current={selected.id === place.id}
              aria-describedby={selected.id === place.id ? 'explore-description' : undefined}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') select(place.id)
              }}
              onPointerDown={(event) => {
                previewTap.current = event.pointerType !== 'mouse' && place.id !== selected.id
              }}
              onFocus={() => select(place.id)}
              onClick={(event) => {
                if (event.detail > 0 && previewTap.current) {
                  event.preventDefault()
                  select(place.id)
                }
                previewTap.current = false
              }}
            >
              <span>{place.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="explore__description" id="explore-description">
        <DotLink
          href={selected.href}
          style={{'--olive-dot': `url("/identity/dots/${descriptionDot}.svg")`} as CSSProperties}
        >
          {selected.summary || selected.title}
        </DotLink>
      </p>
    </section>
  )
}
