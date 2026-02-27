import { BrowserProvider, Signer } from "ethers";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { logger } from "@/utils/logger";

const OPBNB_TESTNET = "opBNB Testnet";

export type EthereumInfo = {
  provider: BrowserProvider;
  signer: Signer;
  walletAddress: string;
  walletBalance: number;
  chainId: number;
  networkName: string;
  isWalletConnected: boolean;
  requestChainIdChange: (chainId: number) => Promise<boolean>;
};

const EthereumContext = createContext<EthereumInfo | null | undefined>(undefined);

export function useEthereum() {
  return useContext(EthereumContext);
}

export const EthereumProvider = ({ children }: { children?: React.ReactNode }) => {
  const { ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [ethereumInfo, setEthereumInfo] = useState<EthereumInfo | null | undefined>(undefined);
  const isInitiating = useRef(false);
  useEffect(() => {
    const requestChainIdChange = async (chainId: number) => {
      if (!wallets[0]) return false;

      const currentChainId = Number.parseInt(wallets[0]?.chainId?.slice(7) ?? "0");

      // 🔥 ГОЛОВНЕ — не викликати switch якщо мережа вже правильна
      if (currentChainId === chainId) {
        return true;
      }

      try {
        await wallets[0].switchChain(chainId);
        return true;
      } catch (error) {
        console.error("switchChain error:", error);
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

        const networkName =
          currentChainId === 5611
            ? OPBNB_TESTNET /// Ethers knows nothing about this network
            : (await etherv6Provider.getNetwork()).name;

        const currentWalletAddress = wallets[0].address;

        let currentWalletBalanceInEth = 0;
        try {
          const currentWalletBalanceInWeth = await etherv6Provider.getBalance(currentWalletAddress);
          currentWalletBalanceInEth = currentWalletBalanceInWeth
            ? parseFloat(formatEther(currentWalletBalanceInWeth))
            : 0;
        } catch (e) {
          logger.warn("getBalance failed (mobile/wc). continue with 0", e);
        }

        setEthereumInfo((prev) => {
          return {
            provider: etherv6Provider,
            signer: signer,
            walletAddress: currentWalletAddress,
            walletBalance: currentWalletBalanceInEth,
            chainId: currentChainId,
            networkName,
            isWalletConnected: ready && authenticated,
            requestChainIdChange: requestChainIdChange,
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
      logger.debug(`User has logged out. Reset ethereumInfo`);
      setEthereumInfo(null);
    }
  }, [authenticated, ethereumInfo, ready]);

  return <EthereumContext.Provider value={ethereumInfo}>{children}</EthereumContext.Provider>;
};
