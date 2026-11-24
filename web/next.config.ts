import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {source: '/getting-here', destination: '/visit', permanent: true},
      {source: '/map', destination: '/visit#map', permanent: true},
      {source: '/rentals', destination: '/visit/rentals', permanent: true},
      {source: '/the-park', destination: '/park/the-park', permanent: true},
      {source: '/olive-grove-initiative', destination: '/support/olive-grove', permanent: true},
      {
        source: '/olive-wood-workshop',
        destination: '/support/initiatives/olive-wood-workshop',
        permanent: true,
      },
      {
        source: '/gardenparty2022-copy',
        destination: '/support/initiatives/garden-party-2022',
        permanent: true,
      },
      {source: '/timeline', destination: '/history', permanent: true},
      {source: '/grove-history', destination: '/history', permanent: true},
    ]
  },
  images: {
    remotePatterns: [
      {protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/i18fhbsv/**'},
    ],
  },
}

export default nextConfig
