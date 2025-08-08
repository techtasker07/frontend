/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mipripity-web-3fk2.onrender.com', 'picsum.photos', 'blob.v0.dev'],
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
      {
        protocol: 'https',
        hostname: 'blob.v0.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
