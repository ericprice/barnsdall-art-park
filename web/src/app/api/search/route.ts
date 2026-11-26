import {searchContent} from '@/lib/search'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 200)
  const results = query ? await searchContent(query, 5) : []
  return Response.json(results)
}
