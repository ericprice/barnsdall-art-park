import type {CSSProperties} from 'react'
import {ParkImage} from './park-image'
import Link from './route-link'
import {getShell} from '@/lib/content'
import {NewsletterSignup} from './newsletter-signup'
import {FooterText} from './rich-text'
import {interfaceText} from '../../../shared/interface'

const copyrightYear = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
})

function platformIcon(href: string) {
  try {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, '')
    for (const platform of ['instagram', 'facebook', 'linkedin']) {
      if (host === platform + '.com' || host.endsWith('.' + platform + '.com'))
        return '/identity/' + platform + '.svg'
    }
  } catch {
    /* Incomplete drafts can contain an invalid URL. */
  }
}
export async function SiteFooter() {
  const {settings} = await getShell()
  return (
    <footer className="park-footer" id="connect">
      <div className="park-footer__foundation">
        <Link href="/" className="park-footer__wordmark" aria-label={settings.title}>
          <ParkImage
            image="/identity/barnsdall-art-park-foundation.svg"
            sizes="(max-width: 44rem) 70vw, 40vw"
          />
        </Link>
        {!!settings.footer.footerText?.length && (
          <div className="park-footer__copy">
            <FooterText value={settings.footer.footerText} />
          </div>
        )}
      </div>
      <div className="park-footer__connect">
        <div>
          <div className="park-footer__heading">
            <h2>{interfaceText.connect}</h2>
            {!!settings.socialLinks?.length && (
              <ul aria-label="Social media">
                {settings.socialLinks.map((link) => {
                  if (!link.href || !link.label) return null
                  const icon = platformIcon(link.href)
                  return (
                    <li key={link._key}>
                      <a href={link.href} aria-label={link.label}>
                        {icon ? (
                          <span
                            className="park-footer__social-icon"
                            style={{'--social-icon': `url('${icon}')`} as CSSProperties}
                            aria-hidden="true"
                          />
                        ) : (
                          link.label
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <NewsletterSignup />
          <div className="park-footer__details">
            <address>
              <FooterText value={settings.footer.address} />
            </address>
            <ul>
              {settings.footerLinks?.map(
                (link) =>
                  link.href && (
                    <li key={link._key ?? link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ),
              )}
            </ul>
          </div>
        </div>
        <div className="park-footer__fineprint">
          <FooterText value={settings.footer.landAcknowledgment} />
          <p>©{copyrightYear.format(new Date())} Barnsdall Art Park Foundation</p>
          {settings.legalLinks.length > 0 && (
            <div className="park-footer__legal">
              {settings.legalLinks.map(({id, href, label}) => (
                <Link key={id} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
