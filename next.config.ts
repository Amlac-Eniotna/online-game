import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React Server Components
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Set the correct Turbopack root to avoid using parent directory config
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
