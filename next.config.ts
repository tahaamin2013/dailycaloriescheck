/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', '@prisma/client'],
  },
  // Skip build-time route generation for API routes
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  reactCompiler: true,
    typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig