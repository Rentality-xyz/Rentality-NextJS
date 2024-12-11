import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import React from "react";
import Layout from "../layout/layout";
import PlatformLoader from "./PlatformLoader";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

export default function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const ethereumInfo = useEthereum();

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <PlatformLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <InvitationToConnect />
      </Layout>
    );
  }

  return <>{children}</>;
}
