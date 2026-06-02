import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (a stray lockfile elsewhere was being inferred as root).
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
