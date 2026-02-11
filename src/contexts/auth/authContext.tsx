import React, { createContext, useContext, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { getAuthSnapshot, subscribeAuth } from "./authStore";
import { openPrivyLogin, openPrivyLogout } from "../web3/privyController";

type AuthApi = {
  isLoadingAuth: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside CoreAuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);

  const value = useMemo<AuthApi>(
    () => ({
      isLoadingAuth: snap.isLoadingAuth,
      isAuthenticated: snap.isAuthenticated,
      login: () => openPrivyLogin(),
      logout: async () => openPrivyLogout(),
    }),
    [snap.isLoadingAuth, snap.isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
