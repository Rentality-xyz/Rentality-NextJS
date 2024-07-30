import { CSSProperties, useEffect, useState } from "react";
import { EthereumGatewayWallet, GatewayProvider } from "@civic/ethereum-gateway-react";
import { DEFAULT_LOCAL_HOST_CHAIN_ID } from "@/utils/constants";
import { useEthereum } from "./ethereumContext";
import { base, baseSepolia } from "viem/chains";

const customWrapperStyle: CSSProperties = {
  background: "rgba(0,0,0,0.5)",
  position: "fixed",
  top: "0",
  left: "0",
  width: "100vw",
  height: "100vh",
  minHeight: "26",
  overflow: "hidden",
  /* flex position the iframe container */
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1400,
};

const customWrapperContentStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  maxWidth: "526px",
  width: "100%",
  minHeight: "26",
  maxHeight: "100",
  background: "#fff",
  borderRadius: "4px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
  overflow: "hidden",
};

const CustomWrapper: React.FC = ({ children = null }: { children?: React.ReactNode }) => {
  return (
    <div style={customWrapperStyle}>
      <div style={customWrapperContentStyle}>{children}</div>
    </div>
  );
};

export const CivicProvider = ({ children }: { children?: React.ReactNode }) => {
  const gatekeeperNetwork = process.env.NEXT_PUBLIC_CIVIC_GATEKEEPER_NETWORK || "";
  const [wallet, setWallet] = useState<EthereumGatewayWallet>();
  const [isLocalHost, setIsLocalHost] = useState<boolean>(true);
  const [isBaseNetwork, setIsBaseNetwork] = useState<boolean>(false);
  const ethereumInfo = useEthereum();

  useEffect(() => {
    const setData = async () => {
      if (!ethereumInfo) return;

      setIsLocalHost(ethereumInfo.chainId === DEFAULT_LOCAL_HOST_CHAIN_ID);
      setIsBaseNetwork(ethereumInfo.chainId === base.id || ethereumInfo.chainId === baseSepolia.id);
      setWallet({ address: ethereumInfo.walletAddress, signer: ethereumInfo.signer });
    };

    setData();
  }, [ethereumInfo]);

  if (isLocalHost || !isBaseNetwork) return <>{children}</>;

  return (
    <GatewayProvider wallet={wallet} gatekeeperNetwork={gatekeeperNetwork} wrapper={CustomWrapper}>
      {children}
    </GatewayProvider>
  );
};
