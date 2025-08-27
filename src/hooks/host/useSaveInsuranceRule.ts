import { useRentality } from "@/contexts/rentalityContext";
import { Err, Result } from "@/model/utils/result";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logger } from "@/utils/logger";
import { ALL_INSURANCE_RULES_QUERY_KEY, InsuranceRule } from "@/hooks/host/useFetchAllInsuranceRules";

function useSaveInsuranceRule() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newValue: InsuranceRule): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          logger.error("saveInsuranceRule error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          logger.error("saveInsuranceRule error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        return await rentalityContracts.gateway.setHostInsurance(newValue.insuranceId);
      } catch (error) {
        logger.error("saveInsuranceRule error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [ALL_INSURANCE_RULES_QUERY_KEY] });
      }
    },
  });
}

export default useSaveInsuranceRule;
