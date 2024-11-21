import { PrivyProvider } from "./privyContext";
import { EthereumProvider } from "./ethereumContext";
import { AuthProvider } from "../auth/authContext";

export const Web3Setup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <AuthProvider>
        <EthereumProvider>{children}</EthereumProvider>
      </AuthProvider>
    </PrivyProvider>
  );
};
