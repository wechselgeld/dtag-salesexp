import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // @ts-ignore - Turbopack root config exists in this version but might not be in the types yet
  turbopack: {
    root: '.',
  }
};

export default nextConfig;
