import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";

type ChangeInvestmentListingStatusRequest = {
  investId: number;
};

const useChangeInvestmentListingStatus = () => {
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ investId }: ChangeInvestmentListingStatusRequest) => {
      if (!rentalityContracts) {
        logger.error("useChangeInvestmentListingStatus error: Missing required contracts or ethereum info");
        return Err(new Error("Missing required contracts or ethereum info"));
      }
      try {
        const result = await rentalityContracts.investment.changeListingStatus(BigInt(investId));

        return result.ok ? result : Err(new Error("useChangeInvestmentListingStatus error: " + result.error));
      } catch (error) {
        logger.error("useChangeInvestmentListingStatus error: ", error);
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

export default useChangeInvestmentListingStatus;
