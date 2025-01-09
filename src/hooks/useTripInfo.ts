import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractTripDTO } from "@/model/blockchain/schemas";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { TripInfo } from "@/model/TripInfo";

const useTripInfo = (tripId: bigint) => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);

  const getTrip = async (rentalityContract: IRentalityContract, tripId: bigint) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const tripDTO: ContractTripDTO = await rentalityContract.getTrip(tripId);

      if (tripDTO === null) return;

      const tripInfo = await mapTripDTOtoTripInfo(tripDTO);

      return tripInfo;
    } catch (e) {
      console.error("getTrip error:" + e);
    }
  };

  useEffect(() => {
    if (!rentalityContracts) return;

    getTrip(rentalityContracts.gateway, tripId)
      .then((data) => {
        setTripInfo(data ?? null);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContracts, tripId]);

  return [isLoading, tripInfo] as const;
};

export default useTripInfo;
