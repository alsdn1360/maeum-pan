import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['@hugeicons/core-free-icons', '@components/ui'],
  },
};

export default nextConfig;
