import Loading from "@/components/common/Loading";
import InvitationToConnect from "@/components/common/invitationToConnect";
import { useAuth } from "@/contexts/auth/authContext";
import React from "react";

interface CheckingLoadingPageProps {
  children: React.ReactNode;
  title?: React.ReactNode | null;
  isLoadingContentPage: boolean;
}

export default function CheckingLoadingPage({
  children,
  title = null,
  isLoadingContentPage,
}: CheckingLoadingPageProps) {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  return (
    <>
      {title && title}
      {isLoadingAuth && <Loading />}
      {!isLoadingAuth && !isAuthenticated && <InvitationToConnect />}
      {!isLoadingAuth && isAuthenticated && isLoadingContentPage && <Loading />}
      {!isLoadingAuth && isAuthenticated && !isLoadingContentPage && children}
    </>
  );
}
