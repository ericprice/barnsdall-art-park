'use client'

import {useEffect, useRef, useState, type ComponentProps} from 'react'

type Props = Omit<ComponentProps<'input'>, 'placeholder'> & {
  phrases: readonly string[]
  initialIndex?: number
}

export function RotatingPlaceholderInput({phrases, initialIndex = 0, ...inputProps}: Props) {
  const [index, setIndex] = useState(initialIndex)
  const hint = useRef<HTMLSpanElement>(null)
  const count = phrases.length
  const activeIndex = count ? index % count : 0

  useEffect(() => {
    if (count < 2 || !hint.current) return
    let timer: number | undefined
    // The hint leaves the viewport when scrolled away and disappears when the input has a value.
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer)
      if (entry.isIntersecting) {
        timer = window.setInterval(() => setIndex((current) => (current + 1) % count), 4000 / 1.5)
      }
    })
    observer.observe(hint.current)
    return () => {
      observer.disconnect()
      window.clearInterval(timer)
    }
  }, [count])

  return (
    <div className="inline-form__field">
      <input {...inputProps} placeholder={phrases[activeIndex]} />
      {count > 0 && (
        <span ref={hint} className="inline-form__placeholder" aria-hidden="true">
          {phrases.map((phrase, i) => (
            <span key={`${i}:${phrase}`} data-active={i === activeIndex}>
              {phrase}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
