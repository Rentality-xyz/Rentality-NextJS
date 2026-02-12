import { PrivyProvider } from "./privyContext";
import { EthereumProvider } from "./ethereumContext";
import { AuthProvider } from "../auth/authContext";
import React from "react";
import PrivyBridge from "@/contexts/web3/PrivyBridge";

export const Web3Setup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <PrivyBridge />
      <AuthProvider>
        <EthereumProvider>{children}</EthereumProvider>
      </AuthProvider>
    </PrivyProvider>
  );
};
