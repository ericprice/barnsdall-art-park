'use client'

import {interfaceText} from '../../../shared/interface'

export default function ErrorPage({reset}: {reset: () => void}) {
  return (
    <main id="main-content" className="interior">
      <h1>{interfaceText.error}</h1>
      <p>{interfaceText.unavailable}</p>
      <button type="button" className="display-link" onClick={reset}>
        {interfaceText.retry} <span aria-hidden="true">»</span>
      </button>
    </main>
  )
}
