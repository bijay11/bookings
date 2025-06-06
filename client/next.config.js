/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'http://localhost:8080/:path*', // Proxy to Go backend
      },
    ];
  },
};

module.exports = nextConfig;
