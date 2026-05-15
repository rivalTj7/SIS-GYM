import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prevent static prerendering of pages that use cookies/auth
  // API routes are always dynamic, client pages handle their own state
  experimental: {
    // Keep turbopack (already used in dev)
  },
};

export default nextConfig;
