import type { NextConfig } from "next";

/**
 * Built as static files for GitHub Pages, served at jamieryu.com/myselfcare.
 * Auth and data loading run in the browser (protected by Supabase RLS).
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/myselfcare",
  trailingSlash: true,
};

export default nextConfig;
