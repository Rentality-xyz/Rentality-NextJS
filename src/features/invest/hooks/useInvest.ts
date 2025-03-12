import { useRentality } from "@/contexts/rentalityContext";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";

type InvestRequest = { amount: number; investId: number };

const useInvest = () => {
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  const useMutationResult = useMutation({
    mutationFn: async ({ amount, investId }: InvestRequest) => {
      if (!rentalityContracts) {
        logger.error("invest error: rentalityContract is null");
        return Err(new Error("rentalityContract is null"));
      }

      try {
        const valueInEth = await rentalityContracts.currencyConverter.getFromUsdLatest(
          ETH_DEFAULT_ADDRESS,
          BigInt(amount * 100)
        );

        if (!valueInEth.ok) throw new Error("invest error: Failed to convert currency");

        const result = await rentalityContracts.investment.invest(investId, valueInEth.value[0], {
          value: valueInEth.value[0],
        });

        return result.ok ? result : Err(new Error("invest error: " + result.error));
      } catch (error) {
        logger.error("invest error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [INVESTMENTS_LIST_QUERY_KEY] });
      }
    },
  });

  function isPendingInvesting(investmentId: number) {
    return useMutationResult.isPending && useMutationResult.variables?.investId === investmentId;
  }

  return {
    ...useMutationResult,
    isPendingInvesting,
  } as const;
};

export default useInvest;
