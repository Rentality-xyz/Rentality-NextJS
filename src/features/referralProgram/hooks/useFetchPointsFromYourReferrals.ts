import { useEthereum } from "@/contexts/web3/ethereumContext";
import { useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { usePaginationState } from "@/hooks/pagination";
import { ContractReadyToClaimFromHash, RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { getReferralProgramDescriptionText } from "../utils";
import { logger } from "@/utils/logger";

export type PointsFromYourReferralsInfo = {
  methodDescriptions: string;
  totalReferrals: number;
  totalReceived: number;
  readyToClaim: number;
};

export const REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY = "ReferralPointsFromYourReferrals";

function useFetchPointsFromYourReferrals(initialPage: number = 1, initialItemsPerPage: number = 10) {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { currentPage, itemsPerPage, updatePagination } = usePaginationState(initialPage, initialItemsPerPage);
  const { t } = useTranslation();

  const {
    isLoading,
    isFetching,
    data: allDataWithReadyToClaim = { readyToClaim: 0, combinedData: [] },
    error,
  } = useQuery({
    queryKey: [REFERRAL_POINTS_FROM_YOUR_REFERRALS_QUERY_KEY, ethereumInfo?.walletAddress],
    queryFn: async () => {
      if (!rentalityContracts || !ethereumInfo) {
        throw new Error("Contracts or wallet not initialized");
      }
      logger.debug("Fetching points from your referrals");

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
    enabled: !!rentalityContracts && !!ethereumInfo,
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

  return {
    isLoading,
    isFetching,
    data: {
      readyToClaim: allDataWithReadyToClaim.readyToClaim,
      pageData: pageData,
      currentPage: currentPage,
      totalPageCount: totalPageCount,
    },
    fetchData,
    error,
  } as const;
}

export default useFetchPointsFromYourReferrals;

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
