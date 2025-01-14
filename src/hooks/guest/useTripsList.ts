import { useCallback, useEffect, useState } from "react";
import { TripInfoShortDetails } from "@/model/TripInfo";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractTripDTO } from "@/model/blockchain/schemas";
import { validateContractTripDTO } from "@/model/blockchain/schemas_utils";
import { mapTripDTOtoTripInfoShordDetails } from "@/model/utils/TripDTOtoTripInfo";
import { bigIntReplacer } from "@/utils/json";

const useTripsList = (isHost: boolean) => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateRequired, setUpdateRequired] = useState<boolean>(true);
  const [trips, setTrips] = useState<TripInfoShortDetails[]>([]);

  const refetchData = useCallback(() => {
    setUpdateRequired(true);
  }, []);

  useEffect(() => {
    const getTrips = async (rentalityContract: IRentalityContract) => {
      if (!updateRequired) return;
      if (!rentalityContract) return;

      setUpdateRequired(false);
      setIsLoading(true);

      try {
        if (rentalityContract == null) {
          console.error("getTrips error: contract is null");
          return;
        }
        const tripsView: ContractTripDTO[] = await rentalityContract.getTripsAs(isHost);

        console.log("tripsView", JSON.stringify(tripsView, bigIntReplacer, 2));

        const tripsData =
          tripsView.length === 0
            ? []
            : await Promise.all(
                tripsView.map(async (i: ContractTripDTO, index) => {
                  if (index === 0) {
                    validateContractTripDTO(i);
                  }

                  return mapTripDTOtoTripInfoShordDetails(i);
                })
              );
        setTrips(tripsData);
      } catch (e) {
        console.error("getTrips error:" + e);
      } finally {
        setIsLoading(false);
      }
    };

    if (!updateRequired) return;
    if (!rentalityContracts) return;

    getTrips(rentalityContracts.gateway);
  }, [updateRequired, rentalityContracts]);

  return { isLoading, trips, refetchData } as const;
};

export default useTripsList;
