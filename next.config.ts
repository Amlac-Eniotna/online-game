import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Server Components
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
