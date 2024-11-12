import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { env } from "@/utils/env";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

export const PrivyProvider = ({ children }: { children?: React.ReactNode }) => {
  const appId = env.NEXT_PUBLIC_PRIVY_APP_ID;

  const currentSupportedViemChains = getExistBlockchainList().map((bc) => bc.viemChain);

  if (!appId || currentSupportedViemChains.length === 0) return <>{children}</>;

  const defaultChainId = env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  const defaultChain =
    currentSupportedViemChains.find((ch) => ch.id === defaultChainId) ?? currentSupportedViemChains[0];

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
