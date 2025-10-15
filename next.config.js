/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Preserve existing optimizations
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig