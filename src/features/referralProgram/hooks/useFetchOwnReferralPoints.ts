import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { DefinedUseQueryResult, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AllOwnPointsInfo } from "../models";
import { getAllPoints } from "../utils";
import useOwnReferralPointsSharedStore from "./useOwnReferralPointsSharedStore";

export const REFERRAL_OWN_POINTS_QUERY_KEY = "ReferralOwnPoints";

type QueryData = { allPoints: AllOwnPointsInfo | null };

function useFetchOwnReferralPoints() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const setReadyToClaim = useOwnReferralPointsSharedStore((state) => state.setReadyToClaim);
  const { t } = useTranslation();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }

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
      const getReadyToClaim = Number(getReadyToClaimResult.value.totalPoints);

      setReadyToClaim(getReadyToClaim);
      return { allPoints: result.value };
    },
  });

  const data = queryResult.data ?? { allPoints: null };
  return { ...queryResult, data: data } as DefinedUseQueryResult<QueryData, Error>;
}

export default useFetchOwnReferralPoints;
