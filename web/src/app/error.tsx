'use client'

export default function ErrorPage({reset}: {reset: () => void}) {
  return (
    <main id="main-content" className="interior">
      <h1>A brief interruption</h1>
      <p>We couldn’t load this page. Please try again.</p>
      <button type="button" className="display-link" onClick={reset}>
        Try again »
      </button>
    </main>
  )
}
