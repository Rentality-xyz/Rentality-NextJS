import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";

const useStartHosting = () => {
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investId: number) => {
      if (!rentalityContracts) {
        logger.error("startHosting error: rentalityContract is null");
        return Err(new Error("rentalityContract is null"));
      }

      try {
        const result = await rentalityContracts.investment.claimAndCreatePool(investId);

        return result.ok ? result : Err(new Error("startHosting error: " + result.error));
      } catch (error) {
        logger.error("startHosting error: ", error);
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

export default useStartHosting;
