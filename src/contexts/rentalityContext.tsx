import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { Signer, ethers } from "ethers";
import { getEtherContract } from "../abis";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getExistBlockchainList } from "@/model/blockchain/BlockchainList";

export type RentalityContractInfo = {
  rentalityContract: IRentalityContract;
  walletAddress: string;
  isWalletConnected: boolean;
  provider: ethers.providers.Web3Provider;
  signer: Signer;
  connectWallet: () => Promise<void>;
  requestChainIdChange: (chainIdHex: string) => Promise<boolean>;
};

const RentalityContext = createContext<RentalityContractInfo | null>(null);

export function useRentality() {
  return useContext(RentalityContext);
}

export const RentalityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [rentalityContractInfo, setRentalityContractInfo] = useState<RentalityContractInfo | null>(null);
  const router = useRouter();

  const requestChainIdChange = async (chainIdHex: string) => {
    console.log("requestChainIdChange:" + chainIdHex);
    try {
      const selectedBlockchain = getExistBlockchainList().find((i) => i.chainIdHexString == chainIdHex);

      if (!selectedBlockchain) {
        console.error("requestChainIdChange error", `chain id ${chainIdHex} is not supported`);
        return false;
      }

      const metamaskChainId = await window.ethereum.request({ method: "eth_chainId" }); // return chain ID in HEX format

      if (metamaskChainId !== chainIdHex) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      }
      return true;
    } catch (e) {
      console.error("requestChainIdChange error:" + e);
      return false;
    }
  };

  const isInitiating = useRef(false);

  const connectToMetaMask = useCallback(async () => {
    console.log("connectToMetaMask");
    if (window.ethereum == null) {
      console.error("Ethereum wallet is not found");
      return;
    }
    if (isInitiating.current) {
      return;
    }

    try {
      isInitiating.current = true;
      const metamaskChainId = await window.ethereum.request({ method: "eth_chainId" }); // return chain ID in HEX format
      const selectedBlockchain = getExistBlockchainList().find((i) => i.chainIdHexString == metamaskChainId);

      if (!selectedBlockchain) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: getExistBlockchainList()[0].chainIdHexString }],
        });
        return;
      }

      const requestAccounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      if (requestAccounts.length === 0) {
        return;
      }

      const isWalletConnected = true;
      const walletAddress = requestAccounts[0];

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      const rentalityContract = (await getEtherContract("gateway")) as unknown as IRentalityContract;

      if (rentalityContract === null) {
        return;
      }

      setRentalityContractInfo({
        rentalityContract: rentalityContract,
        walletAddress: walletAddress,
        isWalletConnected: isWalletConnected,
        provider: provider,
        signer: signer,
        connectWallet: connectToMetaMask,
        requestChainIdChange: requestChainIdChange,
      });
    } catch (e) {
      console.error("connectToMetaMask error:" + e);
    } finally {
      isInitiating.current = false;
    }
  }, []);

  const handleAccountsChanged = useCallback(() => {
    router.reload();
    console.log("handleAccountsChanged call");
  }, [router]);

  useEffect(() => {
    const checkMetamaskConnection = async () => {
      if (isInitiating.current) {
        return;
      }
      try {
        isInitiating.current = true;
        const metamaskChainId = await window.ethereum.request({ method: "eth_chainId" }); // return chain ID in HEX format
        const selectedBlockchain = getExistBlockchainList().find((i) => i.chainIdHexString == metamaskChainId);

        if (!selectedBlockchain) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: getExistBlockchainList()[0].chainIdHexString }],
          });
          return;
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

        const rentalityContract = (await getEtherContract("gateway")) as unknown as IRentalityContract;

        if (rentalityContract === null) {
          return;
        }

        if (
          rentalityContractInfo !== null &&
          rentalityContractInfo.walletAddress === walletAddress &&
          (await signer.getChainId()) === Number(selectedBlockchain.chainId)
        ) {
          return;
        }

        setRentalityContractInfo({
          rentalityContract: rentalityContract,
          walletAddress: walletAddress,
          isWalletConnected: isWalletConnected,
          provider: provider,
          signer: signer,
          connectWallet: connectToMetaMask,
          requestChainIdChange: requestChainIdChange,
        });
      } catch (e) {
        console.error("checkMetamaskConnection error:" + e);
      } finally {
        isInitiating.current = false;
      }
    };

    if (window.ethereum == null) {
      console.error("Ethereum wallet is not found");
      return;
    }

    checkMetamaskConnection();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleAccountsChanged);
    };
  }, [connectToMetaMask, handleAccountsChanged, rentalityContractInfo]);

  return <RentalityContext.Provider value={rentalityContractInfo}>{children}</RentalityContext.Provider>;
};
