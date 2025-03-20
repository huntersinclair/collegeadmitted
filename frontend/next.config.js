/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001']
    }
  },
  // Disable image optimization since it requires server-side support
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig; 