import { RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useTranslation } from "react-i18next";
import { getReferralProgramDescriptionText } from "../utils";
import { usePaginationForListApi } from "@/hooks/pagination/usePaginationForListApi";
import { TFunction } from "i18next";
import { UTC_TIME_ZONE_ID } from "@/utils/constants";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";

export type ReferralHistoryInfo = {
  points: number;
  date: Date;
  methodDescriptions: string;
};

export const REFERRAL_POINTS_HISTORY_QUERY_KEY = "ReferralPointsHistory";

function useFetchPointsHistory(initialPage: number = 1, initialItemsPerPage: number = 10) {
  const { t } = useTranslation();
   const rentality = useRentality()

  const queryResult = usePaginationForListApi<ReferralHistoryInfo>(
    {
      queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY, rentality?.rentalityContracts],
      queryFn: async () => fetchPointsHistory(t, rentality.rentalityContracts),
      refetchOnWindowFocus: false,
    },
    initialPage,
    initialItemsPerPage
  );

  return queryResult;
}

async function fetchPointsHistory(t: TFunction, rentalityContracts: IRentalityContracts | undefined | null) {
  if (!rentalityContracts) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getPointsHistory();

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  const data = result.value.map((historyDataDto) => {
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
  });

  data.sort((a, b) => b.date.getTime() - a.date.getTime());
  return data;
}

export default useFetchPointsHistory;
