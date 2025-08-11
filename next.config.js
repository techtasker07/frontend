/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'picsum.photos',
      'blob.v0.dev',
      '6koyplnghvmjbo57.public.blob.vercel-storage.com',
    ],
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
        hostname: '6koyplnghvmjbo57.public.blob.vercel-storage.com', // Vercel Blob Storage
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
