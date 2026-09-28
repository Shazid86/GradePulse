import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Legacy URL redirects (Phase 6.5): old auth paths → new /auth/* paths.
  async redirects() {
    return [
      { source: "/login", destination: "/auth/login", permanent: true },
      { source: "/signup", destination: "/auth/signup", permanent: true },
    ];
  },
};

export default nextConfig;
