'use client'

import {useEffect, useRef, useState} from 'react'
import {LoadingDot} from './site-shell'
import {useRouteNavigation} from './route-link'
import {newsletterPrefillKey} from '@/lib/newsletter-prefill'
import {interfaceText} from '../../../shared/interface'

const newsletterScript =
  'https://s3-us-west-2.amazonaws.com/bloomerang-public-cdn/barnsdallartparkfoundation/.widget-js/2146304.js'
const signupWidgetId = 'foundation-signup-widget'

export function LegacyPoliciesLink() {
  const navigate = useRouteNavigation()
  useEffect(() => {
    function redirectHash() {
      if (window.location.hash === '#policies') navigate('/visit/policies', {replace: true})
    }
    redirectHash()
    window.addEventListener('hashchange', redirectHash)
    return () => window.removeEventListener('hashchange', redirectHash)
  }, [navigate])
  return null
}

export function ContactSignup() {
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'error' | null>(null)
  const {subscribeConsent: consent, subscribe} = interfaceText
  useEffect(() => {
    const mount = container.current
    if (!mount) return
    const host = document.getElementById(signupWidgetId) ?? document.createElement('div')
    host.id = signupWidgetId
    function prefill() {
      const input = host.querySelector<HTMLInputElement>('#email-address, input[type=email]')
      const firstName = host.querySelector<HTMLInputElement>('#first-name')
      if (!input || !firstName || host.parentNode !== mount || host.hidden) return
      try {
        const email = sessionStorage.getItem(newsletterPrefillKey)
        if (!email) return
        input.value = email
        input.dispatchEvent(new Event('input', {bubbles: true}))
        input.dispatchEvent(new Event('change', {bubbles: true}))
        sessionStorage.removeItem(newsletterPrefillKey)
        firstName.focus()
      } catch {
        /* The form also works without session storage. */
      }
    }
    window.addEventListener(newsletterPrefillKey, prefill)
    function prepareForm() {
      prefill()
      const form = host.querySelector('form')
      const submit = form?.querySelector<HTMLElement>('input[type="submit"],button[type="submit"]')
      if (!form || !submit) return
      setStatus(null)
      form
        .querySelectorAll<HTMLLabelElement>('.field.text > label, .field.email > label')
        .forEach((label) => {
          const caption = label.querySelector('.label')
          const input = label.control
          if (!caption || !(input instanceof HTMLInputElement)) return
          if (input.type === 'email' && caption.textContent !== interfaceText.emailAddress) {
            caption.textContent = interfaceText.emailAddress
          }
          const marker = label.querySelector('.required-star')?.textContent.trim() ?? ''
          input.placeholder = caption.textContent.trim() + marker
          label.classList.add('sr-only')
        })
      form.querySelectorAll<HTMLInputElement>('input.required').forEach((input) => {
        input.required = true
      })
      if (form.querySelector('[name="newsletter-consent"]')) return
      if (submit instanceof HTMLInputElement) submit.value = subscribe
      const label = document.createElement('label')
      label.className = 'visitor-consent'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.required = true
      checkbox.name = 'newsletter-consent'
      label.append(checkbox, consent + '*')
      const requiredNote = document.createElement('p')
      requiredNote.className = 'visitor-required'
      requiredNote.textContent = interfaceText.requiredNote
      submit.before(label, requiredNote)
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
    }

    const observer = new MutationObserver(prepareForm)
    observer.observe(host, {childList: true, subtree: true})
    function onScriptError(event: Event) {
      if (event.target instanceof HTMLScriptElement && event.target.src === newsletterScript) {
        setStatus('error')
      }
    }
    host.addEventListener('error', onScriptError, true)
    let active = true
    const loadWidget = () => {
      if (!active) return
      mount.append(host)
      host.hidden = false
      if (!host.querySelector('form')) setStatus('loading')
      if (host.querySelector('script')) {
        prepareForm()
        return
      }
      const script = document.createElement('script')
      script.src = newsletterScript
      script.async = true
      script.addEventListener('error', () => script.remove(), {once: true})
      host.append(script)
    }
    const nearSignup = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          nearSignup.disconnect()
          loadWidget()
        }
      },
      {rootMargin: '300px'},
    )
    if (host.isConnected || window.location.hash === '#subscribe') queueMicrotask(loadWidget)
    else nearSignup.observe(mount.closest('section') ?? mount)
    return () => {
      active = false
      nearSignup.disconnect()
      window.removeEventListener(newsletterPrefillKey, prefill)
      host.removeEventListener('error', onScriptError, true)
      observer.disconnect()
      // Bloomerang initializes once per document. Keep its script, form and handlers
      // together so an in-flight load can finish and the next visit can reuse it.
      if (host.parentNode === mount) {
        host.hidden = true
        document.body.append(host)
      }
    }
  }, [consent, subscribe])
  return (
    <div className="contact-subscription">
      {status === 'loading' && (
        <div className="contact-subscription__status" role="status">
          <LoadingDot />
          <span className="sr-only">Loading signup form</span>
        </div>
      )}
      {status === 'error' && <p role="status">The signup form could not load.</p>}
      <div ref={container} />
    </div>
  )
}
