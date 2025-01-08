import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import React from "react";

interface CheckingLoadingAuthProps {
  children: React.ReactNode;
}

export default function CheckingLoadingAuth({ children }: CheckingLoadingAuthProps) {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const ethereumInfo = useEthereum();

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <InvitationToConnect />;
  }

  return <>{children}</>;
}
