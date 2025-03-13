import { RefferalProgram as ReferralProgram } from "@/model/blockchain/schemas";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { useTranslation } from "react-i18next";
import { getReferralProgramDescriptionText } from "../utils";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { usePaginationForListApi } from "@/hooks/pagination/usePaginationForListApi";
import { TFunction } from "i18next";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { DEFAULT_PAGINATED_DATA } from "@/hooks/pagination";

export type ReferralHistoryInfo = {
  points: number;
  date: Date;
  methodDescriptions: string;
};

export const REFERRAL_POINTS_HISTORY_QUERY_KEY = "ReferralPointsHistory";

function useFetchPointsHistory(initialPage: number = 1, initialItemsPerPage: number = 10) {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { t } = useTranslation();

  const queryResult = usePaginationForListApi<ReferralHistoryInfo>(
    {
      queryKey: [REFERRAL_POINTS_HISTORY_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
      queryFn: async () => fetchPointsHistory(rentalityContracts, t),
    },
    initialPage,
    initialItemsPerPage
  );

  const data = queryResult.data ?? DEFAULT_PAGINATED_DATA;

  return { ...queryResult, data: data };
}

async function fetchPointsHistory(rentalityContracts: IRentalityContracts | null | undefined, t: TFunction) {
  if (!rentalityContracts) {
    throw new Error("Contracts not initialized");
  }

  const result = await rentalityContracts.referralProgram.getPointsHistory();

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
