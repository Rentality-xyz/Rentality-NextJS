import { useCallback, useState } from "react";
import { Err, Ok, Result } from "@/model/utils/result";
import useInviteLink from "@/hooks/useRefferalProgram";
import { ReadyToClaimRefferalHash, RefferalProgram } from "@/model/blockchain/schemas";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";
import { useTranslation } from "react-i18next";

export type OwnPointsInfo = {
  methodDescriptions: string;
  totalReferrals: number;
  totalReceived: number;
  readyToClaim: number;
};

const useOwnPoints = () => {
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
  const [data, setData] = useState<OwnPointsInfo[]>([]);
  const [allData, setAllData] = useState<OwnPointsInfo[] | null>(null);
  const [totalReadyToClaim, setTotalReadyToClaim] = useState<number>(0);

  const fetchData = useCallback(async (): Promise<Result<boolean, string>> => {
    if (allData !== null) {
      return Ok(true);
    }

    try {
      setIsLoading(true);

      const readyToClaimFromRefferal = await getReadyToClaimFromRefferalHash();

      if (readyToClaimFromRefferal) {
        // console.log("Combined Data:", JSON.stringify(combinedData, null, 2));
        setTotalReadyToClaim(totalReadyToClaim);
        // setAllData(combinedData);
        // filterData(combinedData, page, itemsPerPage);
      }

      return Ok(true);
    } catch (e) {
      console.error("fetchData error" + e);
      return Err("Get data error. See logs for more details");
    } finally {
      setIsLoading(false);
    }
  }, [allData]);

  const claimAllPoints = useCallback(async (): Promise<void> => {
    try {
      await claimPoints();
    } catch (e) {
      console.error("fetchData error" + e);
    }
  }, [claimPoints]);

  return {
    isLoading,
    data: {
      data: data,
      totalReadyToClaim: totalReadyToClaim,
    },
    fetchData,
    claimAllPoints: claimAllPoints,
  } as const;
};

export default useOwnPoints;
