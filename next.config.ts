// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['travel-guide.com'],
  },
};

export default nextConfig;