import type {CSSProperties} from 'react'
import {organizationTheme, type OrganizationTheme} from '../../../shared/organizations'
import type {ImageSource} from './content'

function artworkPresentation(image: ImageSource) {
  return typeof image === 'object' && image?._type === 'editorialImage'
    ? image.presentation
    : undefined
}

export function isCutout(image: ImageSource) {
  const presentation = artworkPresentation(image)
  return presentation === 'roseCutout' || presentation === 'closeCutout'
}

function imageColors(theme: OrganizationTheme, artwork?: ImageSource) {
  switch (artworkPresentation(artwork)) {
    case 'rose':
      return {light: '#F2DBDF', dark: '#E0A8B5'}
    case 'roseCutout':
      return {light: '#E0A8B5', dark: theme.dark}
    default:
      return theme
  }
}

export function themeStyle(theme: OrganizationTheme, artwork?: ImageSource): CSSProperties {
  const {light, dark} = imageColors(theme, artwork)
  return {
    '--cutout-scale': artworkPresentation(artwork) === 'closeCutout' ? 1.9 : undefined,
    '--org-light': light,
    '--org-dark': dark,
  } as CSSProperties
}

export function duotoneMatrix(theme: OrganizationTheme, artwork?: ImageSource) {
  const {light, dark} = imageColors(theme, artwork)
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
