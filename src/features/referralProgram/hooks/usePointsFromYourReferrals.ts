import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import useReferralProgram from "@/features/referralProgram/hooks/useReferralProgram";
import { ContractReadyToClaimFromHash, RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { useTranslation } from "react-i18next";
import { getReferralProgramDescriptionText } from "../utils";

export type PointsFromYourReferralsInfo = {
  methodDescriptions: string;
  totalReferrals: number;
  totalReceived: number;
  readyToClaim: number;
};

const usePointsFromYourReferrals = () => {
  const { getReadyToClaimFromReferralHash, claimReferralPoints } = useReferralProgram();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PointsFromYourReferralsInfo[]>([]);
  const [allData, setAllData] = useState<PointsFromYourReferralsInfo[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);
  const [totalReadyToClaim, setTotalReadyToClaim] = useState<number>(0);
  const { t } = useTranslation();

  const filterData = useCallback((data: PointsFromYourReferralsInfo[], page: number = 1, itemsPerPage: number = 10) => {
    const slicedData = data.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    setCurrentPage(page);
    setData(slicedData);
    console.log(`slicedData.length: ${slicedData.length} | itemsPerPage: ${itemsPerPage}`);

    setTotalPageCount(Math.ceil(data.length / itemsPerPage));
  }, []);

  const fetchData = useCallback(
    async (page: number = 1, itemsPerPage: number = 10): Promise<Result<boolean, string>> => {
      if (allData !== null) {
        filterData(allData, page, itemsPerPage);
        return Ok(true);
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);

        const readyToClaimFromReferral = await getReadyToClaimFromReferralHash();

        if (readyToClaimFromReferral) {
          const combinedData = combineReferralData(readyToClaimFromReferral.toClaim, t);
          const totalReadyToClaim = combinedData.reduce((total, item) => total + item.readyToClaim, 0);
          // console.log("Combined Data:", JSON.stringify(combinedData, null, 2));
          setTotalReadyToClaim(totalReadyToClaim);
          setAllData(combinedData);
          filterData(combinedData, page, itemsPerPage);
        }

        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [allData]
  );

  const claimAllReferralPoints = useCallback(async (): Promise<void> => {
    try {
      await claimReferralPoints();
    } catch (e) {
      console.error("fetchData error" + e);
    }
  }, [claimReferralPoints]);

  return {
    isLoading,
    data: {
      data: data,
      currentPage: currentPage,
      totalPageCount: totalPageCount,
      totalReadyToClaim: totalReadyToClaim,
    },
    fetchData,
    claimAllReferralPoints,
  } as const;
};

export default usePointsFromYourReferrals;

const calculateTotalReferralsByRefType = (referrals: ContractReadyToClaimFromHash[]): Record<number, number> => {
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
};

const calculateTotalReceivedByRefType = (referrals: ContractReadyToClaimFromHash[]): Record<number, number> => {
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
};

const calculateReadyToClaimByRefType = (referrals: ContractReadyToClaimFromHash[]): Record<number, number> => {
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
};

const combineReferralData = (referrals: ContractReadyToClaimFromHash[], t: any): PointsFromYourReferralsInfo[] => {
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
};
