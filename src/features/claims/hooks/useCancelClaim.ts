import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";

const useCancelClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claimId: number): Promise<Result<boolean, TransactionErrorCode>> => {
      if (!rentalityContracts || !ethereumInfo) {
        console.error("payClaim error: Missing required contracts or ethereum info");
        //return Err(new Error("Missing required contracts or ethereum info"));
        return Err("ERROR");
      }

      if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
        console.error("cancelClaim error: user don't have enough funds");
        return Err("NOT_ENOUGH_FUNDS");
      }

      try {
        const result = await rentalityContracts.gatewayProxy.rejectClaim(BigInt(claimId));

        if (!result.ok) {
          return Err("ERROR");
        }
        return Ok(true);
      } catch (e) {
        console.error("cancelClaim error:" + e);
        return Err("ERROR");
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
