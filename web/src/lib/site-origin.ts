// Only the configured public site supplies canonical URLs. Review deployments never advertise their host.
function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (!configured || process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development')
    return
  const url = new URL(configured)
  if (!['http:', 'https:'].includes(url.protocol))
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) URL.')
  return new URL(url.origin)
}

export const publicOrigin = siteOrigin()
