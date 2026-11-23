import type {CSSProperties} from 'react'
import {drawDots} from '@/lib/identity-dots'
import {PortableText} from 'next-sanity'
import {ParkImage} from './park-image'
import {headingAnchor, linkDestination} from '@/lib/body-layout'
import type {OrganizationTheme} from '../../../shared/organizations'
import type {ParkImage as ImageValue, RichText as RichTextValue} from '../../sanity.types'

export function RichText({value, orgTheme}: {value?: RichTextValue; orgTheme?: OrganizationTheme}) {
  if (!value?.length) return null
  return (
    <div className="rich-text">
      <PortableText
        value={value}
        components={{
          list: {
            bullet: ({value, children}) => {
              const style = Object.fromEntries(
                drawDots(Math.min(value.children.length, 14)).map((dot, index) => [
                  `--list-dot-${index + 1}`,
                  `url('/identity/dots/${dot}.svg')`,
                ]),
              ) as CSSProperties
              return (
                <ul className="rich-text__bullets" role="list" style={style}>
                  {children}
                </ul>
              )
            },
          },
          block: {
            h2: ({value, children}) => <h2 id={headingAnchor(value)}>{children}</h2>,
            h3: ({value, children}) => <h3 id={headingAnchor(value)}>{children}</h3>,
          },
          types: {
            parkImage: ({value}: {value: ImageValue}) => (
              <figure>
                <div className="rich-text__image">
                  <ParkImage
                    image={value}
                    orgTheme={orgTheme}
                    sizes="(max-width: 44rem) 95vw, 65vw"
                  />
                </div>
                {value.caption && <figcaption>{value.caption}</figcaption>}
              </figure>
            ),
          },
          marks: {
            download: ({value, children}) => {
              const href = value && linkDestination(value)
              return href ? (
                <a href={href} download>
                  {children}
                </a>
              ) : (
                <>{children}</>
              )
            },
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
