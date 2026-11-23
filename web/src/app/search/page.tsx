import {redirect} from 'next/navigation'

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{q?: string | string[]}>
}) {
  const {q} = await searchParams
  const query = typeof q === 'string' ? q.slice(0, 200) : ''
  redirect('/#site-search' + (query ? '?' + new URLSearchParams({q: query}) : ''))
}
