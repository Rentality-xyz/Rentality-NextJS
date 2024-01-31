import { blockchainList } from "@/model/blockchain/BlockchainList";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { sepolia, polygonMumbai, baseSepolia, optimismSepolia } from "viem/chains";

const localhostGanache = defineChain({
  id: 1_337,
  name: "Localhost Ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:7545"] },
  },
});

export const PrivyProvider = ({ children }: { children?: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  if (!appId) return <>{children}</>;

  const allPrivySupportedChains = [sepolia, polygonMumbai, baseSepolia, optimismSepolia, localhostGanache];
  const currentSupportedChains = allPrivySupportedChains.filter((psc) =>
    blockchainList.find((bc) => bc.chainId === psc.id)
  );
  const defaultChain = currentSupportedChains[0];
  console.log("currentSupportedChains", currentSupportedChains);
  console.log("defaultChain", defaultChain);

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "#1E1E30",
        },
        defaultChain: defaultChain,
        supportedChains: currentSupportedChains,
      }}
    >
      {children}
    </BasePrivyProvider>
  );
};
