import { SearchCarFilters, SearchCarRequest } from "@/model/SearchCarRequest";
import { getBlockchainTimeFromDate } from "./formInput";
import { ContractSearchCarParams } from "@/model/blockchain/schemas";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { parseDateIntervalWithDSTCorrection } from "./date";

export function formatSearchAvailableCarsContractRequest(
  searchCarRequest: SearchCarRequest,
  searchCarFilters: SearchCarFilters,
  timeZoneId: string
) {
  const { dateFrom, dateTo } = parseDateIntervalWithDSTCorrection(
    searchCarRequest.dateFromInDateTimeStringFormat,
    searchCarRequest.dateToInDateTimeStringFormat,
    timeZoneId
  );

  const contractDateFromUTC = getBlockchainTimeFromDate(dateFrom);
  const contractDateToUTC = getBlockchainTimeFromDate(dateTo);
  const contractSearchCarParams: ContractSearchCarParams = {
    country: searchCarRequest.searchLocation.country ?? "",
    state: searchCarRequest.searchLocation.state ?? "",
    city: searchCarRequest.searchLocation.city ?? "",
    brand: searchCarFilters.brand ?? "",
    model: searchCarFilters.model ?? "",
    yearOfProductionFrom: BigInt(searchCarFilters.yearOfProductionFrom ?? 0),
    yearOfProductionTo: BigInt(searchCarFilters.yearOfProductionTo ?? 0),
    pricePerDayInUsdCentsFrom: BigInt((searchCarFilters.pricePerDayInUsdFrom ?? 0) * 100),
    pricePerDayInUsdCentsTo: BigInt((searchCarFilters.pricePerDayInUsdTo ?? 0) * 100),
    userLocation: {
      ...emptyContractLocationInfo,
      latitude: searchCarRequest.searchLocation.latitude.toFixed(6),
      longitude: searchCarRequest.searchLocation.longitude.toFixed(6),
    },
  };
  return { contractDateFromUTC, contractDateToUTC, contractSearchCarParams } as const;
}
