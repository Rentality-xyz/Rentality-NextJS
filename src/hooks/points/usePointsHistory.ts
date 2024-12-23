import { useCallback, useState } from "react";
import { RefferalHistory, RefferalProgram } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import useInviteLink from "@/hooks/useRefferalProgram";
import { calculateDays, UTC_TIME_ZONE_ID } from "@/utils/date";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useTranslation } from "react-i18next";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";

export type ReferralHistoryInfo = {
  points: number;
  date: Date;
  methodDescriptions: string;
};

const usePointsHistory = () => {
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
  const [data, setData] = useState<ReferralHistoryInfo[]>([]);
  const [allData, setAllData] = useState<ReferralHistoryInfo[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const filterData = useCallback((data: ReferralHistoryInfo[], page: number = 1, itemsPerPage: number = 10) => {
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

        const historyData = await getPointsHistory();

        if (historyData) {
          const data: ReferralHistoryInfo[] = await Promise.all(
            historyData.map(async (historyDataDto) => {
              const isOneTime = historyDataDto.oneTime;

              const dynamicDescriptions: { [key: number]: string } = {
                [RefferalProgram.FinishTripAsGuest]: isOneTime
                  ? t("referrals_and_point.referral_program.finish_trip_as_guest_one_time")
                  : t("referrals_and_point.referral_program.finish_trip_as_guest"),
              };

              const methodDescriptions =
                dynamicDescriptions[historyDataDto.method] || ReferralProgramDescription(t, historyDataDto.method);

              return {
                points: historyDataDto.points,
                date: getDateFromBlockchainTimeWithTZ(historyDataDto.date, UTC_TIME_ZONE_ID),
                methodDescriptions,
              };
            })
          );

          setAllData(data);
          filterData(data, page, itemsPerPage);
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

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
};

export default usePointsHistory;