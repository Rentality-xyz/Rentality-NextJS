import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import useInviteLink from "@/hooks/useRefferalProgram";
import { ReadyToClaimRefferalHash, RefferalProgram } from "@/model/blockchain/schemas";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";
import { useTranslation } from "react-i18next";

export type PointsFromYourReferralsInfo = {
  methodDescriptions: string;
  totalReferrals: number;
  totalReceived: number;
  readyToClaim: number;
};

const usePointsFromYourReferrals = () => {
  const { t } = useTranslation();

  const [
    inviteHash,
    points,
    claimPoints,
    getReadyToClaim,
    getReadyToClaimFromRefferalHash,
    claimRefferalPoints,
    getRefferalPointsInfo,
    getPointsHistory,
    manageRefferalDiscount,
    manageTearInfo,
    calculateUniqUsers,
  ] = useInviteLink();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PointsFromYourReferralsInfo[]>([]);
  const [allData, setAllData] = useState<PointsFromYourReferralsInfo[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);
  const [totalReadyToClaim, setTotalReadyToClaim] = useState<number>(0);

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

        const readyToClaimFromRefferal = await getReadyToClaimFromRefferalHash();

        if (readyToClaimFromRefferal) {
          const combinedData = combineReferralData(readyToClaimFromRefferal.toClaim, t);
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
      await claimRefferalPoints();
    } catch (e) {
      console.error("fetchData error" + e);
    }
  }, [claimRefferalPoints]);

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

const calculateTotalReferralsByRefType = (referrals: ReadyToClaimRefferalHash[]): Record<RefferalProgram, number> => {
  const groupedData = referrals.reduce(
    (acc, item) => {
      const { refType, user } = item;

      if (!acc[refType]) {
        acc[refType] = new Set<string>();
      }

      acc[refType].add(user);

      return acc;
    },
    {} as Record<RefferalProgram, Set<string>>
  );

  return Object.keys(groupedData).reduce(
    (acc, key) => {
      const refType = key as unknown as RefferalProgram;
      acc[refType] = groupedData[refType].size;
      return acc;
    },
    {} as Record<RefferalProgram, number>
  );
};

const calculateTotalReceivedByRefType = (referrals: ReadyToClaimRefferalHash[]): Record<RefferalProgram, number> => {
  return referrals.reduce(
    (acc, item) => {
      const { refType, points, claimed } = item;

      if (claimed) {
        if (!acc[refType]) {
          acc[refType] = 0;
        }

        acc[refType] += points;
      }

      return acc;
    },
    {} as Record<RefferalProgram, number>
  );
};

const calculateReadyToClaimByRefType = (referrals: ReadyToClaimRefferalHash[]): Record<RefferalProgram, number> => {
  return referrals.reduce(
    (acc, item) => {
      const { refType, points, claimed } = item;

      if (!claimed) {
        if (!acc[refType]) {
          acc[refType] = 0;
        }

        acc[refType] += points;
      }

      return acc;
    },
    {} as Record<RefferalProgram, number>
  );
};

const combineReferralData = (referrals: ReadyToClaimRefferalHash[], t: any): PointsFromYourReferralsInfo[] => {
  const totalReferrals = calculateTotalReferralsByRefType(referrals);
  const totalReceived = calculateTotalReceivedByRefType(referrals);
  const readyToClaim = calculateReadyToClaimByRefType(referrals);

  const allRefTypes = new Set<RefferalProgram>(referrals.map((item) => item.refType));

  return Array.from(allRefTypes).map((refType) => ({
    methodDescriptions: ReferralProgramDescription(t, refType),
    totalReferrals: totalReferrals[refType] || 0,
    totalReceived: totalReceived[refType] || 0,
    readyToClaim: readyToClaim[refType] || 0,
  }));
};
