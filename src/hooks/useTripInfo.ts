import { useEffect, useState } from "react";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { TripInfo } from "@/model/TripInfo";

const useTripInfo = (tripId: bigint) => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);

  const getTrip = async (rentalityContracts: IRentalityContracts, tripId: bigint) => {
    try {
      if (!rentalityContracts) {
        console.error("getTrip error: contract is null");
        return;
      }
      const result = await rentalityContracts.gatewayProxy.getTrip(tripId);

      if (!result.ok || result.value === null) return;

      const tripInfo = await mapTripDTOtoTripInfo(result.value);

      return tripInfo;
    } catch (e) {
      console.error("getTrip error:" + e);
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
