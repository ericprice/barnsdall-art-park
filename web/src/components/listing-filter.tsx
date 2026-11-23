'use client'

import Link from 'next/link'
import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react'

export function ListingFilter({
  label,
  value,
  choices,
}: {
  label: string
  value: string
  choices: {value: string; label: string; href: string}[]
}) {
  const [expanded, setExpanded] = useState(false)
  const filter = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const activeChoice = useRef<HTMLAnchorElement>(null)
  const moveFocus = useRef(false)
  const optionsId = useId()
  const selected = choices.find((choice) => choice.value === value)

  useEffect(() => {
    if (!expanded) return
    function dismissOutside(event: PointerEvent) {
      if (event.target instanceof Node && !filter.current?.contains(event.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('pointerdown', dismissOutside)
    return () => document.removeEventListener('pointerdown', dismissOutside)
  }, [expanded])

  useLayoutEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    const target = expanded ? activeChoice.current : toggle.current
    target?.focus({preventScroll: true})
  }, [expanded])

  function closeAndFocusToggle() {
    moveFocus.current = true
    setExpanded(false)
  }

  return (
    <div
      className="listing-filter"
      ref={filter}
      onKeyDown={(event) => {
        if (expanded && event.key === 'Escape') {
          event.preventDefault()
          closeAndFocusToggle()
        }
      }}
    >
      <button
        type="button"
        ref={toggle}
        hidden={expanded}
        aria-expanded={expanded}
        aria-controls={optionsId}
        onClick={(event) => {
          moveFocus.current = event.detail === 0
          setExpanded(true)
        }}
      >
        {label}: {selected?.label} <span aria-hidden="true">+</span>
      </button>
      <div
        id={optionsId}
        className="listing-filter__options"
        role="group"
        aria-label={label}
        hidden={!expanded}
      >
        {expanded &&
          choices.map((choice) => (
            <Link
              key={choice.value}
              href={choice.href}
              scroll={false}
              prefetch={false}
              ref={choice === selected ? activeChoice : undefined}
              aria-current={choice === selected ? 'true' : undefined}
              onNavigate={closeAndFocusToggle}
            >
              {choice.label}
            </Link>
          ))}
      </div>
    </div>
  )
}
