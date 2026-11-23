import Link from 'next/link'
import type {ComponentProps} from 'react'

export function DotLink({children, ...props}: ComponentProps<typeof Link>) {
  return (
    <Link {...props}>
      <span className="small-seed" aria-hidden="true" />
      {children}
    </Link>
  )
}
