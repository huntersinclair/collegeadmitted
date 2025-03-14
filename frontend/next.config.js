/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Disable image optimization since it requires server-side support
  images: {
    unoptimized: true,
  }
};

module.exports = nextConfig; 