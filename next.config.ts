// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['travel-project-practic.com'],
  },
};

export default nextConfig;