import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AllOwnPointsInfo } from "../models";
import { getAllPoints } from "../utils";

export const REFERRAL_OWN_POINTS_QUERY_KEY = "ReferralOwnPoints";

type QueryData = { readyToClaim: number; allPoints: AllOwnPointsInfo | null };

function useFetchOwnReferralPoints() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { t } = useTranslation();

  return useQuery<QueryData>({
    queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY, ethereumInfo?.walletAddress],
    initialData: { readyToClaim: 0, allPoints: null as AllOwnPointsInfo | null },
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
}

export default useFetchOwnReferralPoints;
