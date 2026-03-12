import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // @ts-ignore - Turbopack root config exists in this version but might not be in the types yet
  turbopack: {
    root: '.',
  }
};

export default nextConfig;
