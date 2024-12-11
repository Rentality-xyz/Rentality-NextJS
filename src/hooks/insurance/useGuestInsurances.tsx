import { useRentality } from "@/contexts/rentalityContext";
import { ContractInsuranceDTO, InsuranceType } from "@/model/blockchain/schemas";
import { validateContractInsuranceDTO } from "@/model/blockchain/schemas_utils";
import { TripInsurance } from "@/model/insurance/model";
import { Err, Ok, Result } from "@/model/utils/result";
import { dateRangeFormatShortMonthDateYear } from "@/utils/datetimeFormatters";
import { getDateFromBlockchainTime } from "@/utils/formInput";
import { bigIntReplacer } from "@/utils/json";
import moment from "moment";
import { useCallback, useState } from "react";

export type GuestInsuranceFiltersType = {};

export default function useGuestInsurances() {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TripInsurance[]>([]);
  const [allData, setAllData] = useState<TripInsurance[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const filterData = useCallback(
    (data: TripInsurance[], filters?: GuestInsuranceFiltersType, page: number = 1, itemsPerPage: number = 10) => {
      const filteredData = !filters
        ? data
        : data.filter(
            (i) => i !== undefined
            // (filters.dateFrom === undefined || i.startDateTime >= filters.dateFrom) &&
            // (filters.dateTo === undefined || i.endDateTime <= filters.dateTo) &&
            // (filters.status === undefined || i.status === filters.status)
          );
      const slicedData = filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
      setCurrentPage(page);
      setData(slicedData);
      console.log(`slicedData.length: ${slicedData.length} | itemsPerPage: ${itemsPerPage}`);

      setTotalPageCount(Math.ceil(filteredData.length / itemsPerPage));
    },
    []
  );

  const fetchData = useCallback(
    async (
      filters?: GuestInsuranceFiltersType,
      page: number = 1,
      itemsPerPage: number = 10
    ): Promise<Result<boolean, string>> => {
      if (allData !== undefined) {
        filterData(allData, filters, page, itemsPerPage);
        return Ok(true);
      }

      if (!rentalityContract) {
        console.error("fetchData error: rentalityContract is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);
        console.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

        const insuranceData: ContractInsuranceDTO[] = await rentalityContract.getInsurancesBy(false);

        if (insuranceData && insuranceData.length > 0) {
          validateContractInsuranceDTO(insuranceData[0]);
        }

        console.log("insuranceData", JSON.stringify(insuranceData, bigIntReplacer, 2));

        const data: TripInsurance[] = insuranceData.map((i) => ({
          tripId: Number(i.tripId),
          tripInfo:
            i.insuranceInfo.insuranceType === InsuranceType.General
              ? "For all trips"
              : `#${i.tripId} ${i.carBrand} ${i.carModel} ${i.carYear} ${dateRangeFormatShortMonthDateYear(new Date(), new Date())}`,
          insurance: {
            type: i.insuranceInfo.insuranceType,
            photos: [i.insuranceInfo.photo],
            companyName: i.insuranceInfo.companyName,
            policyNumber: i.insuranceInfo.policyNumber,
            comment: i.insuranceInfo.comment,
            uploadedBy: `${i.createdByHost ? "Host" : "Guest"} ${i.creatorFullName} uploaded ${moment(getDateFromBlockchainTime(i.insuranceInfo.createdTime)).format("DD.MM.YY hh:mm A")}`,
          },
          hostPhoneNumber: i.creatorPhoneNumber,
          guestPhoneNumber: i.creatorPhoneNumber,
        }));

        setAllData(data);
        filterData(data, filters, page, itemsPerPage);

        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityContract, allData, filterData]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
}
