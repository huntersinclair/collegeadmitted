import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable image optimization since it requires server-side support
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
