'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {newsletterPrefillKey} from '@/lib/newsletter-prefill'
import {interfaceText} from '../../../shared/interface'

const newsletterScript =
  'https://s3-us-west-2.amazonaws.com/bloomerang-public-cdn/barnsdallartparkfoundation/.widget-js/2146304.js'
const newsletterFallback = 'https://www.barnsdall.org/contact'

export function LegacyPoliciesLink() {
  const router = useRouter()
  useEffect(() => {
    function redirectHash() {
      if (window.location.hash === '#policies') router.replace('/visit/policies')
    }
    redirectHash()
    window.addEventListener('hashchange', redirectHash)
    return () => window.removeEventListener('hashchange', redirectHash)
  }, [router])
  return null
}

export function ContactSignup() {
  const container = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)
  const {subscribeConsent: consent, subscribe} = interfaceText
  useEffect(() => {
    const host = container.current
    if (!host) return
    function prefill() {
      const input = host?.querySelector<HTMLInputElement>('#email-address, input[type=email]')
      if (!input) return
      try {
        const email = sessionStorage.getItem(newsletterPrefillKey)
        if (!email) return
        input.value = email
        input.dispatchEvent(new Event('input', {bubbles: true}))
        input.dispatchEvent(new Event('change', {bubbles: true}))
        sessionStorage.removeItem(newsletterPrefillKey)
      } catch {
        /* The form also works without session storage. */
      }
    }
    window.addEventListener(newsletterPrefillKey, prefill)
    const observer = new MutationObserver(() => {
      prefill()
      const form = host.querySelector('form')
      if (!form && host.querySelector('p')) {
        setFailed(true)
        return
      }
      const submit = form?.querySelector<HTMLElement>('input[type="submit"],button[type="submit"]')
      if (!form || !submit || form.querySelector('[name="newsletter-consent"]')) return
      if (submit instanceof HTMLInputElement) submit.value = subscribe
      form.querySelectorAll<HTMLInputElement>('input.required').forEach((input) => {
        input.required = true
      })
      const label = document.createElement('label')
      label.className = 'visitor-consent'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.required = true
      checkbox.name = 'newsletter-consent'
      label.append(checkbox, document.createTextNode(consent))
      submit.before(label)
      form.addEventListener(
        'submit',
        (event) => {
          if (checkbox.checked) return
          event.preventDefault()
          event.stopImmediatePropagation()
          checkbox.reportValidity()
        },
        true,
      )
    })
    observer.observe(host, {childList: true, subtree: true})
    // The official widget inserts its own form next to this script. Its SDK handles
    // validation, submission and confirmation within this container.
    const script = document.createElement('script')
    script.src = newsletterScript
    script.async = true
    script.onerror = () => setFailed(true)
    let active = true
    queueMicrotask(() => {
      if (active) host.appendChild(script)
    })
    return () => {
      active = false
      window.removeEventListener(newsletterPrefillKey, prefill)
      observer.disconnect()
      host.replaceChildren()
    }
  }, [consent, subscribe])
  return (
    <>
      <div className="contact-subscription" hidden={failed} ref={container} />
      {failed && <a href={newsletterFallback}>{subscribe}</a>}
    </>
  )
}
