import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Fix for Phaser
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  // Enable React Server Components
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
