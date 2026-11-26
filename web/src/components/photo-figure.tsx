import type {ComponentProps} from 'react'
import {ParkImage} from './park-image'

export function PhotoFigure({
  image,
  frameClassName,
  className,
  ...props
}: Pick<ComponentProps<typeof ParkImage>, 'image' | 'sizes' | 'orgTheme'> & {
  frameClassName: string
  className?: string
}) {
  if (!image || (typeof image !== 'string' && !image.asset)) return null
  return (
    <figure className={className}>
      <div className={frameClassName}>
        <ParkImage image={image} {...props} />
      </div>
      {typeof image !== 'string' && image.caption && <figcaption>{image.caption}</figcaption>}
    </figure>
  )
}
