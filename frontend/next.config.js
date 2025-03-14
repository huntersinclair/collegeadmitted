/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This ensures the app works properly when served from any path
  basePath: '',
  // Disable image optimization since it requires server-side support
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig; 