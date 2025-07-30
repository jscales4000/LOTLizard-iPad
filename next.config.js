/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Fix for Konva.js in Next.js
    if (isServer) {
      config.externals = [...config.externals, 'canvas']
    }
    
    // Ignore canvas module for client-side builds
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    }
    
    return config
  },
}

module.exports = nextConfig
