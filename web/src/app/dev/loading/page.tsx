import {notFound} from 'next/navigation'
import {LoadingDot} from '@/components/site-shell'

export const metadata = {
  title: 'Loading animation',
  robots: {index: false, follow: false},
}

export default function LoadingPreview() {
  if (process.env.NODE_ENV !== 'development') notFound()

  return (
    <main id="main-content" className="loading-preview">
      <h1 className="sr-only">Loading animation</h1>
      <LoadingDot />
    </main>
  )
}
