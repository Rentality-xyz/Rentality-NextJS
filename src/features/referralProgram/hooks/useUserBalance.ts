import { useCallback, useEffect, useState } from "react";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";

export const REFERRAL_USER_BALANCE_QUERY_KEY = "ReferralUserBalance";

function useUserBalance() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const {
    isLoading,
    data: balance = 0,
    error,
    refetch,
  } = useQuery({
    queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }
      console.debug("Fetching user balance");

      const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return Number(result.value);
    },
    enabled: !!rentalityContracts && !!ethereumInfo?.walletAddress,
  });

  return { isLoading, balance, error, refetch } as const;
}

function useUserBalanceOld() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const [isLoading, setIsLoading] = useState(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [points, setPoints] = useState(0);

  const updateData = useCallback(() => {
    setUpdateRequired(true);
  }, []);

  useEffect(() => {
    const fetchTotalPoints = async () => {
      if (!rentalityContracts || !ethereumInfo) return;
      if (!updateRequired) return;

      setUpdateRequired(false);

      try {
        console.debug("fetchTotalPoints call");
        const result = await rentalityContracts.referralProgram.addressToPoints(ethereumInfo.walletAddress);
        if (result.ok) {
          setPoints(Number(result.value));
        }
      } catch (error) {
        console.error("fetchTotalPoints error: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalPoints();
  }, [rentalityContracts, ethereumInfo, updateRequired]);

  return {
    isLoading,
    points,
    updateData,
  } as const;
}

export default useUserBalance;
