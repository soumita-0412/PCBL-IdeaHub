import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ── Strict Mode ─────────────────────────────────────────── */
  reactStrictMode: true,

  /* ── Output ──────────────────────────────────────────────── */
  output: "standalone",

  /* ── Image Optimization ──────────────────────────────────── */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.microsoft.com",
      },
      {
        protocol: "https",
        hostname: "graph.microsoft.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  /* ── Environment Variables exposed to the browser ─────────── */
  env: {
    APP_VERSION: process.env.npm_package_version ?? "0.0.0",
  },

  /* ── Headers ─────────────────────────────────────────────── */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  /* ── Webpack (bundle analyser hook) ──────────────────────── */
  ...(process.env.ANALYZE === "true" && {
    webpack(config: import("webpack").Configuration) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require("@next/bundle-analyzer")();
      config.plugins?.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),
};

export default nextConfig;
