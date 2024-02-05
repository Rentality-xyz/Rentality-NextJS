import { getExistBlockchainList } from "@/model/blockchain/BlockchainList";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

export const PrivyProvider = ({ children }: { children?: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  const currentSupportedChains = getExistBlockchainList().map((bc) => bc.viemChain);

  if (!appId || currentSupportedChains.length === 0) return <>{children}</>;

  const defaultChain = currentSupportedChains[0];

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
