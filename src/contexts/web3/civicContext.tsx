import { useEffect, useState } from "react";
import { Wallet } from "ethers";
import { GatewayProvider } from "@civic/ethereum-gateway-react";
import { DEFAULT_LOCAL_HOST_CHAIN_ID } from "@/utils/constants";
import { useEthereum } from "./ethereumContext";

export const CivicProvider = ({ children }: { children?: React.ReactNode }) => {
  const gatekeeperNetwork = process.env.NEXT_PUBLIC_CIVIV_GATEKEEPER_NETWORK || "";
  const [wallet, setWallet] = useState<Wallet>();
  const [isLocalHost, setIsLocalHost] = useState<boolean>(true);
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const setData = async () => {
      if (!ethereumInfo) return;

      const chainId = await ethereumInfo.signer.getChainId();
      setIsLocalHost(chainId === DEFAULT_LOCAL_HOST_CHAIN_ID);
      setWallet(ethereumInfo.signer as Wallet);
    };

    setData();
  }, [ethereumInfo]);

  if (isLocalHost) return <>{children}</>;

  return (
    <GatewayProvider wallet={wallet} gatekeeperNetwork={gatekeeperNetwork}>
      {children}
    </GatewayProvider>
  );
};
