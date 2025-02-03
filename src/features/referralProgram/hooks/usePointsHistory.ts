import { RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useTranslation } from "react-i18next";
import { getReferralProgramDescriptionText } from "../utils";
import { useRentality } from "@/contexts/rentalityContext";
import { usePaginationForListApi } from "@/hooks/pagination";

export type ReferralHistoryInfo = {
  points: number;
  date: Date;
  methodDescriptions: string;
};

export const REFERRAL_POINTS_HISTORY_QUERY_KEY = "ReferralPointsHistory";

const usePointsHistory = (initialPage: number = 1, initialItemsPerPage: number = 10) => {
  const { rentalityContracts } = useRentality();
  const { t } = useTranslation();

  const { isLoading, data, error, fetchData } = usePaginationForListApi<ReferralHistoryInfo>(
    REFERRAL_POINTS_HISTORY_QUERY_KEY,
    async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }
      console.debug("Fetching points history");

      const result = await rentalityContracts.referralProgram.getPointsHistory();

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return await Promise.all(
        result.value.map(async (historyDataDto) => {
          const isOneTime = historyDataDto.oneTime;

          const methodDescriptions =
            historyDataDto.method === ReferralProgram.FinishTripAsGuest
              ? isOneTime
                ? t("referrals_and_point.referral_program.finish_trip_as_guest_one_time")
                : t("referrals_and_point.referral_program.finish_trip_as_guest")
              : getReferralProgramDescriptionText(t, historyDataDto.method);

          return {
            points: Number(historyDataDto.points),
            date: getDateFromBlockchainTimeWithTZ(historyDataDto.date, UTC_TIME_ZONE_ID),
            methodDescriptions,
          };
        })
      );
    },
    !!rentalityContracts,
    initialPage,
    initialItemsPerPage
  );

  return {
    isLoading,
    data: data,
    error,
    fetchData,
  } as const;
};

export default usePointsHistory;
