import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { Contract, Signer, ethers } from "ethers";
import { rentalityContracts } from "../abis";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { blockchainList } from "@/model/blockchain/BlockchainList";

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
      const selectedBlockchain = blockchainList.find((i) => i.chainIdHexString == chainIdHex);

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
      const selectedBlockchain = blockchainList.find((i) => i.chainIdHexString == metamaskChainId);

      if (!selectedBlockchain) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: blockchainList[0].chainIdHexString }],
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
      const selectedChainId =
        selectedBlockchain.chainId === 80001
          ? "80001"
          : selectedBlockchain.chainId === 84532
          ? "84532"
          : selectedBlockchain.chainId === 11155111
          ? "11155111"
          : "11155111"; //"1337";
      const rentalityContract = new Contract(
        rentalityContracts[selectedChainId].gateway.address,
        rentalityContracts[selectedChainId].gateway.abi,
        signer
      ) as unknown as IRentalityContract;

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
        const selectedBlockchain = blockchainList.find((i) => i.chainIdHexString == metamaskChainId);

        if (!selectedBlockchain) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: blockchainList[0].chainIdHexString }],
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
        const selectedChainId =
          selectedBlockchain.chainId === 80001
            ? "80001"
            : selectedBlockchain.chainId === 84532
            ? "84532"
            : selectedBlockchain.chainId === 11155111
            ? "11155111"
            : "11155111"; //"1337";

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const rentalityContract = new Contract(
          rentalityContracts[selectedChainId].gateway.address,
          rentalityContracts[selectedChainId].gateway.abi,
          signer
        ) as unknown as IRentalityContract;

        console.log("rentalityContractInfo.walletAddress:", rentalityContractInfo?.walletAddress);
        console.log("walletAddress:", walletAddress);
        console.log("await signer.getChainId():", await signer.getChainId());
        console.log("Number(selectedChainId):", Number(selectedChainId));

        if (
          rentalityContractInfo !== null &&
          rentalityContractInfo.walletAddress === walletAddress &&
          (await signer.getChainId()) === Number(selectedChainId)
        ) {
          console.log("return");
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

  // useEffect(() => {
  //   const checkBlockChainId = async () => {
  //     if (window.ethereum == null) {
  //       console.error("Ethereum wallet is not found");
  //       return;
  //     }

  //     console.log("selectedBlockchain=" + selectedBlockchain);
  //     const selectedBlockchainHex =
  //       selectedBlockchain == BlockchainsEnum.ETHEREUM
  //         ? "0xaa36a7"
  //         : selectedBlockchain == BlockchainsEnum.POLYGON
  //         ? "0x" + decimalToHex("80001") //0x13881
  //         : selectedBlockchain == BlockchainsEnum.BASE
  //         ? "0x14a33"
  //         : "";

  //     if (!selectedBlockchainHex) {
  //       console.error("selectedBlockchainHex is not a number");
  //       return;
  //     }
  //     console.log("selectedBlockchainHex=" + selectedBlockchainHex);

  //     try {
  //       const chainId = await window.ethereum.request({ method: "eth_chainId" });

  //       if (chainId !== selectedBlockchainHex) {
  //         setRequiredChainId(selectedBlockchainHex);
  //         await window.ethereum.request({
  //           method: "wallet_switchEthereumChain",
  //           params: [{ chainId: selectedBlockchainHex }],
  //         });
  //       }
  //     } catch (e) {
  //       console.error("checkBlockChainId error:" + e);
  //     }
  //   };

  //   checkBlockChainId();
  // }, [selectedBlockchain]);

  return <RentalityContext.Provider value={rentalityContractInfo}>{children}</RentalityContext.Provider>;
};
