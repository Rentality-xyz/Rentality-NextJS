import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import React from "react";
import PlatformLoader from "./PlatformLoader";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const ethereumInfo = useEthereum();

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <PlatformLoader />;
  }

  return <>{children}</>;
}

export default PlatformInitChecker;
