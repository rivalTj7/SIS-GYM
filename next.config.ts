import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['groq-sdk'],
  experimental: {},
};

export default nextConfig;
