import {PortableText} from 'next-sanity'
import {ParkImage} from './park-image'
import type {ParkImage as ImageValue, RichText as RichTextValue} from '../../sanity.types'

export function RichText({value}: {value?: RichTextValue}) {
  if (!value?.length) return null
  return (
    <div className="rich-text">
      <PortableText
        value={value}
        components={{
          types: {
            parkImage: ({value}: {value: ImageValue}) => (
              <figure>
                <div className="rich-text__image">
                  <ParkImage image={value} sizes="(max-width: 44rem) 95vw, 65vw" />
                </div>
                {value.caption && (
                  <figcaption>
                    {value.caption}
                    {value.credit ? ` · ${value.credit}` : ''}
                  </figcaption>
                )}
              </figure>
            ),
          },
          marks: {
            link: ({value, children}) => {
              const href =
                typeof value?.href === 'string' &&
                /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/.test(value.href)
                  ? value.href
                  : '#'
              return <a href={href}>{children}</a>
            },
          },
        }}
      />
    </div>
  )
}
