import {randomInt} from 'node:crypto'
import {cache} from 'react'

export function drawDots(count: number) {
  const available: number[] = []
  return Array.from({length: count}, () => {
    if (available.length === 0) {
      for (let number = 1; number <= 14; number++) available.push(number)
    }
    return available.splice(randomInt(available.length), 1)[0]
  })
}

// Each server render gets its own shuffled sequence, shared by every dotted link.
const pageLinkDots = cache(() => drawDots(14))

export function nextLinkDot() {
  const dots = pageLinkDots()
  const dot = dots.shift()!
  dots.push(dot)
  return dot
}
