import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

interface useAuthInterface {
  isLoadingAuth: boolean;
  isAuthenticated: boolean;

  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<useAuthInterface | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const { connectWallet, ready, authenticated, login, logout } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const custonLogin = useCallback(() => {
    if (authenticated && wallets.length === 0) {
      connectWallet();
      return;
    }
    login();
  }, [authenticated, wallets, connectWallet, login]);

  useEffect(() => {
    if (!ready) return;
    if (!walletsReady) return;

    setIsAuthenticated(authenticated && wallets.length > 0);
    setIsLoadingAuth(false);
  }, [ready, walletsReady, authenticated, wallets]);

  const value = useMemo(
    () => ({
      isLoadingAuth: isLoadingAuth,
      isAuthenticated: isAuthenticated,
      login: custonLogin,
      logout: logout,
    }),
    [isLoadingAuth, isAuthenticated, custonLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
