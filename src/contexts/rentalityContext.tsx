import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { Contract, Signer, ethers } from "ethers";
import { rentalityJSON, rentalityCurrencyConverterJSON, rentalityChatHelperJSON } from "../abis";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAppContext } from "@/contexts/useAppContext";

export type RentalityContractInfo = {
  rentalityContract: IRentalityContract;
  walletAddress: string;
  isWalletConnected: boolean;
  provider: ethers.providers.Web3Provider;
  signer: Signer;
  connectWallet: () => Promise<void>;
};

const RentalityContext = createContext<RentalityContractInfo | null>(null);

export function useRentality() {
  return useContext(RentalityContext);
}

export const RentalityProvider = ({ children }: { children?: React.ReactNode }) => {
  const { selectedBlockchain } = useAppContext();
  const requiredChainId =
    process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN?.toLowerCase?.() === "true"
      ? "0x539" /// 1337
      : "0xaa36a7"; // 11155111
  const [rentalityContractInfo, setRentalityContractInfo] = useState<RentalityContractInfo | null>(null);
  const router = useRouter();

  const connectToMetaMask = useCallback(async () => {
    if (window.ethereum == null) {
      console.error("Ethereum wallet is not found");
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== requiredChainId) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: requiredChainId }],
        });
      }

      const requestAccounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (requestAccounts.length === 0) {
        return;
      }

      const isWalletConnected = true;
      const walletAddress = requestAccounts[0];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const rentalityContract = new Contract(
        rentalityJSON.address,
        rentalityJSON.abi,
        signer
      ) as unknown as IRentalityContract;

      setRentalityContractInfo({
        rentalityContract: rentalityContract,
        walletAddress: walletAddress,
        isWalletConnected: isWalletConnected,
        provider: provider,
        signer: signer,
        connectWallet: connectToMetaMask,
      });
    } catch (e) {
      console.error("connectToMetaMask error:" + e);
    }
  }, [requiredChainId]);

  const handleAccountsChanged = useCallback(() => {
    router.reload();
    console.log("handleAccountsChanged: reloading...");
  }, [router]);

  useEffect(() => {
    if (window.ethereum == null) {
      console.error("Ethereum wallet is not found");
      return;
    }

    connectToMetaMask().catch(console.error);

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [connectToMetaMask, handleAccountsChanged]);

  useEffect(() => {
    if (selectedBlockchain) {
      console.log("selectedBlockchain=" + selectedBlockchain);
    }
  }, [selectedBlockchain]);

  return <RentalityContext.Provider value={rentalityContractInfo}>{children}</RentalityContext.Provider>;
};
