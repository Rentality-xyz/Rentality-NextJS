import { useEffect, useState } from "react";
import { EthereumGatewayWallet, GatewayProvider } from "@civic/ethereum-gateway-react";
import { DEFAULT_LOCAL_HOST_CHAIN_ID } from "@/utils/constants";
import { useEthereum } from "./ethereumContext";

export const CivicProvider = ({ children }: { children?: React.ReactNode }) => {
  const gatekeeperNetwork = process.env.NEXT_PUBLIC_CIVIV_GATEKEEPER_NETWORK || "";
  const [wallet, setWallet] = useState<EthereumGatewayWallet>();
  const [isLocalHost, setIsLocalHost] = useState<boolean>(true);
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const setData = async () => {
      if (!ethereumInfo) return;

      setIsLocalHost(ethereumInfo.chainId === DEFAULT_LOCAL_HOST_CHAIN_ID);
      setWallet({ address: ethereumInfo.walletAddress, signer: ethereumInfo.signer });
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
