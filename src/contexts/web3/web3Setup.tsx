import { PrivyProvider } from "./privyContext";
import { EthereumProvider } from "./ethereumContext";
import { CivicProvider } from "./civicContext";

export const Web3Setup = ({ children }: { children?: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <EthereumProvider>
        <CivicProvider>{children}</CivicProvider>
      </EthereumProvider>
    </PrivyProvider>
  );
};
