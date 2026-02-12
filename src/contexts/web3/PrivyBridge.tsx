import React, { useEffect } from "react";
import { PrivyProvider, usePrivy, useWallets, useLogin, useLogout } from "@privy-io/react-auth";
import { setAuthSnapshot } from "../auth/authStore";
import { registerPrivyLogin, registerPrivyLogout } from "./privyController";
import { env } from "@/utils/env";
import { useSwitchChain } from "wagmi";

export default function PrivyBridge() {
  const { ready, authenticated, connectWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const { login } = useLogin();
  const { logout } = useLogout();

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    registerPrivyLogin(() => {
      if (authenticated && wallets.length === 0) {
        connectWallet();
        return;
      }
      login();
    });
  }, [authenticated, wallets.length, connectWallet, login]);

  useEffect(() => {
    registerPrivyLogout(logout);
  }, [logout]);

  useEffect(() => {
    const isAuth = ready && walletsReady && authenticated && wallets.length > 0;

    const isLoadingAuth = !ready || !walletsReady;

    setAuthSnapshot({
      isAuthenticated: isAuth,
      isLoadingAuth,
    });
  }, [ready, walletsReady, authenticated, wallets]);

  useEffect(() => {
    if (!authenticated || wallets.length === 0) return;

    const desiredChainId = Number(env.NEXT_PUBLIC_DEFAULT_CHAIN_ID);
    const currentChainId = Number(wallets[0]?.chainId);

    if (desiredChainId && currentChainId && currentChainId !== desiredChainId) {
      switchChain({ chainId: desiredChainId });
    }
  }, [authenticated, wallets, switchChain]);

  return null;
}
