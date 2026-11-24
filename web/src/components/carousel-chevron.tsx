export function CarouselChevron({direction}: {direction: 'previous' | 'next'}) {
  return (
    <svg className="carousel-chevron" aria-hidden="true" focusable="false" viewBox="0 0 27 44">
      <path
        fill="currentColor"
        transform={direction === 'next' ? 'translate(27) scale(-1 1)' : undefined}
        d="M20.7 0 27 6.03 11.25 22 27 37.97 20.7 44 0 22Z"
      />
    </svg>
  )
}
