import type {CSSProperties} from 'react'
import {
  organizationTheme,
  imageArtDirection,
  imagePalette,
  type OrganizationTheme,
  type ImageArtDirection,
} from '../../../shared/organizations'
import type {ImageSource} from './content'

export function artDirection(image: ImageSource): ImageArtDirection | undefined {
  return typeof image === 'string' ? imageArtDirection[image] : (image ?? undefined)
}

export function themeStyle(theme: OrganizationTheme, image?: ImageSource): CSSProperties {
  const pair = imagePalette(theme, artDirection(image))
  return {
    '--cutout-scale': artDirection(image)?.cutoutScale,
    '--org-light': pair.light,
    '--org-dark': pair.dark,
  } as CSSProperties
}

// SVG filters operate in sRGB here so the endpoints are the exact editorial hex colors.
export function duotoneMatrix(theme: OrganizationTheme, image: ImageSource) {
  const {light, dark} = imagePalette(theme, artDirection(image))
  const rows = [1, 3, 5].map((offset) => {
    const lo = parseInt(dark.slice(offset, offset + 2), 16) / 255
    const hi = parseInt(light.slice(offset, offset + 2), 16) / 255
    return [0.2126 * (hi - lo), 0.7152 * (hi - lo), 0.0722 * (hi - lo), 0, lo].join(' ')
  })
  return [...rows, '0 0 0 1 0'].join(' ')
}

export function themeForEntry(entry: {
  id: string
  orgTheme?: OrganizationTheme
  organization?: string | null
}) {
  return entry.orgTheme ?? organizationTheme(undefined, entry.organization || entry.id)
}
