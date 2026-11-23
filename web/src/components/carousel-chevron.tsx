export function CarouselChevron({direction}: {direction: 'previous' | 'next'}) {
  return (
    <svg className="carousel-chevron" aria-hidden="true" focusable="false" viewBox="0 0 27 44">
      <path
        fill="currentColor"
        transform={direction === 'next' ? 'translate(27) scale(-1 1)' : undefined}
        d="M21.5 0 27 5.2 10.5 22 27 38.8 21.5 44 0 22Z"
      />
    </svg>
  )
}
