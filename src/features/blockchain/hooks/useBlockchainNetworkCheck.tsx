import React, { useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { env } from "@/utils/env";
import { getExistBlockchainList } from "@/model/blockchain/blockchainList";
import { useRntDialogs } from "@/contexts/rntDialogsContext";
import SwitchChainDialog from "../components/SwitchChainDialog";

const defaultChainId = env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

function useBlockchainNetworkCheck() {
  const { wallets } = useWallets();
  const { showCustomDialog } = useRntDialogs();

  useEffect(() => {
    const selectedChainId = Number.parseInt(wallets[0]?.chainId?.slice(7) ?? "0");
    const isSelectedSupportedChainId =
      selectedChainId > 0 && getExistBlockchainList().find((chain) => chain.chainId === selectedChainId) !== undefined;

    if (!isSelectedSupportedChainId) {
      showCustomDialog(
        <SwitchChainDialog
          handleSwitchChain={async (chainId) => {
            await wallets[0].switchChain(chainId);
          }}
          chainId={defaultChainId}
        />
      );
    }
  }, [wallets, showCustomDialog]);
}

export default useBlockchainNetworkCheck;
