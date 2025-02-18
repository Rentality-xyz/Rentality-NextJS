import { BrowserProvider, Signer } from "ethers";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { formatEther } from "viem";
import { AxiosResponse } from "axios";
import axios from "@/utils/cachedAxios";

export type EthereumInfo = {
  provider: BrowserProvider;
  signer: Signer;
  walletAddress: string;
  walletBalance: number;
  chainId: number;
  isWalletConnected: boolean;
  requestChainIdChange: (chainId: number) => Promise<boolean>;
  defaultRpcUrl: string;
};

const EthereumContext = createContext<EthereumInfo | null | undefined>(undefined);

export function useEthereum() {
  return useContext(EthereumContext);
}

export const EthereumProvider = ({ children }: { children?: React.ReactNode }) => {
  const { ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const router = useRouter();
  const [ethereumInfo, setEthereumInfo] = useState<EthereumInfo | null | undefined>(undefined);
  const [isReloadPageRequested, setIsReloadPageRequested] = useState<boolean>(false);
  const isInitiating = useRef(false);

  useEffect(() => {
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

    const getEtherProvider = async () => {
      if (!ready) return;
      if (!walletsReady) return;
      if (!authenticated) return;
      if (!wallets || !wallets[0]) return;
      if (isInitiating.current) return;

      isInitiating.current = true;

      try {
        const provider = await wallets[0].getEthereumProvider();
        const etherv6Provider = new BrowserProvider(provider);
        const signer = await etherv6Provider.getSigner();

        const currentChainId = Number(wallets[0].chainId.split(":")[1]);
        const currentWalletAddress = wallets[0].address;
        const currentWalletBalanceInWeth = await etherv6Provider.getBalance(currentWalletAddress);
        const currentWalletBalanceInEth = currentWalletBalanceInWeth
          ? parseFloat(formatEther(currentWalletBalanceInWeth))
          : 0;

        const rpcUrlResponse: AxiosResponse = await axios.get("/api/defaultRpcUrl", {
          params: {
            chainId: currentChainId,
          },
        });
        const { url } = rpcUrlResponse.data;

        if (!url) {
          console.error("Ethereum info error: Response does not contain the rpc URL");
          return null;
        }

        setEthereumInfo((prev) => {
          if (prev !== undefined && prev !== null) {
            setIsReloadPageRequested(prev.chainId !== currentChainId);
          }

          return {
            provider: etherv6Provider,
            signer: signer,
            walletAddress: currentWalletAddress,
            walletBalance: currentWalletBalanceInEth,
            chainId: currentChainId,
            isWalletConnected: ready && authenticated,
            requestChainIdChange: requestChainIdChange,
            defaultRpcUrl: url,
          };
        });
      } finally {
        isInitiating.current = false;
      }
    };

    getEtherProvider();
  }, [wallets, ready, authenticated, walletsReady]);

  useEffect(() => {
    if (!authenticated && ethereumInfo !== null && ready) {
      console.debug(`User has logged out. Reset ethereumInfo`);
      setEthereumInfo(null);
    }
  }, [authenticated, ethereumInfo, ready]);

  useEffect(() => {
    if (!isReloadPageRequested) return;

    setIsReloadPageRequested(false);
    router.refresh();
    console.log("reloading the page");
  }, [router, isReloadPageRequested]);

  return <EthereumContext.Provider value={ethereumInfo}>{children}</EthereumContext.Provider>;
};
