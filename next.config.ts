import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strengthswriter.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
