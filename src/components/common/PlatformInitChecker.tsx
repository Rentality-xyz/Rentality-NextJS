import { useAuth } from "@/contexts/auth/authContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import React, { useEffect, useMemo, useState } from "react";
import PlatformLoader from "./PlatformLoader";
import { PLATFORM_INIT_TIMEOUT } from "@/utils/constants";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import PlatformInitOffline from "@/components/common/PlatformInitOffline";
import PlatformInitError from "@/components/common/PlatformInitError";

interface PlatformInitCheckerProps {
  children: React.ReactNode;
}

function PlatformInitChecker({ children }: PlatformInitCheckerProps) {
  // const router = useRouter();
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { isLoadingAuth, isAuthenticated } = useAuth();

  const [timerExpired, setTimerExpired] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPlatformInitError, setPlatformInitError] = useState(false);

  const loading = useMemo(
    () => isPlatformLoading(isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts),
    [isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts]
  );

  // ✅ перезапуск таймера при login / chain change
  useEffect(() => {
    setTimerExpired(false);
    setPlatformInitError(false);

    const timer = setTimeout(() => {
      setTimerExpired(true);
    }, PLATFORM_INIT_TIMEOUT);

    return () => clearTimeout(timer);
  }, [isAuthenticated, ethereumInfo?.chainId]);

  // online/offline
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

  // 🚨 тригер помилки
  useEffect(() => {
    if (timerExpired && isOnline && loading) {
      setPlatformInitError(true);
    }
  }, [timerExpired, isOnline, loading, isLoadingAuth, isAuthenticated, ethereumInfo, rentalityContracts]);

  // ✅ якщо платформа стала ready — прибираємо error screen (щоб не “залипало”)
  useEffect(() => {
    if (!loading && isPlatformInitError) {
      setPlatformInitError(false);
    }
  }, [loading, isPlatformInitError]);

  if (isPlatformInitError) {
    return <PlatformInitError />;
  }

  if (!isOnline && loading) {
    return <PlatformInitOffline />;
  }

  if (loading) {
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
