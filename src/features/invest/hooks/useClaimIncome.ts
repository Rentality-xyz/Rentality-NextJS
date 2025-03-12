import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";

const useClaimIncome = () => {
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investId: number) => {
      if (!rentalityContracts) {
        logger.error("claimIncome error: rentalityContract is null");
        return Err(new Error("rentalityContract is null"));
      }

      try {
        const result = await rentalityContracts.investment.claimAllMy(investId);

        return result.ok ? result : Err(new Error("claimIncome error: " + result.error));
      } catch (error) {
        logger.error("claimIncome error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [INVESTMENTS_LIST_QUERY_KEY] });
      }
    },
  });
};

export default useClaimIncome;
