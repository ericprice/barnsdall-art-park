import Link from '@/components/route-link'
import {interfaceText} from '../../../shared/interface'

export default function NotFound() {
  return (
    <main id="main-content" className="interior">
      <h1>{interfaceText.notFound}</h1>
      <Link className="display-link" href="/">
        {interfaceText.home}
      </Link>
    </main>
  )
}
