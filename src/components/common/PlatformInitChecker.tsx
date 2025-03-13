import { useAuth } from "@/contexts/auth/authContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import React, { useEffect, useState } from "react";
import PlatformLoader from "./PlatformLoader";
import { PLATFORM_INIT_TIMEOUT } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  const router = useRouter();
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimerExpired(true);
    }, PLATFORM_INIT_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timerExpired && isPlatformLoading(isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts)) {
      router.push("/platform_init_error");
    }
  }, [timerExpired, isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts, router]);

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
