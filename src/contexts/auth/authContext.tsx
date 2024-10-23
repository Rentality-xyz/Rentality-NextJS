import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLogin, useLogout, usePrivy, useWallets } from "@privy-io/react-auth";

interface useAuthInterface {
  isLoading: boolean;
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

  const { login } = useLogin({
    onComplete: (user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount) => {
      console.log(
        `Privy callback authContext.tsx. useLogin.onComplete -> data:${JSON.stringify({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, linkedAccount })}`
      );
    },
    onError: (error) => {
      console.log(`Privy callback authContext.tsx. useLogin.onError -> error:${JSON.stringify(error)}`);
    },
  });

  const { logout } = useLogout({
    onSuccess: () => {
      console.log("Privy callback authContext.tsx. useLogout.onSuccess");
    },
  });

  const { wallets, ready: walletsReady } = useWallets();

  useEffect(() => {
    console.log(`AuthProvider usePrivy.ready has changed to ${ready}`);
  }, [ready]);
  useEffect(() => {
    console.log(`AuthProvider usePrivy.authenticated has changed to ${authenticated}`);
  }, [authenticated]);
  useEffect(() => {
    console.log(`AuthProvider useWallets.ready has changed to ${walletsReady}`);
  }, [walletsReady]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    setIsLoading(false);
  }, [ready, walletsReady, authenticated, wallets]);

  const value = useMemo(
    () => ({
      isLoading: isLoading,
      isAuthenticated: isAuthenticated,
      login: custonLogin,
      logout: logout,
    }),
    [isLoading, isAuthenticated, custonLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
