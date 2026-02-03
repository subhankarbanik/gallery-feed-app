import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "solsticedev.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "dev.letsmultiply.co",
        pathname: "/uploads/**",
      },
    ],
  },
};


export default nextConfig;
