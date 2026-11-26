import {useRef, type KeyboardEvent as ReactKeyboardEvent} from 'react'
import type {NavItem} from '@/lib/content'
import Link from './route-link'

export function NavigationGroup({
  item,
  pathname,
  panelId,
  expanded,
  onOpen,
  onToggle,
  onClose,
}: {
  item: NavItem
  pathname: string
  panelId: string
  expanded: boolean
  onOpen: (trigger: HTMLElement) => void
  onToggle: (trigger: HTMLElement) => void
  onClose: () => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const hasChildren = Boolean(item.children?.length)
  if (!item.href && !hasChildren) return null
  const current = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : item.children?.some((child) => {
        const target = child.href.split(/[?#]/)[0]
        return pathname === target || pathname.startsWith(target + '/')
      })

  function focusSubmenu(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowDown' || !hasChildren) return
    event.preventDefault()
    onOpen(event.currentTarget)
    requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    })
  }
  return (
    <div className="park-navigation__group" data-open={expanded} data-current={current}>
      <span className="park-navigation__label">
        {item.href ? (
          <Link
            href={item.href}
            aria-current={current ? 'page' : undefined}
            aria-expanded={hasChildren ? expanded : undefined}
            aria-controls={hasChildren ? panelId : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
              if (hasChildren) {
                event.preventDefault()
                onToggle(event.currentTarget)
              } else {
                onClose()
              }
            }}
            onKeyDown={focusSubmenu}
          >
            {item.title}
          </Link>
        ) : (
          <button
            type="button"
            aria-current={current ? 'true' : undefined}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={(event) => onToggle(event.currentTarget)}
            onKeyDown={focusSubmenu}
          >
            {item.title}
          </button>
        )}
      </span>
      {!!item.children?.length && (
        <div className="park-navigation__links" id={panelId} ref={panel} inert={!expanded}>
          {item.children.map((child) => (
            <Link key={child.href} href={child.href} onClick={onClose}>
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
