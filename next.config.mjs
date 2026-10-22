/** @type {import('next').NextConfig} */
const nextConfig = { output: "standalone", distDir: process.env.CHARTS_BUILD_DIR || ".next", experimental: { proxyClientMaxBodySize: '12mb' }, devIndicators: false };
export default nextConfig;
