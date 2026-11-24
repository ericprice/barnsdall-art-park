import Image from 'next/image'
import {useId} from 'react'
import {imageBuilder} from '@/sanity/image'
import {isCutout, duotoneMatrix} from '@/lib/image-theme'
import type {OrganizationTheme} from '../../../shared/organizations'
import type {ImageSource} from '@/lib/content'

export function ParkImage({
  image,
  className,
  priority = false,
  sizes = '(max-width: 44rem) 90vw, 33vw',
  editorial = false,
  orgTheme,
}: {
  image: ImageSource
  className?: string
  priority?: boolean
  sizes?: string
  editorial?: boolean
  orgTheme?: OrganizationTheme
}) {
  const filterId = 'duotone-' + useId().replace(/[^\w-]/g, '')
  if (!image) return null
  const svgAsset = typeof image !== 'string' && image.asset?._ref.endsWith('-svg')
  const src =
    typeof image === 'string'
      ? image
      : image.asset
        ? svgAsset
          ? imageBuilder.image(image).url()
          : imageBuilder.image(image).width(1600).auto('format').url()
        : null
  if (!src) return null
  const artwork = editorial ? image : undefined
  const tint = orgTheme && !isCutout(artwork)
  return (
    <>
      {tint && (
        <svg
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
          style={{position: 'absolute'}}
        >
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={duotoneMatrix(orgTheme, artwork)} />
            </filter>
          </defs>
        </svg>
      )}
      <Image
        src={src}
        alt={typeof image === 'string' ? '' : image.decorative ? '' : (image.alt ?? '')}
        fill
        unoptimized={svgAsset || (typeof image === 'string' && image.endsWith('.svg'))}
        className={className}
        sizes={sizes}
        priority={priority}
        style={tint ? {filter: `var(--duotone-adjustment) url(#${filterId})`} : undefined}
      />
    </>
  )
}
