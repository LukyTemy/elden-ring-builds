import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eldenring.fanapis.com",
      },
    ],
  },
};

export default nextConfig;