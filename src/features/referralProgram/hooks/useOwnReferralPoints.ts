import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AllOwnPointsInfo } from "../models";
import { getAllPoints } from "../utils";
import { useTranslation } from "react-i18next";
import { Err } from "@/model/utils/result";
import { REFERRAL_USER_BALANCE_QUERY_KEY } from "./useUserBalance";
import { REFERRAL_POINTS_HISTORY_QUERY_KEY } from "./usePointsHistory";

export const REFERRAL_OWN_POINTS_QUERY_KEY = "ReferralOwnPoints";

function useOwnReferralPoints() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    isLoading,
    data = { readyToClaim: 0, allPoints: null as AllOwnPointsInfo | null },
    error: fetchError,
  } = useQuery({
    queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

      console.debug("Fetching AllOwnPointsInfo");

      const [getReadyToClaimResult, getRefferalPointsInfoResult, getPointsHistoryResult] = await Promise.all([
        rentalityContracts.referralProgram.getReadyToClaim(ethereumInfo.walletAddress),
        rentalityContracts.referralProgram.getRefferalPointsInfo(),
        rentalityContracts.referralProgram.getPointsHistory(),
      ]);

      if (!getReadyToClaimResult.ok) {
        throw new Error(getReadyToClaimResult.error.message);
      }

      if (!getRefferalPointsInfoResult.ok) {
        throw new Error(getRefferalPointsInfoResult.error.message);
      }

      if (!getPointsHistoryResult.ok) {
        throw new Error(getPointsHistoryResult.error.message);
      }

      const result = getAllPoints(
        getReadyToClaimResult.value,
        getPointsHistoryResult.value,
        getRefferalPointsInfoResult.value,
        t
      );

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return { readyToClaim: Number(getReadyToClaimResult.value.totalPoints), allPoints: result.value };
    },
    enabled: !!rentalityContracts && !!ethereumInfo?.walletAddress,
  });

  const {
    error: saveError,
    mutateAsync: claimMyPoints,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      try {
        if (!rentalityContracts || !ethereumInfo) {
          console.error("claimMyPoints error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const result = await rentalityContracts.referralProgram.claimPoints(ethereumInfo.walletAddress);

        return result.ok ? result : Err(new Error("claimMyPoints error: " + result.error));
      } catch (error) {
        console.error("claimMyPoints error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY] });
    },
  });

  return {
    isLoading,
    isPending,
    readyToClaim: data.readyToClaim,
    allPoints: data.allPoints,
    fetchError,
    claimMyPoints,
    saveError,
  } as const;
}

export default useOwnReferralPoints;
