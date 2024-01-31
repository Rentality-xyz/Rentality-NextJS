import { useEffect, useState } from "react";
import { useRentality } from "./rentalityContext";
import { Wallet } from "ethers";
import { GatewayProvider } from "@civic/ethereum-gateway-react";
import { DEFAULT_LOCAL_HOST_CHAIN_ID } from "@/utils/constants";

export const CivicProvider = ({ children }: { children?: React.ReactNode }) => {
  const gatekeeperNetwork = process.env.NEXT_PUBLIC_CIVIV_GATEKEEPER_NETWORK || "";
  const [wallet, setWallet] = useState<Wallet>();
  const [isLocalHost, setIsLocalHost] = useState<boolean>(true);
  const rentalityInfo = useRentality();

  useEffect(() => {
    const setData = async () => {
      if (!rentalityInfo) return;

      const chainId = await rentalityInfo.signer.getChainId();
      setIsLocalHost(chainId === DEFAULT_LOCAL_HOST_CHAIN_ID);
      setWallet(rentalityInfo.signer as Wallet);
    };

    setData();
  }, [rentalityInfo]);

  if (isLocalHost) return <>{children}</>;

  return (
    <GatewayProvider wallet={wallet} gatekeeperNetwork={gatekeeperNetwork}>
      {children}
    </GatewayProvider>
  );
};
