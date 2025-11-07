const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(js|css)$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/.*\/_next\/static\/chunks\/.*\.js$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-static-chunks',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/.*\/_next\/static\/chunks\/app\/.*\.js$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-app-chunks',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})

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
      {
        protocol: 'https',
        hostname: 'chotdmrutqiznkiwaaiy.supabase.co', // Supabase Storage
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
  // PWA specific configurations
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  // Allow cross-origin requests for Paystack
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
}

module.exports = withPWA(nextConfig)
