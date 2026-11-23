import {ParkImage} from './park-image'
import Link from 'next/link'
import type {SiteContent} from '@/lib/content'
import {NewsletterSignup} from './newsletter-signup'

export function SiteFooter({settings}: {settings: SiteContent['settings']}) {
  return (
    <footer className="park-footer" id="connect">
      <div>
        <Link href="/" className="park-footer__wordmark" aria-label={settings.title}>
          <ParkImage image={settings.footerMark} sizes="(max-width: 44rem) 70vw, 40vw" />
        </Link>
        {settings.footerText && <p>{settings.footerText}</p>}
      </div>
      <div className="park-footer__connect">
        <div className="park-footer__heading">
          <h2>{settings.interfaceText.connect}</h2>
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
        <NewsletterSignup
          labels={settings.interfaceText}
          action={settings.newsletterFormAction}
          emailField={settings.newsletterEmailField}
          signupPage={settings.newsletterUrl}
          contactForm={Boolean(settings.newsletterWidgetId)}
        />
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
        {settings.landAcknowledgment && <p>{settings.landAcknowledgment}</p>}
        {settings.copyright && <p>{settings.copyright}</p>}
        {(settings.interfaceText.privacy || settings.interfaceText.terms) && (
          <div className="park-footer__legal">
            {settings.privacyUrl ? (
              <a href={settings.privacyUrl}>{settings.interfaceText.privacy}</a>
            ) : (
              <span>{settings.interfaceText.privacy}</span>
            )}
            {settings.termsUrl ? (
              <a href={settings.termsUrl}>{settings.interfaceText.terms}</a>
            ) : (
              <span>{settings.interfaceText.terms}</span>
            )}
          </div>
        )}
      </div>
    </footer>
  )
}
