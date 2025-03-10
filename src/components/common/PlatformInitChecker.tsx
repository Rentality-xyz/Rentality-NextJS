import { useAuth } from "@/contexts/auth/authContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import React, { useEffect, useState } from "react";
import PlatformLoader from "./PlatformLoader";
import { PLATFORM_INIT_TIMEOUT } from "@/utils/constants";
import { useRouter } from "next/navigation";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  const router = useRouter();
  const ethereumInfo = useEthereum();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerExpired(true);
    }, PLATFORM_INIT_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timerExpired && (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined))) {
      router.push("/platform_init_error");
    }
  }, [timerExpired, isLoadingAuth, isAuthenticated, ethereumInfo, router]);

  if (isLoadingAuth || (isAuthenticated && ethereumInfo === undefined)) {
    return <PlatformLoader />;
  }

  return <>{children}</>;
}

export default PlatformInitChecker;
