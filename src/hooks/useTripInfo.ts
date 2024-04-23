import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractTripDTO } from "@/model/blockchain/schemas";
import { mapTripDTOtoTripInfo } from "@/model/utils/TripDTOtoTripInfo";
import { TripInfo } from "@/model/TripInfo";

const useTripInfo = (tripId: bigint) => {
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [tripInfo, setTripInfo] = useState<TripInfo>({});

  const getTrip = async (rentalityContract: IRentalityContract, tripId: bigint) => {
    try {
      if (rentalityContract == null) {
        console.error("getTrip error: contract is null");
        return;
      }
      const tripDTO: ContractTripDTO = await rentalityContract.getTrip(tripId);

      if (tripDTO === null) return;

      const tripContactInfo = await rentalityContract.getTripContactInfo(tripDTO.trip.carId);
      const tripInfo = await mapTripDTOtoTripInfo(tripDTO, tripContactInfo);

      return tripInfo;
    } catch (e) {
      console.error("getTrip error:" + e);
    }
  };

  useEffect(() => {
    if (!rentalityContract) return;

    getTrip(rentalityContract, tripId)
      .then((data) => {
        setTripInfo(data ?? {});
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [rentalityContract, tripId]);

  return [isLoading, tripInfo] as const;
};

export default useTripInfo;
