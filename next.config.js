/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverMinification: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true
      }
    }
    return config
  }
}

module.exports = nextConfig 