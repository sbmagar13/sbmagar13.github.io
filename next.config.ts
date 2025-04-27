import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports
  basePath: '',
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server-side features that aren't compatible with static export
  trailingSlash: true,
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
