import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js file tracing scoped to this app even when parent folders contain lockfiles.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
