/** @type {import('next').NextConfig} */

console.debug(`next.config.js -> reactStrictMode: ${process.env.NEXT_USE_STRICT_MODE !== "false"}`);

const nextConfig = {
  reactStrictMode: process.env.NEXT_USE_STRICT_MODE !== "false",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        port: "",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ivory-specific-mink-961.mypinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};

module.exports = nextConfig;
