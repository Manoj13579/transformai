import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allow image url from cloudinary in src of nextjs Image
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // add below two ignore build errors in production
  typescript: {
    ignoreBuildErrors: true,
  },
eslint: {
  ignoreDuringBuilds: true,
},
};

export default nextConfig;
