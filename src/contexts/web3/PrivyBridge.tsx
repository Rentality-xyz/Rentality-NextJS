import React, { useEffect } from "react";
import { PrivyProvider, usePrivy, useWallets, useLogin, useLogout } from "@privy-io/react-auth";
import { setAuthSnapshot } from "../auth/authStore";
import { registerPrivyLogin, registerPrivyLogout } from "./privyController";

export default function PrivyBridge() {
  const { ready, authenticated, connectWallet } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const { login } = useLogin();
  const { logout } = useLogout();

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

  return null;
}
