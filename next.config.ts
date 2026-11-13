import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const rawTarget =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://doctor-tracker-be-z4sm.onrender.com";

    // Strip trailing slashes and /api if included
    const backendTarget = rawTarget.replace(/\/api\/?$/, "").replace(/\/+$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendTarget}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
