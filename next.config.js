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
  // Disable font optimization that causes lightningcss issues
  optimizeFonts: false,
  // Add webpack configuration to handle native dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
  // Disable experimental features that might conflict
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

module.exports = nextConfig
