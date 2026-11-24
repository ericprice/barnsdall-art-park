import {createImageUrlBuilder} from '@sanity/image-url'
import {tryGetImageDimensions} from '@sanity/asset-utils'
import type {ImageSource} from '@/lib/content'
import {dataset, projectId} from './env'

export const imageBuilder = createImageUrlBuilder({projectId, dataset})

export function imageAspectRatio(image: ImageSource) {
  if (typeof image !== 'object' || !image?.asset) return
  const dimensions = tryGetImageDimensions(image.asset._ref)
  if (!dimensions) return

  const {left = 0, right = 0, top = 0, bottom = 0} = image.crop ?? {}
  const ratio = (dimensions.aspectRatio * (1 - left - right)) / (1 - top - bottom)
  if (Number.isFinite(ratio) && ratio > 0) return ratio
}
