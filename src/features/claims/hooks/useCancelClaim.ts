import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";
import { logger } from "@/utils/logger";

const useCancelClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: number): Promise<Result<boolean, Error>> => {
      if (!rentalityContracts || !ethereumInfo) {
        logger.error("payClaim error: Missing required contracts or ethereum info");
        //return Err(new Error("Missing required contracts or ethereum info"));
        return Err(new Error("ERROR"));
      }

      if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
        logger.error("cancelClaim error: user don't have enough funds");
        return Err(new Error("NOT_ENOUGH_FUNDS"));
      }

      try {
        const result = await rentalityContracts.gateway.rejectClaim(BigInt(claimId));
        return result;
      } catch (error) {
        logger.error("cancelClaim error:" + error);
        return Err(new Error("ERROR"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [CLAIMS_LIST_QUERY_KEY] });
      }
    },
  });
};

export default useCancelClaim;
