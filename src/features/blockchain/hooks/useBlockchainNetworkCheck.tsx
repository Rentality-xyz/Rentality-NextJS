import React, { useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { env } from "@/utils/env";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import SwitchChainDialog from "../components/SwitchChainDialog";
import { useAuth } from "@/contexts/auth/authContext";

const defaultChainId = env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

function useBlockchainNetworkCheck() {
  const { wallets } = useWallets();
  const { showCustomDialog } = useRntDialogs();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!wallets || !wallets[0]) {
      return;
    }
    const selectedChainId = Number.parseInt(wallets[0]?.chainId?.slice(7) ?? "0");
    const isSelectedSupportedChainId =
      selectedChainId > 0 && getExistBlockchainList().find((chain) => chain.chainId === selectedChainId) !== undefined;

    if (!isSelectedSupportedChainId && isAuthenticated) {
      showCustomDialog(
        <SwitchChainDialog
          handleSwitchChain={async (chainId) => {
            await wallets[0].switchChain(chainId);
          }}
          chainId={defaultChainId}
        />
      );
    }
  }, [wallets, showCustomDialog, isAuthenticated]);
}

export default useBlockchainNetworkCheck;
