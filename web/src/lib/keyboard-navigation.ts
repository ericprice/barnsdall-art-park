// A text input also matches :focus-visible after a pointer click. Track navigation
// keys separately so typing or moving the caret doesn't turn on a focus indicator.
export function trackKeyboardNavigation() {
  const root = document.documentElement
  const attribute = 'data-keyboard-navigation'
  const events = new AbortController()
  const options = {capture: true, signal: events.signal}

  function onKeyDown(event: KeyboardEvent) {
    if (event.isComposing || event.ctrlKey || event.metaKey) return
    const target = event.target
    const control = target instanceof Element && target.closest('a, button')
    if (
      event.key === 'Tab' ||
      event.key === 'Enter' ||
      (event.key === 'Escape' && target instanceof Element && target.closest('.park-header')) ||
      (control && ['ArrowDown', 'ArrowUp', ' '].includes(event.key))
    ) {
      root.toggleAttribute(attribute, true)
      document.addEventListener('pointermove', onPointer, options)
    }
  }

  function onPointer() {
    root.removeAttribute(attribute)
    document.removeEventListener('pointermove', onPointer, true)
  }

  document.addEventListener('keydown', onKeyDown, options)
  document.addEventListener('pointerdown', onPointer, options)

  return () => {
    events.abort()
    onPointer()
  }
}
