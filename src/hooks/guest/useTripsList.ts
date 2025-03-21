import { useCallback, useEffect, useState } from "react";
import { TripInfoShortDetails } from "@/model/TripInfo";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfoShordDetails } from "@/model/utils/TripDTOtoTripInfo";
import { bigIntReplacer } from "@/utils/json";
import { logger } from "@/utils/logger";

const useTripsList = (isHost: boolean) => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [trips, setTrips] = useState<TripInfoShortDetails[]>([]);

  const refetchData = useCallback(() => {
    setUpdateRequired(true);
  }, []);

  useEffect(() => {
    const getTrips = async (rentalityContracts: IRentalityContracts) => {
      if (!updateRequired) return;
      if (!rentalityContracts) return;

      setUpdateRequired(false);
      setIsLoading(true);

      try {
        if (!rentalityContracts) {
          logger.error("getTrips error: contract is null");
          return;
        }
        const result = await rentalityContracts.gateway.getTripsAs(isHost);
        if (!result.ok) {
          logger.error("getTrips error:" + result.error);
          return;
        }

        logger.info("tripsView", JSON.stringify(result.value, bigIntReplacer, 2));

        if (result.value.length > 0) {
          validateContractTripDTO(result.value[0]);
        }

        const tripsData =
          result.value.length === 0
            ? []
            : result.value.map((tripDto) => {
                return mapTripDTOtoTripInfoShordDetails(tripDto);
              });
        tripsData.sort((a, b) => b.tripId - a.tripId);

        setTrips(tripsData);
      } catch (error) {
        logger.error("getTrips error:" + error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContracts) return;

    getTrips(rentalityContracts);
  }, [updateRequired, rentalityContracts]);

  return { isLoading, trips, refetchData } as const;
};

export default useTripsList;
