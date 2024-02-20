import { getExistBlockchainList } from "@/model/blockchain/BlockchainList";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

export const PrivyProvider = ({ children }: { children?: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  const currentSupportedViemChains = getExistBlockchainList().map((bc) => bc.viemChain);

  if (!appId || currentSupportedViemChains.length === 0) return <>{children}</>;

  const defaultChain = currentSupportedViemChains[0];

  return (
    <BasePrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "#1E1E30",
        },
        defaultChain: defaultChain,
        supportedChains: currentSupportedViemChains,
      }}
    >
      {children}
    </BasePrivyProvider>
  );
};
