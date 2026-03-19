import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
};

export default withSerwist(nextConfig);
