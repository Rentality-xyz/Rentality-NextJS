import { fileURLToPath } from "node:url";
import createJiti from "jiti";
import fs from "fs";

import RentalityInvestServiceJSON_ADDRESSES from "./src/abis/RentalityInvestment.v0_2_0.addresses.json" with { type: "json" };
console.debug(
  `RentalityInvestServiceJSON_ADDRESSES.addresses: ${JSON.stringify(RentalityInvestServiceJSON_ADDRESSES.addresses)}`
);

if (fs.existsSync("./src/")) {
  const jiti = createJiti(fileURLToPath(import.meta.url));
  console.info(`Checking environment variables...`);
  // Import env here to validate during build. Using jiti we can import .ts files :)
  jiti("./src/utils/env");
}

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
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};

export default nextConfig;
