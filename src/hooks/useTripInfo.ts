import { useEffect, useState } from "react";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { TripInfo } from "@/model/TripInfo";
import { logger } from "@/utils/logger";

const useTripInfo = (tripId: bigint) => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);

  const getTrip = async (rentalityContracts: IRentalityContracts, tripId: bigint) => {
    try {
      if (!rentalityContracts) {
        logger.error("getTrip error: contract is null");
        return;
      }
      const result = await rentalityContracts.gateway.getTrip(tripId);

      if (!result.ok || result.value === null) return;

      const tripInfo = await mapTripDTOtoTripInfo(result.value);

      return tripInfo;
    } catch (error) {
      logger.error("getTrip error:" + error);
    }
  };

  useEffect(() => {
    if (!rentalityContracts) return;

    getTrip(rentalityContracts, tripId)
      .then((data) => {
        setTripInfo(data ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContracts, tripId]);

  return [isLoading, tripInfo] as const;
};

export default useTripInfo;
