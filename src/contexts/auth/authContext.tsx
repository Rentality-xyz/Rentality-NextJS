import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLogin, useLogout, usePrivy, useWallets } from "@privy-io/react-auth";
import { bigIntReplacer } from "@/utils/json";
import { logger } from "@/utils/logger";

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
  const { connectWallet, ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const { login } = useLogin();

  const { logout } = useLogout({
    onSuccess: () => {
      logger.info("Privy callback authContext.tsx. useLogout.onSuccess");
    },
  });

  const customLogin = useCallback(() => {
    if (authenticated && wallets.length === 0) {
      connectWallet();
      return;
    }
    login();
  }, [authenticated, wallets, connectWallet, login]);

  useEffect(() => {
    const isAuth = ready && walletsReady && authenticated && wallets.length > 0;
    setIsAuthenticated(isAuth);
    setIsLoadingAuth(!ready || !walletsReady);
  }, [ready, walletsReady, authenticated, wallets]);

  // useEffect(() => {
  //   logger.info(`AuthProvider usePrivy.ready has changed to ${ready}`);
  // }, [ready]);
  // useEffect(() => {
  //   logger.info(`AuthProvider usePrivy.authenticated has changed to ${authenticated}`);
  // }, [authenticated]);
  // useEffect(() => {
  //   logger.info(`AuthProvider useWallets.ready has changed to ${walletsReady}`);
  // }, [walletsReady]);
  // useEffect(() => {
  //   logger.info(`AuthProvider wallets has changed to ${JSON.stringify(wallets, bigIntReplacer, 2)}`);
  // }, [wallets]);
  // useEffect(() => {
  //   logger.info(`AuthProvider isLoadingAuth has changed to ${isLoadingAuth}`);
  // }, [isLoadingAuth]);
  // useEffect(() => {
  //   logger.info(`AuthProvider isAuthenticated has changed to ${isAuthenticated}`);
  // }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      isLoadingAuth: isLoadingAuth,
      isAuthenticated: isAuthenticated,
      login: customLogin,
      logout: logout,
    }),
    [isLoadingAuth, isAuthenticated, customLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
