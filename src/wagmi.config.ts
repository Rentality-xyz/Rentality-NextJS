import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { mainnet, sepolia, base, baseSepolia, opBNB, opBNBTestnet } from "wagmi/chains";

const localhostHardhat = defineChain({
  id: 1337,
  name: "Localhost Hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [localhostHardhat, mainnet, sepolia, base, baseSepolia, opBNB, opBNBTestnet],
  transports: {
    [localhostHardhat.id]: http(localhostHardhat.rpcUrls.default.http[0]),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [opBNB.id]: http(),
    [opBNBTestnet.id]: http(),
  },
});
