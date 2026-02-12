import React, { useEffect } from "react";
import { PrivyProvider, usePrivy, useWallets, useLogin, useLogout } from "@privy-io/react-auth";
import { setAuthSnapshot } from "../auth/authStore";
import { registerPrivyLogin, registerPrivyLogout } from "./privyController";

export default function PrivyBridge() {
  const { ready, authenticated, connectWallet, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const { login } = useLogin();
  const { logout } = useLogout();

  useEffect(() => {
    console.log("ddi: ANDROID PRIVY DEBUG");
    console.log("ddi: ready:", ready);
    console.log("ddi: authenticated:", authenticated);
    console.log("ddi: user:", user);
  }, [ready, authenticated, user]);

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
