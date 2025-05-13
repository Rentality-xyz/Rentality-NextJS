import { useRentality } from "@/contexts/rentalityContext";
import { Err, Result } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELIVERY_PRICES_QUERY_KEY, DeliveryPrices } from "./useFetchDeliveryPrices";
import { logger } from "@/utils/logger";
import { AvailableCurrency } from "./useFetchAvailableCurrencies";

function useSaveUserCurrency() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: AvailableCurrency): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          logger.error("saveCurrency error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          logger.error("saveCurrency error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.addUserCurrency(newValue.currency);

        return result;
      } catch (error) {
        logger.error("saveCurrency error: ", error);
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

export default useSaveUserCurrency;
