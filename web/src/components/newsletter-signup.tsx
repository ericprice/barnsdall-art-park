'use client'

import {useRouteNavigation} from './route-link'
import {newsletterPrefillKey} from '@/lib/newsletter-prefill'
import {interfaceText as labels} from '../../../shared/interface'

const signupHref = '/contact#subscribe'

export function NewsletterSignup() {
  const navigate = useRouteNavigation()
  return (
    <div className="foundation-newsletter">
      <form
        action={signupHref}
        aria-label={labels.newsletterTitle}
        onSubmit={(event) => {
          event.preventDefault()
          const email = event.currentTarget.querySelector<HTMLInputElement>('input[type=email]')?.value
          if (email) {
            try {
              sessionStorage.setItem(newsletterPrefillKey, email)
              window.dispatchEvent(new Event(newsletterPrefillKey))
            } catch {
              /* Storage can be unavailable in private browsing. */
            }
          }
          navigate(signupHref)
        }}
      >
        <input
          id="newsletter-email"
          type="email"
          placeholder={labels.newsletterTitle}
          autoComplete="email"
          aria-label={`${labels.newsletterTitle} — ${labels.emailAddress}`}
          required
        />
        <button type="submit">
          <span>{labels.subscribe}</span>
          <i aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
