import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";
import { logger } from "@/utils/logger";
import { formatCurrencyWithSigner } from "@/utils/formatCurrency";
import approve from "@/utils/approveERC20";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";

const usePayClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { claimId: number; currency: string, isAdmin: boolean }): Promise<Result<boolean, Error>> => {
      if (!rentalityContracts || !ethereumInfo) {
        logger.error("payClaim error: Missing required contracts or ethereum info");
        //return Err(new Error("Missing required contracts or ethereum info"));
        return Err(new Error("ERROR"));
      }
      const { claimId, currency } = params;

      try {
        const calculateClaimValueResult = await rentalityContracts.gateway.calculateClaimValue(BigInt(claimId));


        if (!calculateClaimValueResult.ok) {
          return Err(new Error("ERROR"));
        }
        
        if (!params.isAdmin && !(await isUserHasEnoughFunds(
          ethereumInfo.signer, calculateClaimValueResult.value, {
          currency: currency,
          name: 'erc20'
        }))) {
          logger.error("payClaim error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }
        let value = calculateClaimValueResult.value;
        if (!params.isAdmin && currency !== ETH_DEFAULT_ADDRESS) {
          await approve(currency, ethereumInfo.signer, BigInt(calculateClaimValueResult.value));
          value = BigInt(0);
        }
        else if(params.isAdmin) {
          value = BigInt(0)
        }

        const result = await rentalityContracts.gateway.payClaim(BigInt(claimId), {
          value,
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
