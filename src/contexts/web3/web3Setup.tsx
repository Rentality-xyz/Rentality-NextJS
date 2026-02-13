import { PrivyProvider } from "./privyContext";
import { EthereumProvider } from "./ethereumContext";
import { AuthProvider } from "../auth/authContext";
import React from "react";
import PrivyBridge from "@/contexts/web3/PrivyBridge";
import { wagmiConfig } from "@/wagmi.config";
import { WagmiProvider } from "wagmi";

export const Web3Setup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <WagmiProvider config={wagmiConfig}>
        <PrivyBridge />
        <AuthProvider>
          <EthereumProvider>{children}</EthereumProvider>
        </AuthProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
};
