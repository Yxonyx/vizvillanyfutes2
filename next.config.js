/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Disable Next.js caching for API routes
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' },
        { key: 'Pragma', value: 'no-cache' },
        { key: 'Expires', value: '0' },
        { key: 'CDN-Cache-Control', value: 'no-store' },
        { key: 'Surrogate-Control', value: 'no-store' },
      ],
    },
  ],
  // Redirect old/dead pages that Google still has indexed
  redirects: async () => [
    { source: '/foglalas', destination: '/', permanent: true },
    { source: '/foglalas/:path*', destination: '/', permanent: true },
  ],
}

module.exports = nextConfig


