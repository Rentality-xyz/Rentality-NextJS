import { useRentality } from "@/contexts/rentalityContext";
import { Err, Result } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TripDiscounts, TRIP_DISCOUNTS_QUERY_KEY } from "./useFetchTripDiscounts";

function useSaveTripDiscounts() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: TripDiscounts): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          console.error("saveTripDiscounts error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          console.error("saveTripDiscounts error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.addUserDiscount({
          threeDaysDiscount: BigInt(newValue.discount3DaysAndMoreInPercents * 10_000),
          sevenDaysDiscount: BigInt(newValue.discount7DaysAndMoreInPercents * 10_000),
          thirtyDaysDiscount: BigInt(newValue.discount30DaysAndMoreInPercents * 10_000),
          initialized: true,
        });

        return result;
      } catch (error) {
        console.error("saveTripDiscounts error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [TRIP_DISCOUNTS_QUERY_KEY] });
      }
    },
  });
}

export default useSaveTripDiscounts;
