import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Optimize for production
  reactStrictMode: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
    ],
  },

  // Environment variables available to the browser
  env: {
    DOMAIN_NAME: process.env.DOMAIN_NAME || 'http://localhost:3000',
  },
};

export default nextConfig;
