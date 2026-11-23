import {ParkImage} from './park-image'
import Link from 'next/link'
import type {SiteContent} from '@/lib/content'
import {NewsletterSignup} from './newsletter-signup'
import {interfaceText} from '../../../shared/interface'

const copyrightYear = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  year: 'numeric',
})

export function SiteFooter({settings}: {settings: SiteContent['settings']}) {
  return (
    <footer className="park-footer" id="connect">
      <div className="park-footer__foundation">
        <Link href="/" className="park-footer__wordmark" aria-label={settings.title}>
          <ParkImage
            image="/identity/barnsdall-art-park-foundation.svg"
            sizes="(max-width: 44rem) 70vw, 40vw"
          />
        </Link>
        {settings.footerText && <p>{settings.footerText}</p>}
      </div>
      <div className="park-footer__connect">
        <div>
          <div className="park-footer__heading">
            <h2>{interfaceText.connect}</h2>
            {!!settings.socialLinks?.length && (
              <ul aria-label="Social media">
                {settings.socialLinks.map((link) => {
                  if (!link.href || !link.label) return null
                  return (
                    <li key={link._key}>
                      <a href={link.href} aria-label={link.label}>
                        {link.icon ? <ParkImage image={link.icon} sizes="3rem" /> : link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <NewsletterSignup />
          <div className="park-footer__details">
            <address>{settings.address}</address>
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
          {settings.landAcknowledgment && <p>{settings.landAcknowledgment}</p>}
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
