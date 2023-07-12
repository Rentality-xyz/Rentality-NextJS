/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images:{
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'ivory-specific-mink-961.mypinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
}

module.exports = nextConfig
