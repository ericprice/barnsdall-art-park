import {randomInt} from 'node:crypto'

export function drawDots(count: number) {
  const available: number[] = []
  return Array.from({length: count}, () => {
    if (available.length === 0) {
      for (let number = 1; number <= 14; number++) available.push(number)
    }
    return available.splice(randomInt(available.length), 1)[0]
  })
}
