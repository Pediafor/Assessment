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
      // Temporary: auth endpoints go directly to user-service until gateway rebuild with proper pathRewrite
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:4000/auth/:path*',
      },
      // Everything else goes to the gateway
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
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