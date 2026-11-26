import Image from 'next/image'
import {useId, type CSSProperties} from 'react'
import {SanityImage} from './sanity-image'
import {imageAspectRatio, imageBuilder, imageFocus} from '@/sanity/image'
import {isCutout, duotoneMatrix} from '@/lib/image-theme'
import type {OrganizationTheme} from '../../../shared/organizations'
import type {ImageSource} from '@/lib/content'

export function ParkImage({
  image,
  className,
  intrinsicWidth,
  fallbackAlt = '',
  priority = false,
  sizes = '(max-width: 44rem) 90vw, 33vw',
  editorial = false,
  orgTheme,
}: {
  image: ImageSource
  className?: string
  intrinsicWidth?: number
  fallbackAlt?: string
  priority?: boolean
  sizes?: string
  editorial?: boolean
  orgTheme?: OrganizationTheme
}) {
  const filterId = 'duotone-' + useId().replace(/[^\w-]/g, '')
  if (!image) return null
  const ratio = imageAspectRatio(image)
  if (typeof image !== 'string' && !ratio) return null
  const local = typeof image === 'string'
  const svg = local ? image.endsWith('.svg') : image.asset?._ref.endsWith('-svg')
  const src = local ? image : imageBuilder.image(image).url()
  const ImageComponent = local || svg ? Image : SanityImage
  const artwork = editorial ? image : undefined
  const tint = orgTheme && !isCutout(artwork)
  const style = {
    '--image-focus': imageFocus(image),
    filter: tint ? `var(--duotone-adjustment) url(#${filterId})` : undefined,
  } as CSSProperties
  const dimensions = intrinsicWidth
    ? {width: intrinsicWidth, height: Math.max(1, Math.round(intrinsicWidth / (ratio ?? 2)))}
    : {fill: true}
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
      <ImageComponent
        src={src}
        alt={local ? fallbackAlt : image.decorative ? '' : image.alt || fallbackAlt}
        {...dimensions}
        unoptimized={svg}
        className={className}
        sizes={sizes}
        preload={priority}
        style={style}
      />
    </>
  )
}
