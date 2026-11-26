import {useEffect, useLayoutEffect, useRef, useState} from 'react'

export function usePinnedHeader() {
  const [pinned, setPinned] = useState(false)
  const header = useRef<HTMLElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const previousNavPositions = useRef<Map<HTMLElement, number> | null>(null)

  useEffect(() => {
    if (!intro.current) return
    let wasPinned: boolean | undefined
    const observer = new IntersectionObserver(([entry]) => {
      const nextPinned = entry.boundingClientRect.bottom < 0
      if (nextPinned === wasPinned) return
      if (
        wasPinned !== undefined &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        const labels = header.current?.querySelectorAll<HTMLElement>(
          '.park-navigation__label, .park-navigation__mobile > button:first-child',
        )
        previousNavPositions.current = new Map(
          Array.from(labels ?? [], (label) => [label, label.getBoundingClientRect().left]),
        )
      }
      wasPinned = nextPinned
      setPinned(nextPinned)
    })
    observer.observe(intro.current)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const previous = previousNavPositions.current
    previousNavPositions.current = null
    if (!previous) return

    // Let flexbox set the final spacing, then ease each label from its previous position.
    const moves = Array.from(
      previous,
      ([label, left]) => [label, left - label.getBoundingClientRect().left] as const,
    )
    const timing = {duration: 260, easing: 'ease-out'}
    const animations = moves.flatMap(([label, distance]) =>
      distance ? [label.animate({transform: [`translateX(${distance}px)`, 'none']}, timing)] : [],
    )
    if (pinned) {
      header.current?.querySelectorAll('.compact-home').forEach((mark) => {
        animations.push(mark.animate({opacity: [0, 1]}, {...timing, easing: 'ease-in'}))
      })
    }
    return () => animations.forEach((animation) => animation.cancel())
  }, [pinned])

  return {pinned, header, intro}
}
