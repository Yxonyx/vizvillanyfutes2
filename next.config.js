/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig


