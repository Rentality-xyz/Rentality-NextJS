import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Err } from "@/model/utils/result";
import { REFERRAL_USER_BALANCE_QUERY_KEY } from "./useUserBalance";
import { useMemo } from "react";
import { usePaginationState } from "@/hooks/pagination";
import { REFERRAL_POINTS_HISTORY_QUERY_KEY } from "./usePointsHistory";
import { ContractReadyToClaimFromHash, RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { getReferralProgramDescriptionText } from "../utils";

export type PointsFromYourReferralsInfo = {
  methodDescriptions: string;
  totalReferrals: number;
  totalReceived: number;
  readyToClaim: number;
};

export const REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY = "ReferralPointsFromYourReferrals";

function usePointsFromYourReferrals(initialPage: number = 1, initialItemsPerPage: number = 10) {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { currentPage, itemsPerPage, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);

  const {
    isLoading,
    data: allDataWithReadyToClaim = { readyToClaim: 0, combinedData: [] },
    error: fetchError,
  } = useQuery({
    queryKey: [REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }
      console.debug("Fetching points from your referrals");

      const result = await rentalityContracts.referralProgram.getReadyToClaimFromRefferalHash(
        ethereumInfo.walletAddress
      );

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      const combinedData = combineReferralData(result.value.toClaim, t);
      const readyToClaim = combinedData.reduce((total, item) => total + item.readyToClaim, 0);
      return { readyToClaim, combinedData };
    },
    enabled: !!rentalityContracts && !!ethereumInfo?.walletAddress,
  });

  const totalPageCount = useMemo(() => {
    if (!allDataWithReadyToClaim.combinedData) return 0;

    return Math.ceil(allDataWithReadyToClaim.combinedData.length / itemsPerPage);
  }, [allDataWithReadyToClaim, itemsPerPage]);

  const pageData = useMemo(() => {
    if (!allDataWithReadyToClaim.combinedData) return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    return allDataWithReadyToClaim.combinedData.slice(startIndex, startIndex + itemsPerPage);
  }, [allDataWithReadyToClaim, currentPage, itemsPerPage]);

  const fetchData = async (page: number = 1, itemsPerPage: number = 10, filters: Record<string, any> = {}) => {
    await updatePagination(page, itemsPerPage, filters);
  };

  const {
    error: saveError,
    mutateAsync: claimPoints,
    isPending,
  } = useMutation({
    mutationFn: async () => {
      try {
        if (!rentalityContracts || !ethereumInfo) {
          console.error("claimPoints error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        const result = await rentalityContracts.referralProgram.claimRefferalPoints(ethereumInfo.walletAddress);

        return result.ok ? result : Err(new Error("claimMyPoints error: " + result.error));
      } catch (error) {
        console.error("claimPoints error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_USER_BALANCE_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY] });
    },
  });

  return {
    isLoading,
    isPending,
    readyToClaim: allDataWithReadyToClaim.readyToClaim,
    data: {
      data: pageData,
      currentPage: currentPage,
      totalPageCount: totalPageCount,
    },
    fetchData,
    fetchError,
    claimPoints,
    saveError,
  } as const;
}

export default usePointsFromYourReferrals;

function calculateTotalReferralsByRefType(referrals: ContractReadyToClaimFromHash[]): Record<number, number> {
  const groupedData = referrals.reduce(
    (acc, item) => {
      const { refType, user } = item;
      const refTypeNumber = Number(refType);

      if (!acc[refTypeNumber]) {
        acc[refTypeNumber] = new Set<string>();
      }

      acc[refTypeNumber].add(user);

      return acc;
    },
    {} as Record<number, Set<string>>
  );

  return Object.keys(groupedData).reduce(
    (acc, key) => {
      const refType = key as unknown as number;
      acc[refType] = groupedData[refType].size;
      return acc;
    },
    {} as Record<number, number>
  );
}

function calculateTotalReceivedByRefType(referrals: ContractReadyToClaimFromHash[]): Record<number, number> {
  return referrals.reduce(
    (acc, item) => {
      const { refType, points, claimed } = item;
      const refTypeNumber = Number(refType);

      if (claimed) {
        if (!acc[refTypeNumber]) {
          acc[refTypeNumber] = 0;
        }

        acc[refTypeNumber] += Number(points);
      }

      return acc;
    },
    {} as Record<number, number>
  );
}

function calculateReadyToClaimByRefType(referrals: ContractReadyToClaimFromHash[]): Record<number, number> {
  return referrals.reduce(
    (acc, item) => {
      const { refType, points, claimed } = item;
      const refTypeNumber = Number(refType);

      if (!claimed) {
        if (!acc[refTypeNumber]) {
          acc[refTypeNumber] = 0;
        }

        acc[refTypeNumber] += Number(points);
      }

      return acc;
    },
    {} as Record<number, number>
  );
}

function combineReferralData(referrals: ContractReadyToClaimFromHash[], t: any): PointsFromYourReferralsInfo[] {
  const totalReferrals = calculateTotalReferralsByRefType(referrals);
  const totalReceived = calculateTotalReceivedByRefType(referrals);
  const readyToClaim = calculateReadyToClaimByRefType(referrals);

  const allRefTypes = new Set<ReferralProgram>(referrals.map((item) => item.refType));

  return Array.from(allRefTypes).map((refType) => ({
    methodDescriptions: getReferralProgramDescriptionText(t, refType),
    totalReferrals: totalReferrals[Number(refType)] || 0,
    totalReceived: totalReceived[Number(refType)] || 0,
    readyToClaim: readyToClaim[Number(refType)] || 0,
  }));
}
