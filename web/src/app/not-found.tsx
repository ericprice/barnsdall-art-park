import Link from 'next/link'
import {getSite} from '@/lib/content'

export default async function NotFound() {
  const {settings} = await getSite()
  return (
    <main id="main-content" className="interior">
      <h1>{settings.interfaceText.notFound}</h1>
      <Link className="display-link" href="/">
        {settings.interfaceText.home}
      </Link>
    </main>
  )
}
