import {randomInt} from 'node:crypto'
import {connection} from 'next/server'
import {getShell} from '@/lib/content'
import {nextLinkDot} from '@/lib/identity-dots'
import {hexColor} from '../../../shared/organizations'
import {QuoteCarousel, type QuoteColors} from './quote-carousel'
import {DotLink} from './action-links'

export async function QuoteBand() {
  const {settings, organizationColors} = await getShell()
  const pool = (settings.quotes ?? []).flatMap((item, dotIndex) =>
    item?.text ? [{text: item.text, attribution: item.attribution, link: item.link, dotIndex}] : [],
  )

  if (pool.length === 0) return null

  const palette = new Map<string, QuoteColors>()
  for (const organization of organizationColors) {
    const light = hexColor(organization.light)
    const dark = hexColor(organization.dark)
    if (light && dark) palette.set(`${light}/${dark}`.toLowerCase(), {light, dark})
  }

  if (pool.length > 1 || palette.size > 1) await connection()
  for (let index = pool.length - 1; index > 0; index--) {
    const other = randomInt(index + 1)
    const current = pool[index]
    pool[index] = pool[other]
    pool[other] = current
  }

  const colors = [...palette.values()]
  const start = colors.length > 1 ? randomInt(colors.length) : 0
  // Only one quote link is visible at a time. Reserve one shape for its slot.
  const linkDot = pool.some((quote) => quote.link?.href) ? nextLinkDot() : undefined
  const quotes = pool.map(({link, ...quote}) => ({
    ...quote,
    link: link?.href ? (
      <DotLink href={link.href} dot={linkDot}>
        {link.label}
      </DotLink>
    ) : null,
  }))
  return (
    <QuoteCarousel quotes={quotes} palette={[...colors.slice(start), ...colors.slice(0, start)]} />
  )
}
