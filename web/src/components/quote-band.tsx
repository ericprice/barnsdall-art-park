import {randomInt} from 'node:crypto'
import {connection} from 'next/server'
import {getSite} from '@/lib/content'
import {hexColor} from '../../../shared/organizations'
import {QuoteCarousel, type QuoteColors} from './quote-carousel'

export async function QuoteBand() {
  const {settings, organizationColors} = await getSite()
  const pool = (settings.quotes ?? []).flatMap((item, dotIndex) =>
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

  const palette = new Map<string, QuoteColors>()
  for (const organization of organizationColors) {
    const light = hexColor(organization.light)
    const dark = hexColor(organization.dark)
    if (light && dark) palette.set(`${light}/${dark}`.toLowerCase(), {light, dark})
  }

  return <QuoteCarousel quotes={pool} palette={[...palette.values()]} />
}
