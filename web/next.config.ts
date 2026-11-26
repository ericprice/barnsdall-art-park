import {legacyRedirects} from '../shared/routes'
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return legacyRedirects
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/i18fhbsv/**'},
    ],
  },
}

export default nextConfig
