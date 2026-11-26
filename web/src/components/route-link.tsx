'use client'

import NextLink from 'next/link'
import {useRouter} from 'next/navigation'
import {createContext, startTransition, useCallback, useContext, type ComponentProps} from 'react'

type LinkProps = ComponentProps<typeof NextLink>
type NavigationOptions = Pick<LinkProps, 'replace' | 'scroll' | 'transitionTypes'>

export const RouteTransition =
  createContext<(action: () => void, target: URL, anchor?: string) => void>(startTransition)

export function useRouteNavigation() {
  const router = useRouter()
  const transition = useContext(RouteTransition)

  return useCallback(
    (href: string, {replace, ...options}: NavigationOptions = {}) => {
      const current = window.location
      const target = new URL(href, current.href)
      const fragment = target.hash.slice(1)
      // These legacy fragments trigger actions through the URL instead of scrolling to an element.
      const legacyAction =
        fragment.split('?')[0] === 'site-search' ||
        (target.pathname === '/visit' && fragment === 'policies')
      const anchor = target.origin === current.origin && !legacyAction ? fragment : ''
      const destination = anchor ? target.pathname + target.search : href
      const samePage = anchor && destination === current.pathname + current.search

      transition(
        () => {
          if (samePage) {
            if (current.hash) window.history.replaceState(window.history.state, '', destination)
            return
          }
          const navigationOptions = anchor ? {...options, scroll: false} : options
          if (replace) router.replace(destination, navigationOptions)
          else router.push(destination, navigationOptions)
        },
        target,
        anchor && options.scroll !== false ? anchor : undefined,
      )
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
