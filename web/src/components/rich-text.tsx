import type {CSSProperties, ReactNode} from 'react'
import {drawDots} from '@/lib/identity-dots'
import {PortableText} from 'next-sanity'
import {DotLink} from './action-links'
import Link from './route-link'
import {PhotoFigure} from './photo-figure'
import {headingAnchor, linkDestination, standaloneLink} from '@/lib/body-layout'
import type {OrganizationTheme} from '../../../shared/organizations'
import type {
  FooterProse,
  ParkImage as ImageValue,
  RichText as RichTextValue,
} from '../../sanity.types'

function InlineLink({
  value,
  children,
}: {
  value?: NonNullable<FooterProse[number]['markDefs']>[number]
  children: ReactNode
}) {
  const href = value && linkDestination(value)
  return href ? <Link href={href}>{children}</Link> : <>{children}</>
}

const footerComponents = {marks: {link: InlineLink}}

export function FooterText({value}: {value?: FooterProse}) {
  return value?.length ? <PortableText value={value} components={footerComponents} /> : null
}

export function RichText({value, orgTheme}: {value?: RichTextValue; orgTheme?: OrganizationTheme}) {
  if (!value?.length) return null
  return (
    <div className="rich-text">
      <PortableText<RichTextValue[number]>
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
            lead: ({children}) => <p className="lead">{children}</p>,
            h2: ({value, children}) => <h2 id={headingAnchor(value)}>{children}</h2>,
            h3: ({value, children}) => <h3 id={headingAnchor(value)}>{children}</h3>,
            dotLink: ({value, children}) => {
              const link = standaloneLink(value)
              return (
                <p>
                  {link ? (
                    <DotLink href={link.href} download={link.download || undefined}>
                      {link.label}
                    </DotLink>
                  ) : (
                    children
                  )}
                </p>
              )
            },
          },
          types: {
            parkImage: ({value}: {value: ImageValue}) => (
              <PhotoFigure
                image={value}
                orgTheme={orgTheme}
                frameClassName="rich-text__image"
                sizes="(max-width: 44rem) 90vw, (max-width: 64rem) 49vw, 31rem"
              />
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
            link: InlineLink,
          },
        }}
      />
    </div>
  )
}
