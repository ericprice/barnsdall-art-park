'use client'

import Image, {type ImageLoaderProps, type ImageProps} from 'next/image'

// The source URL already contains Sanity's editorial crop. Next supplies each srcset width.
function sanityLoader({src, width, quality}: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  return url.toString()
}

export function SanityImage({alt, ...props}: ImageProps) {
  return <Image {...props} alt={alt} loader={sanityLoader} />
}
