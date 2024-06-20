import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { isEmpty } from "@/utils/string";
import { PrivyProvider as BasePrivyProvider } from "@privy-io/react-auth";

export const PrivyProvider = ({ children }: { children?: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  const currentSupportedViemChains = getExistBlockchainList().map((bc) => bc.viemChain);

  if (!appId || currentSupportedViemChains.length === 0) return <>{children}</>;

  const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
  const defaultChain = !isEmpty(defaultChainId)
    ? currentSupportedViemChains.find((ch) => ch.id === Number(defaultChainId))
    : currentSupportedViemChains[0];

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
