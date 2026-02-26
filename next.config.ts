import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (target) {
      return [{ source: "/api/v1/:path*", destination: `${target}/api/v1/:path*` }];
    }
    return [];
  },
};

export default nextConfig;
