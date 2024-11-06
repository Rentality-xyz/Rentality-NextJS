import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLogin, useLogout, usePrivy, useWallets } from "@privy-io/react-auth";

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
