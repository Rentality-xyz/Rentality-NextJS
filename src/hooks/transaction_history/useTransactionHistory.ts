import { useCallback, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { TripStatus } from "@/model/blockchain/schemas";
import { TransactionHistoryInfo } from "@/model/TransactionHistoryInfo";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { Err, Ok, Result } from "@/model/utils/result";
import { bigIntReplacer } from "@/utils/json";
import { mapContractTripDTOToTransactionHistoryInfo } from "@/model/mappers/contractTripDTOToTransactionHistoryInfo";

export type TransactionHistoryFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  status?: TripStatus;
};

const useTransactionHistory = (isHost: boolean) => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<TransactionHistoryInfo[]>([]);
  const [allData, setAllData] = useState<TransactionHistoryInfo[] | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const filterData = useCallback(
    (
      data: TransactionHistoryInfo[],
      filters?: TransactionHistoryFilters,
      page: number = 1,
      itemsPerPage: number = 10
    ) => {
      const filteredData = !filters
        ? data
        : data.filter(
            (i) =>
              (filters.dateFrom === undefined || i.startDateTime >= filters.dateFrom) &&
              (filters.dateTo === undefined || i.endDateTime <= filters.dateTo) &&
              (filters.status === undefined || i.status === filters.status)
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
      filters?: TransactionHistoryFilters,
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

        const tripInfos = await rentalityContract.getTripsAs(isHost);

        if (tripInfos && tripInfos.length > 0) {
          validateContractTripDTO(tripInfos[0]);
        }

        const data: TransactionHistoryInfo[] = await Promise.all(
          tripInfos.map(async (tripDto) => {
            return mapContractTripDTOToTransactionHistoryInfo(tripDto);
          })
        );

        data.sort((a, b) => {
          return b.startDateTime.getTime() - a.startDateTime.getTime();
        });
        console.log("data", JSON.stringify(data, bigIntReplacer, 2));

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
    [rentalityContract, isHost, allData, filterData]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
  } as const;
};

export default useTransactionHistory;
