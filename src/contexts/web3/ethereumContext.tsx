import { Signer, ethers } from "ethers";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getExistBlockchainList } from "@/model/blockchain/BlockchainList";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export type EthereumInfo = {
  provider: ethers.providers.Web3Provider;
  signer: Signer;
  walletAddress: string;
  chainId: number;
  isWalletConnected: boolean;
  connectWallet: () => Promise<void>;
  requestChainIdChange: (chainId: number) => Promise<boolean>;
};

const EthereumContext = createContext<EthereumInfo | null>(null);

export function useEthereum() {
  return useContext(EthereumContext);
}

export const EthereumProvider = ({ children }: { children?: React.ReactNode }) => {
  const [ethereumInfo, setEthereumInfo] = useState<EthereumInfo | null>(null);
  const [isReloadPageNeeded, setIsReloadPageNeeded] = useState<boolean>(false);
  const router = useRouter();
  const { connectWallet, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const handleAccountsChanged = useCallback(() => {
    router.reload();
    console.log("handleAccountsChanged call");
  }, [router]);

  const isInitiating = useRef(false);

  useEffect(() => {
    if (!wallets || !wallets[0]) return;
    if (isInitiating.current) return;

    console.log(`EthereumContext useEffect call`);

    const requestChainIdChange = async (chainId: number) => {
      console.log("requestChainIdChange: " + chainId);

      if (!wallets[0]) {
        console.error("requestChainIdChange error: wallets list is empty");
        return false;
      }

      try {
        const selectedBlockchain = getExistBlockchainList().find((i) => i.chainId == chainId);

        if (!selectedBlockchain) {
          console.error("requestChainIdChange error", `chain id ${chainId} is not supported`);
          return false;
        }

        const currentChainId = Number(wallets[0].chainId.split(":")[1]);
        console.log(`currentChainId: ${currentChainId}`);

        if (currentChainId !== chainId) {
          await wallets[0].switchChain(chainId);
        }
        return true;
      } catch (e) {
        console.error("requestChainIdChange error:" + e);
        return false;
      }
    };

    isInitiating.current = true;

    wallets[0]
      .getEthersProvider()
      .then((provider) =>
        setEthereumInfo((prev) => {
          const currentChainId = Number(wallets[0].chainId.split(":")[1]);
          const currentWalletAddress = wallets[0].address;

          if (prev !== null) {
            setIsReloadPageNeeded(prev.chainId !== currentChainId || prev.walletAddress !== currentWalletAddress);
          }

          return {
            provider: provider,
            signer: provider.getSigner(),
            walletAddress: currentWalletAddress,
            chainId: currentChainId,
            isWalletConnected: true,
            connectWallet: async () => {
              connectWallet();
            },
            requestChainIdChange: requestChainIdChange,
          };
        })
      )
      .finally(() => {
        isInitiating.current = false;
      });
  }, [wallets, connectWallet]);

  useEffect(() => {
    if (!isReloadPageNeeded) return;

    setIsReloadPageNeeded(false);
    router.reload();
    console.log("reloading the page");
  }, [router, isReloadPageNeeded]);

  return <EthereumContext.Provider value={ethereumInfo}>{children}</EthereumContext.Provider>;
};
