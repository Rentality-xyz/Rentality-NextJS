import { getEtherContractWithSigner } from "@/abis";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { AdminTripDetails } from "@/model/admin/AdminTripDetails";
import { IRentalityAdminGateway } from "@/model/blockchain/IRentalityContract";
import { AdminTripStatus, ContractTripFilter, PaymentStatus } from "@/model/blockchain/schemas";
import { emptyContractLocationInfo, validateContractAllTripsDTO } from "@/model/blockchain/schemas_utils";
import { LocationInfo } from "@/model/LocationInfo";
import { mapContractTripToAdminTripDetails } from "@/model/mappers/contractTripToAdminTripDetails";
import { Err, Ok, Result } from "@/model/utils/result";
import { getBlockchainTimeFromDate } from "@/utils/formInput";
import { bigIntReplacer } from "@/utils/json";
import { mapContractLocationInfoToLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { useCallback, useEffect, useRef, useState } from "react";

export type AdminAllTripsFilters = {
  status?: AdminTripStatus;
  paymentStatus?: PaymentStatus;
  location?: LocationInfo;
  startDateTimeUtc?: Date;
  endDateTimeUtc?: Date;
};

const useAdminAllTrips = () => {
  const ethereumInfo = useEthereum();
  const [rentalityAdminGateway, setRentalityAdminGateway] = useState<IRentalityAdminGateway | undefined>(undefined);
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
      if (!rentalityAdminGateway) {
        console.error("fetchData error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);
        setCurrentPage(page);
        setTotalPageCount(0);
        console.debug(`filters: ${JSON.stringify(filters, bigIntReplacer)}`);

        const contractFilters: ContractTripFilter = {
          status: filters?.status ? filters.status : AdminTripStatus.Any,
          paymentStatus: filters?.paymentStatus ? filters.paymentStatus : PaymentStatus.Any,
          location: filters?.location
            ? mapLocationInfoToContractLocationInfo(filters.location)
            : emptyContractLocationInfo,
          startDateTime: filters?.startDateTimeUtc ? getBlockchainTimeFromDate(filters.startDateTimeUtc) : BigInt(0),
          endDateTime: filters?.endDateTimeUtc ? getBlockchainTimeFromDate(filters.endDateTimeUtc) : BigInt(0),
        };

        const allAdminTrips = await rentalityAdminGateway.getAllTrips(
          contractFilters,
          BigInt(page),
          BigInt(itemsPerPage)
        );
        validateContractAllTripsDTO(allAdminTrips);

        const data: AdminTripDetails[] = await Promise.all(
          allAdminTrips.trips.map(async (adminTripDto) => {
            return mapContractTripToAdminTripDetails(
              adminTripDto.trip,
              mapContractLocationInfoToLocationInfo(adminTripDto.carLocation),
              adminTripDto.carMetadataURI
            );
          })
        );

        setData(data);
        setTotalPageCount(Number(allAdminTrips.totalPageCount));

        return Ok(true);
      } catch (e) {
        console.error("fetchData error" + e);
        return Err("Get data error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityAdminGateway]
  );

  const payToHost = useCallback(
    async (tripId: number): Promise<Result<boolean, string>> => {
      if (!rentalityAdminGateway) {
        console.error("payToHost error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);

        let transaction = await rentalityAdminGateway.payToHost(BigInt(tripId));
        await transaction.wait();
        return Ok(true);
      } catch (e) {
        console.error("payToHost error" + e);
        return Err("Transaction error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityAdminGateway]
  );

  const refundToGuest = useCallback(
    async (tripId: number): Promise<Result<boolean, string>> => {
      if (!rentalityAdminGateway) {
        console.error("refundToGuest error: rentalityAdminGateway is null");
        return Err("Contract is not initialized");
      }

      try {
        setIsLoading(true);

        let transaction = await rentalityAdminGateway.refundToGuest(BigInt(tripId));
        await transaction.wait();
        return Ok(true);
      } catch (e) {
        console.error("refundToGuest error" + e);
        return Err("Transaction error. See logs for more details");
      } finally {
        setIsLoading(false);
      }
    },
    [rentalityAdminGateway]
  );

  const isIniialized = useRef<boolean>(false);

  useEffect(() => {
    const initialize = async () => {
      if (!ethereumInfo) return;
      if (isIniialized.current) return;

      try {
        isIniialized.current = true;

        const rentalityAdminGateway = (await getEtherContractWithSigner(
          "admin",
          ethereumInfo.signer
        )) as unknown as IRentalityAdminGateway;
        setRentalityAdminGateway(rentalityAdminGateway);
      } catch (e) {
        console.error("initialize error" + e);
        isIniialized.current = false;
      }
    };

    initialize();
  }, [ethereumInfo]);

  return {
    isLoading,
    data: { data: data, currentPage: currentPage, totalPageCount: totalPageCount },
    fetchData,
    payToHost,
    refundToGuest,
  } as const;
};

export default useAdminAllTrips;
