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

};

export default nextConfig;
