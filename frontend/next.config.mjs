import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep React strict mode enabled
  reactStrictMode: true,
  typedRoutes: true,
  // Silence workspace root warning when multiple lockfiles exist (monorepo-style workspace)
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      // All API requests go to the gateway on the host machine
      // Note: inside the container, use host.docker.internal to reach host ports
      {
        source: '/api/:path*',
        destination: 'http://host.docker.internal:3000/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;