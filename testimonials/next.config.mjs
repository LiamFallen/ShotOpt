/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3', 'sharp'],
  output: 'standalone',
};

export default nextConfig;
