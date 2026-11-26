import type {ComponentProps, ReactNode} from 'react'
import Link from './route-link'

type LinkProps = ComponentProps<typeof Link>

export function DisplayLinkContent({
  children,
  arrow = '»',
}: {
  children: ReactNode
  arrow?: '»' | '↗'
}) {
  return (
    <>
      {children} <span aria-hidden="true">{arrow}</span>
    </>
  )
}

export function DisplayLink({
  children,
  className,
  arrow,
  size,
  ...props
}: LinkProps & {arrow?: '»' | '↗'; size?: 'label' | 'body'}) {
  return (
    <Link
      {...props}
      className={className ? `display-link ${className}` : 'display-link'}
      data-size={size}
    >
      <DisplayLinkContent arrow={arrow}>{children}</DisplayLinkContent>
    </Link>
  )
}
