'use client'

import {useRouter} from 'next/navigation'
import type {InterfaceText} from '@/lib/content'
import {newsletterPrefillKey} from '@/lib/newsletter-prefill'

export function NewsletterSignup({
  labels,
  action,
  emailField,
  signupPage,
  contactForm,
}: {
  labels: InterfaceText
  action?: string
  emailField?: string
  signupPage?: string
  contactForm?: boolean
}) {
  const router = useRouter()
  const completeOnContact = !action && contactForm
  if (!action && !signupPage && !contactForm) return null
  return (
    <div className="foundation-newsletter">
      <form
        method={action ? 'post' : 'get'}
        action={action || (contactForm ? '/contact#subscribe' : signupPage)}
        aria-label={labels.newsletterTitle}
        onSubmit={
          completeOnContact
            ? (event) => {
                event.preventDefault()
                const email =
                  event.currentTarget.querySelector<HTMLInputElement>('input[type=email]')?.value
                if (email) {
                  try {
                    sessionStorage.setItem(newsletterPrefillKey, email)
                  } catch {
                    /* Storage can be unavailable in private browsing. */
                  }
                  window.dispatchEvent(new Event(newsletterPrefillKey))
                }
                router.push('/contact#subscribe')
              }
            : undefined
        }
      >
        <input
          id="newsletter-email"
          type="email"
          name={action ? emailField || 'email' : undefined}
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
