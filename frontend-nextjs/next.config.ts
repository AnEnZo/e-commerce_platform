import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // domains: ['salework.net', 'ben.com.vn', 'media-cdn-v2.laodong.vn'],
    remotePatterns: [
      { protocol: 'https', hostname: 'salework.net', pathname: '/**' },
      { protocol: 'https', hostname: 'ben.com.vn', pathname: '/**' },
      { protocol: 'https', hostname: 'media-cdn-v2.laodong.vn', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1800],
  },
};

export default nextConfig;
