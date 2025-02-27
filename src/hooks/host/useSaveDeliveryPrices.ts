import { useRentality } from "@/contexts/rentalityContext";
import { Err, Result } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELIVERY_PRICES_QUERY_KEY, DeliveryPrices } from "./useFetchDeliveryPrices";

function useSaveDeliveryPrices() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: DeliveryPrices): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          console.error("saveDeliveryPrices error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          console.error("saveDeliveryPrices error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.addUserDeliveryPrices(
          BigInt(newValue.from1To25milesPrice * 100),
          BigInt(newValue.over25MilesPrice * 100)
        );

        return result;
      } catch (error) {
        console.error("saveDeliveryPrices error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [DELIVERY_PRICES_QUERY_KEY] });
      }
    },
  });
}

export default useSaveDeliveryPrices;
