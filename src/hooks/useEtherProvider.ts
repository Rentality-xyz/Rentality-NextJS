import { Contract, BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { rentalityJSON } from "../abis";
import { useRouter } from "next/router";

const useEtherProvider = () => {
  const router = useRouter();
  const [userWeb3Address, setUserWeb3Address] = useState("Not connected");
  const [userConnected, setUserConnected] = useState(false);

  const getRentalityContract = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      return new Contract(rentalityJSON.address, rentalityJSON.abi, signer);
    } catch (e) {
      console.error("getRentalityContract error:" + e);
    }
  };

  const connectWebsite = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x5") {
      //alert('Incorrect network! Switch your metamask network to Rinkeby');
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }],
      });
    }
    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(() => {
        getAddress();
        window.location.replace(location.pathname);
      });
  };

  const getAddress = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Ethereum wallet is not found");
      }

      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserWeb3Address(address);
    } catch (e) {
      console.error("getAddress error:" + e);
    }
  };

  const formatAddress = (address: string) => {
    if (address == null || address.length < 16) return address;
    return address.substr(0, 6) + ".." + address.substr(address.length - 8);
  };

  const withdrawTips = async () => {
    try {
      const rentalityContract = await getRentalityContract();

      if (!rentalityContract) {
        console.error("saveCar error: contract is null");
        return false;
      }

      let transaction = await rentalityContract.withdrawTips();
      await transaction.wait();

      alert("You successfully withdraw tips!");
    } catch (e) {
      alert("withdrawTips error:" + e);
    }
  };

  const handleAccountsChanged = () => {
    router.reload();
  };

  useEffect(() => {
    let isConnected = window.ethereum.isConnected();
    if (isConnected) {
      console.log("ether user is connected");
      getAddress();
      setUserConnected(isConnected);
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return [userConnected, userWeb3Address, withdrawTips, formatAddress] as const;
};

export default useEtherProvider;
