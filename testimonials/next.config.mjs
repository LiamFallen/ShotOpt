/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@libsql/client', 'libsql', 'sharp'],
  output: 'standalone',
};

export default nextConfig;
