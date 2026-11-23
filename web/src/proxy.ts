import {NextResponse, type NextRequest} from 'next/server'

const retiredEventFilters = ['view', 'month', 'kind', 'type']

export function proxy(request: NextRequest) {
  if (!retiredEventFilters.some((key) => request.nextUrl.searchParams.has(key))) {
    return NextResponse.next()
  }

  const destination = request.nextUrl.clone()
  for (const key of retiredEventFilters) destination.searchParams.delete(key)
  return NextResponse.redirect(destination, 308)
}

export const config = {matcher: '/whats-on'}
