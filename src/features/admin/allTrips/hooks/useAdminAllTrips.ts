import { useRentalityAdmin } from "@/contexts/rentalityContext";
import { AdminTripDetails } from "@/features/admin/allTrips/models/AdminTripDetails";
import { AdminTripStatus, ContractTripFilter, PaymentStatus } from "@/model/blockchain/schemas";
import { emptyContractLocationInfo, validateContractAllTripsDTO } from "@/model/blockchain/schemas_utils";
import { LocationInfo } from "@/model/LocationInfo";
import { mapContractAdminTripDTOToAdminTripDetails } from "@/features/admin/allTrips/models/mappers/contractTripToAdminTripDetails";
import { Err, Ok, Result } from "@/model/utils/result";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { bigIntReplacer } from "@/utils/json";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { useCallback, useState } from "react";
import { logger } from "@/utils/logger";

export type AdminAllTripsFilters = {
  status?: AdminTripStatus;
  paymentStatus?: PaymentStatus;
  location?: LocationInfo;
  startDateTimeUtc?: Date;
  endDateTimeUtc?: Date;
};

const useAdminAllTrips = () => {
  const { admin } = useRentalityAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AdminTripDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState<number>(0);

  const fetchData = useCallback(
    async (
      filters?: AdminAllTripsFilters,
      page: number = 1,
      itemsPerPage: number = 10
    ): Promise<Result<boolean, string>> => {
      if (!admin) {
        logger.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      setIsLoading(true);
      setCurrentPage(page);
      setTotalPageCount(0);
      logger.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

      const contractFilters: ContractTripFilter = {
        status: filters?.status ? filters.status : AdminTripStatus.Any,
        paymentStatus: filters?.paymentStatus ? filters.paymentStatus : PaymentStatus.Any,
        location: filters?.location
          ? mapLocationInfoToContractLocationInfo(filters.location)
          : emptyContractLocationInfo,
        startDateTime: filters?.startDateTimeUtc ? getBlockchainTimeFromDate(filters.startDateTimeUtc) : BigInt(0),
        endDateTime: filters?.endDateTimeUtc ? getBlockchainTimeFromDate(filters.endDateTimeUtc) : BigInt(0),
      };

      const result = await admin.getAllTrips(contractFilters, BigInt(page), BigInt(itemsPerPage));

      if (result.ok) {
        validateContractAllTripsDTO(result.value);

        const data: AdminTripDetails[] = await Promise.all(
          result.value.trips.map(async (adminTripDto) => {
            return mapContractAdminTripDTOToAdminTripDetails(adminTripDto);
          })
        );

        data.sort((a, b) => {
          return b.tripId - a.tripId;
        });

        setData(data);
        setTotalPageCount(Number(result.value.totalPageCount));

        setIsLoading(false);
        return Ok(true);
      } else {
        setIsLoading(false);
        return Err("Get data error. See logs for more details");
      }
    },
    [admin]
  );

  const payToHost = useCallback(
    async (tripId: number): Promise<Result<boolean, string>> => {
      if (!admin) {
        logger.error("payToHost error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      const result = await admin.payToHost(BigInt(tripId));
      if (result.ok) {
        return result;
      } else {
        return Err("Transaction error. See logs for more details");
      }
    },
    [admin]
  );

  const refundToGuest = useCallback(
    async (tripId: number): Promise<Result<boolean, string>> => {
      if (!admin) {
        logger.error("refundToGuest error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      const result = await admin.refundToGuest(BigInt(tripId));
      if (result.ok) {
        return result;
      } else {
        return Err("Transaction error. See logs for more details");
      }
    },
    [admin]
  );

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
    payToHost,
    refundToGuest,
  } as const;
};

export default useAdminAllTrips;
