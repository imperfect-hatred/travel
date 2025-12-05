// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['travel-project-practic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Для Vercel serverless
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Исправление предупреждения о workspace root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;