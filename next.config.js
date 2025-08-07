/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mipripity-web-3fk2.onrender.com', 'picsum.photos'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mipripity-web-3fk2.onrender.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://mipripity-web-3fk2.onrender.com',
  },
}

module.exports = nextConfig
