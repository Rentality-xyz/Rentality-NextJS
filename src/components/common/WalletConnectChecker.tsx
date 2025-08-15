import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import React, { useEffect } from "react";
import Layout from "../layout/layout";

interface WalletConnectCheckerProps {
  allowAnonymousAccess: boolean;
  children: React.ReactNode;
}

const TTL_HOURS = 24;
const LAST_LOGIN_KEY = "wallet_last_login_at";

function WalletConnectChecker({ allowAnonymousAccess, children }: WalletConnectCheckerProps) {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    const raw = localStorage.getItem(LAST_LOGIN_KEY);
    const last = raw ? Number(raw) : now;

    const expired = now - last > TTL_HOURS * 60 * 60 * 1000;
    if (expired) {
      localStorage.removeItem(LAST_LOGIN_KEY);
      logout();
      return;
    }

    localStorage.setItem(LAST_LOGIN_KEY, String(now));
  }, [isAuthenticated, logout]);

  if (!isAuthenticated && !allowAnonymousAccess) {
    return (
      <Layout>
        <InvitationToConnect />
      </Layout>
    );
  }

  return <>{children}</>;
}

export default WalletConnectChecker;
