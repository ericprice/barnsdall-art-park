'use client'

import NextLink from 'next/link'
import {useRouter} from 'next/navigation'
import {createContext, startTransition, useCallback, useContext, type ComponentProps} from 'react'

type LinkProps = ComponentProps<typeof NextLink>
type NavigationOptions = Pick<LinkProps, 'replace' | 'scroll' | 'transitionTypes'>

export const RouteTransition =
  createContext<(action: () => void, href: string) => void>(startTransition)

export function useRouteNavigation() {
  const router = useRouter()
  const transition = useContext(RouteTransition)

  return useCallback(
    (href: string, {replace, ...options}: NavigationOptions = {}) => {
      transition(() => {
        if (replace) router.replace(href, options)
        else router.push(href, options)
      }, href)
    },
    [router, transition],
  )
}

export default function RouteLink({
  href,
  as,
  replace,
  scroll,
  transitionTypes,
  onNavigate,
  ...props
}: LinkProps) {
  const navigate = useRouteNavigation()
  return (
    <NextLink
      {...props}
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      transitionTypes={transitionTypes}
      onNavigate={(event) => {
        if (typeof href !== 'string' || as) {
          onNavigate?.(event)
          return
        }

        // Next only calls onNavigate for same-tab app navigation.
        let canceled = false
        onNavigate?.({
          preventDefault: () => {
            canceled = true
          },
        })
        event.preventDefault()
        if (!canceled) navigate(href, {replace, scroll, transitionTypes})
      }}
    />
  )
}
