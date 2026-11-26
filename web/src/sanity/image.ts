import {createImageUrlBuilder} from '@sanity/image-url'
import {tryGetImageDimensions} from '@sanity/asset-utils'
import type {ImageSource} from '@/lib/content'
import {dataset, projectId} from './env.ts'

export const imageBuilder = createImageUrlBuilder({projectId, dataset})

export function imageAspectRatio(image: ImageSource) {
  if (typeof image !== 'object' || !image?.asset) return
  const dimensions = tryGetImageDimensions(image.asset._ref)
  if (!dimensions) return

  const {left = 0, right = 0, top = 0, bottom = 0} = image.crop ?? {}
  const ratio = (dimensions.aspectRatio * (1 - left - right)) / (1 - top - bottom)
  if (Number.isFinite(ratio) && ratio > 0) return ratio
}

export function imageFocus(image: ImageSource) {
  if (typeof image !== 'object' || !image?.hotspot) return
  const {x, y} = image.hotspot
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y))
    return

  // Sanity stores a focal point in the original image; CSS positions the cropped image.
  const {left = 0, right = 0, top = 0, bottom = 0} = image.crop ?? {}
  const cropWidth = 1 - left - right
  const cropHeight = 1 - top - bottom
  if (cropWidth <= 0 || cropHeight <= 0) return
  const percent = (value: number) => Math.min(100, Math.max(0, value * 100))
  return `${percent((x - left) / cropWidth)}% ${percent((y - top) / cropHeight)}%`
}
