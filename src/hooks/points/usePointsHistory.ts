import { useCallback, useState } from "react";
import { RefferalProgram } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import useInviteLink from "@/hooks/useRefferalProgram";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useTranslation } from "react-i18next";
import { ReferralProgramDescription } from "@/components/points/ReferralProgramDescriptions";

export type ReferralHistoryInfo = {
  points: number;
  date: Date;
  methodDescriptions: string;
};

const usePointsHistory = () => {
  const { getPointsHistory } = useInviteLink();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReferralHistoryInfo[]>([]);
  const [allData, setAllData] = useState<ReferralHistoryInfo[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);
  const { t } = useTranslation();

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

              const methodDescriptions =
                historyDataDto.method === RefferalProgram.FinishTripAsGuest
                  ? isOneTime
                    ? t("referrals_and_point.referral_program.finish_trip_as_guest_one_time")
                    : t("referrals_and_point.referral_program.finish_trip_as_guest")
                  : ReferralProgramDescription(t, historyDataDto.method);

              return {
                points: Number(historyDataDto.points),
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
