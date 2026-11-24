'use client'

import {interfaceText} from '../../../shared/interface'

export default function GlobalError({reset}: {reset: () => void}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '3rem',
          maxWidth: '40rem',
          margin: 'auto',
        }}
      >
        <h1>{interfaceText.error}</h1>
        <p>{interfaceText.unavailable}</p>
        <button type="button" onClick={reset}>
          {interfaceText.retry}
        </button>
      </body>
    </html>
  )
}
