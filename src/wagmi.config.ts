import { http, createConfig } from "wagmi";
import { mainnet, sepolia, base, baseSepolia, opBNB, opBNBTestnet } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia, base, baseSepolia, opBNB, opBNBTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [opBNB.id]: http(),
    [opBNBTestnet.id]: http(),
  },
});
