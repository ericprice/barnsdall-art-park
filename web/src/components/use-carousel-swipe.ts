import {useRef, type MouseEvent, type PointerEvent} from 'react'

const swipeDistance = 40

export function useCarouselSwipe(
  slideCount: number,
  advance: (direction: -1 | 1) => void,
  onTouchingChange?: (touching: boolean) => void,
) {
  const touchStart = useRef<{id: number; x: number; y: number} | null>(null)
  const swiped = useRef(false)

  function startSwipe(event: PointerEvent<HTMLElement>) {
    swiped.current = false
    if (event.pointerType !== 'touch') return
    touchStart.current = event.isPrimary
      ? {id: event.pointerId, x: event.clientX, y: event.clientY}
      : null
    onTouchingChange?.(event.isPrimary)
  }

  function endSwipe(event: PointerEvent<HTMLElement>) {
    const start = touchStart.current
    if (!start || start.id !== event.pointerId) return
    touchStart.current = null
    onTouchingChange?.(false)
    if (event.type !== 'pointerup') return

    const horizontal = event.clientX - start.x
    const vertical = event.clientY - start.y
    if (Math.abs(horizontal) < swipeDistance || Math.abs(horizontal) <= Math.abs(vertical)) return
    swiped.current = true
    advance(horizontal < 0 ? 1 : -1)
  }

  if (slideCount < 2) return {}
  return {
    'data-swipeable': true,
    onPointerDown: startSwipe,
    onPointerUp: endSwipe,
    onPointerCancel: endSwipe,
    onLostPointerCapture: endSwipe,
    onClickCapture(event: MouseEvent<HTMLElement>) {
      // A swipe starting on a link or button should only advance the carousel.
      if (swiped.current && event.detail > 0) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
  }
}
