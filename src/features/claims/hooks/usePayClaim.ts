import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";
import { logger } from "@/utils/logger";

const usePayClaim = () => {
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

      try {
        const calculateClaimValueResult = await rentalityContracts.gateway.calculateClaimValue(BigInt(claimId));

        if (!calculateClaimValueResult.ok) {
          return Err(new Error("ERROR"));
        }

        const claimAmountInEth = Number(formatEther(calculateClaimValueResult.value));

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer, claimAmountInEth))) {
          logger.error("payClaim error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const result = await rentalityContracts.gateway.payClaim(BigInt(claimId), {
          value: calculateClaimValueResult.value,
        });

        return result;
      } catch (error) {
        logger.error("payClaim error:" + error);
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

export default usePayClaim;
