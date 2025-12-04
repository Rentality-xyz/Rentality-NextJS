import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AllOwnPointsInfo } from "../models";
import { getAllPoints } from "../utils";
import useOwnReferralPointsSharedStore from "./useOwnReferralPointsSharedStore";
import { TFunction } from "i18next";
import { getReferralReadContract } from "@/features/referralProgram/utils/getReferralReadContract";

export const REFERRAL_OWN_POINTS_QUERY_KEY = "ReferralOwnPoints";
type QueryData = { allPoints: AllOwnPointsInfo | null };

function useFetchOwnReferralPoints() {
  const ethereumInfo = useEthereum();
  const setReadyToClaim = useOwnReferralPointsSharedStore((state) => state.setReadyToClaim);
  const { t } = useTranslation();

  const queryResult = useQuery<QueryData>({
    queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => fetchOwnReferralPoints(ethereumInfo, setReadyToClaim, t),
  });

  const data = queryResult.data ?? { allPoints: null };
  return { ...queryResult, data: data };
}

async function fetchOwnReferralPoints(
  ethereumInfo: EthereumInfo | null | undefined,
  setReadyToClaim: (value: number) => void,
  t: TFunction
) {
  if (!ethereumInfo || !ethereumInfo.walletAddress) {
    throw new Error("Contracts or wallet not initialized");
  }

  const referralProgram = await getReferralReadContract();
  const [getReadyToClaimResult, getRefferalPointsInfoResult, getPointsHistoryResult] = await Promise.all([
    referralProgram.getReadyToClaim(ethereumInfo.walletAddress),
    referralProgram.getRefferalPointsInfo(),
    referralProgram.getPointsHistory(),
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
}

export default useFetchOwnReferralPoints;
