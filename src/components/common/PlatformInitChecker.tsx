import { useAuth } from "@/contexts/auth/authContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import React, { useEffect, useState } from "react";
import PlatformLoader from "./PlatformLoader";
import { PLATFORM_INIT_TIMEOUT } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import PlatformInitOffline from "@/components/common/PlatformInitOffline";
import PlatformInitError from "@/components/common/PlatformInitError";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  const router = useRouter();
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const [timerExpired, setTimerExpired] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPlatformInitError, setPlatformInitError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerExpired(true);
    }, PLATFORM_INIT_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (
      timerExpired &&
      isOnline &&
      isPlatformLoading(isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts)
    ) {
      setPlatformInitError(true);
    }
  }, [timerExpired, isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts, router, isOnline]);

  if (isPlatformInitError) {
    return <PlatformInitError/>;
  }

  if (!isOnline && isPlatformLoading(isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts)) {
    return <PlatformInitOffline />;
  }

  if (isPlatformLoading(isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts)) {
    return <PlatformLoader />;
  }

  return <>{children}</>;
}

function isPlatformLoading(
  isLoadingAuth: boolean,
  isAuthenticated: boolean,
  ethereumInfo: EthereumInfo | null | undefined,
  rentalityContracts: IRentalityContracts | null | undefined
) {
  return isLoadingAuth || (isAuthenticated && (ethereumInfo === undefined || rentalityContracts === undefined));
}

export default PlatformInitChecker;
