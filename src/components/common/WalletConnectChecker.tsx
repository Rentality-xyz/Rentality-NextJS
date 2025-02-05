import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import React from "react";
import Layout from "../layout/layout";

interface WalletConnectCheckerProps {
  allowAnonymousAccess: boolean;
  children: React.ReactNode;
}

function WalletConnectChecker({ allowAnonymousAccess, children }: WalletConnectCheckerProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated && !allowAnonymousAccess && location.pathname !== "/host/become_host") {
    return (
      <Layout>
        <InvitationToConnect />
      </Layout>
    );
  }

  return <>{children}</>;
}

export default WalletConnectChecker;
