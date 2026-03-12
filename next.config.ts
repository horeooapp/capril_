import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async redirects() {
    return [
      {
        source: '/dashboard/admin/login',
        destination: '/admin/login',
        permanent: true,
      },
      {
        source: '/dashboard/admin',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
