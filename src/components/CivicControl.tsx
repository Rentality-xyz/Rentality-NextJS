import { useEffect, useState } from "react";
import { useRentality } from "../contexts/rentalityContext";
import { Wallet } from "ethers";
import { GatewayProvider } from "@civic/ethereum-gateway-react";

export const CivicControl = ({ children }: { children?: React.ReactNode }) => {
  const gatekeeperNetwork = "uniqobk8oGh4XBLMqM68K8M2zNu3CdYX7q5go7whQiv";
  const [wallet, setWallet] = useState<Wallet>();
  const rentalityInfo = useRentality();

  useEffect(() => {
    if (!rentalityInfo) return;

    setWallet(rentalityInfo.signer as Wallet);
  }, [rentalityInfo]);

  return (
    <GatewayProvider wallet={wallet} gatekeeperNetwork={gatekeeperNetwork}>
      {children}
    </GatewayProvider>
  );
};
