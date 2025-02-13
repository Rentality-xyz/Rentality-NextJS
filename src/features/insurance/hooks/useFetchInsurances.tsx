import { useRentality } from "@/contexts/rentalityContext";
import { InsuranceType } from "@/model/blockchain/schemas";
import { validateContractInsuranceDTO } from "@/model/blockchain/schemas_utils";
import { UTC_TIME_ZONE_ID } from "@/utils/date";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { getDateFromBlockchainTime, getDateFromBlockchainTimeWithTZ } from "@/utils/formInput";
import { bigIntReplacer } from "@/utils/json";
import moment from "moment";
import { TripInsurance } from "../models";
import { usePaginationForListApi } from "@/hooks/pagination";

export type InsuranceFiltersType = {};
export const INSURANCE_LIST_QUERY_KEY = "InsuranceList";

function useFetchInsurances(isHost: boolean, initialPage: number = 1, initialItemsPerPage: number = 10) {
  const { rentalityContracts } = useRentality();

  const { isLoading, data, error, fetchData } = usePaginationForListApi<TripInsurance>(
    [INSURANCE_LIST_QUERY_KEY, isHost],
    async () => {
      if (!rentalityContracts) {
        throw new Error("Contracts not initialized");
      }
      console.debug(`Fetching insurance list for ${isHost ? "host" : "guest"}`);

      const result = await rentalityContracts.gatewayProxy.getInsurancesBy(isHost);

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      if (result.value && result.value.length > 0) {
        validateContractInsuranceDTO(result.value[0]);
      }
      console.debug("insuranceData", JSON.stringify(result.value, bigIntReplacer, 2));

      const data: TripInsurance[] = result.value.map((i) => {
        const timeZoneId = UTC_TIME_ZONE_ID;
        const startDateTime = getDateFromBlockchainTimeWithTZ(i.startDateTime, timeZoneId);

        return {
          tripId: Number(i.tripId),
          insuranceType: i.insuranceInfo.insuranceType,
          tripInfo:
            i.insuranceInfo.insuranceType === InsuranceType.General
              ? "For all trips"
              : `#${i.tripId} ${i.carBrand} ${i.carModel} ${i.carYear} ${dateRangeFormatShortMonthDateYear(startDateTime, getDateFromBlockchainTimeWithTZ(i.endDateTime, timeZoneId))}`,
          startDateTime: startDateTime,
          insurance: {
            type: i.insuranceInfo.insuranceType,
            photos: [i.insuranceInfo.photo],
            companyName: i.insuranceInfo.companyName,
            policyNumber: i.insuranceInfo.policyNumber,
            comment: i.insuranceInfo.comment,
            uploadedBy: `${i.createdByHost ? "Host" : "Guest"} ${i.creatorFullName} uploaded ${moment(getDateFromBlockchainTime(i.insuranceInfo.createdTime)).format("DD.MM.YY hh:mm A")}`,
            uploadedAt: getDateFromBlockchainTime(i.insuranceInfo.createdTime),
            isActual: i.isActual,
          },
          hostPhoneNumber: i.creatorPhoneNumber,
          guestPhoneNumber: i.creatorPhoneNumber,
        };
      });
      data.sort((a, b) => {
        const timeDiff = b.insurance.uploadedAt.getTime() - a.insurance.uploadedAt.getTime();
        if (timeDiff !== 0) return timeDiff;
        return Number(a.insuranceType - b.insuranceType);
      });

      return data;
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
}

export default useFetchInsurances;
