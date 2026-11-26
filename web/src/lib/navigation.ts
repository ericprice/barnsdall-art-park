import type {NavItem} from './content'

export function isCurrentNavigationItem(item: NavItem, pathname: string) {
  const matches = (href: string) => {
    const path = href.split(/[?#]/)[0]
    return Boolean(path) && (pathname === path || pathname.startsWith(path + '/'))
  }
  return Boolean(
    (item.href && matches(item.href)) || item.children?.some((child) => matches(child.href)),
  )
}
