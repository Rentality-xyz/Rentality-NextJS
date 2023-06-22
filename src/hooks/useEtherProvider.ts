import { Contract, BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { rentalityJSON } from "../abis";
import { useRouter } from "next/router";

const useEtherProvider = () => {
  const requiredChainId =
    process.env.NEXT_PUBLIC_USE_LOCALHOST_BLOCKCHAIN?.toLowerCase?.() === "true"
      ? "0x539" /// 1337
      : "0xaa36a7"; // 11155111
  const router = useRouter();
  const [userWeb3Address, setUserWeb3Address] = useState("Not connected");
  const [userConnected, setUserConnected] = useState(false);

  // const getRentalityContract = async () => {
  //   try {
  //     const { ethereum } = window;

  //     if (!ethereum) {
  //       console.error("Ethereum wallet is not found");
  //     }

  //     const provider = new BrowserProvider(ethereum);
  //     const signer = await provider.getSigner();
  //     return new Contract(rentalityJSON.address, rentalityJSON.abi, signer);
  //   } catch (e) {
  //     console.error("getRentalityContract error:" + e);
  //   }
  // };

  // const getAddress = async () => {
  //   try {
  //     const { ethereum } = window;

  //     if (!ethereum) {
  //       console.error("Ethereum wallet is not found");
  //     }

  //     const provider = new BrowserProvider(ethereum);
  //     const signer = await provider.getSigner();
  //     const address = await signer.getAddress();
  //     setUserWeb3Address(address);
  //   } catch (e) {
  //     console.error("getAddress error:" + e);
  //   }
  // };

  const formatAddress = (address: string) => {
    if (address == null || address.length < 16) return address;
    return address.substr(0, 6) + ".." + address.substr(address.length - 8);
  };

  const handleAccountsChanged = useCallback(() => {
    router.reload();
  }, []);

  // useEffect(() => {
  //   let isConnected = window.ethereum.isConnected();
  //   if (isConnected) {
  //     console.log("ether user is connected");
  //     getAddress();
  //     setUserConnected(isConnected);
  //   }

  //   window.ethereum.on("accountsChanged", handleAccountsChanged);

  //   return () => {
  //     window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  //   };
  // }, []);

  const connectToMetaMask = useCallback(async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId !== requiredChainId) {
      //console.log(`wallet_switchEthereumChain call. Current:${chainId}, required:${requiredChainId}`);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: requiredChainId }],
      });
    }
    const requestAccounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (requestAccounts.length > 0) {
      setUserConnected(true);
      setUserWeb3Address(requestAccounts[0]);
    } else {
      setUserConnected(false);
      setUserWeb3Address("0x");
    }
  }, []);

  useEffect(() => {
    if (window.ethereum == null) {
      console.error("window.ethereum not found.");
      return;
    }

    connectToMetaMask().catch(console.error);

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [connectToMetaMask, handleAccountsChanged]);

  return [
    userConnected,
    userWeb3Address,
    formatAddress,
    connectToMetaMask,
  ] as const;
};

export default useEtherProvider;
