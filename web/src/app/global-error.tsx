'use client'

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
        <h1>A brief interruption</h1>
        <p>We couldn’t reach the park’s website content. Please try again shortly.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  )
}
