import {searchContent} from '@/lib/content'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 200)
  const results = query ? await searchContent(query) : []
  return Response.json(results.map(({id, title, href}) => ({id, title, href})))
}
