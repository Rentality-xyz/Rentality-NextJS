import { PrivyProvider } from "./privyContext";
import { EthereumProvider } from "./ethereumContext";
import { CivicProvider } from "./civicContext";
import { AuthProvider } from "../auth/authContext";

export const Web3Setup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <AuthProvider>
        <EthereumProvider>
          <CivicProvider>{children}</CivicProvider>
        </EthereumProvider>
      </AuthProvider>
    </PrivyProvider>
  );
};
