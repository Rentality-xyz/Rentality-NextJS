import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import React, { useEffect } from "react";

interface CheckingLoadingAuthProps {
  children: React.ReactNode;
}

export default function CheckingLoadingAuth({ children }: CheckingLoadingAuthProps) {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      {isLoadingAuth && <Loading />}
      {!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}
      {!isLoadingAuth && isAuthenticated && children}
    </>
  );
}
