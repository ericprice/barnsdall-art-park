import {randomInt} from 'node:crypto'
import {connection} from 'next/server'
import type {SiteContent} from '@/lib/content'
import {QuoteCarousel} from './quote-carousel'

export async function QuoteBand({quote}: {quote: SiteContent['home']['quote']}) {
  const pool = [quote, ...(quote?.additional ?? [])].flatMap((item, dotIndex) =>
    item?.text ? [{text: item.text, attribution: item.attribution, link: item.link, dotIndex}] : [],
  )

  if (pool.length === 0) return null
  if (pool.length > 1) {
    await connection()
    for (let index = pool.length - 1; index > 0; index--) {
      const other = randomInt(index + 1)
      const current = pool[index]
      pool[index] = pool[other]
      pool[other] = current
    }
  }

  return <QuoteCarousel quotes={pool} />
}
