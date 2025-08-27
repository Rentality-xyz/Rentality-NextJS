import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateClaimRequest } from "@/model/blockchain/schemas";
import { CreateClaimRequest } from "@/features/claims/models/CreateClaimRequest";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";
import { logger } from "@/utils/logger";
import { saveFilesForClaim } from "@/features/filestore/pinata/utils";

const useCreateClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createClaimRequest: CreateClaimRequest): Promise<Result<boolean, Error>> => {
      if (!ethereumInfo) {
        logger.error("createClaim error: ethereumInfo is null");
        return Err(new Error("ERROR"));
      }

      if (!rentalityContracts) {
        logger.error("createClaim error: rentalityContract is null");
        return Err(new Error("ERROR"));
      }

      if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
        logger.error("createClaim error: user don't have enough funds");
        return Err(new Error("NOT_ENOUGH_FUNDS"));
      }

      try {
        const saveFilesResult = await saveFilesForClaim(
          createClaimRequest.localFileUrls.map((i) => i.file),
          ethereumInfo.chainId,
          createClaimRequest.tripId,
          {
            tripId: createClaimRequest.tripId,
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo?.walletAddress ?? "",
          }
        );

        if (!saveFilesResult.ok) {
          return Err(new Error("ERROR"));
        }

        const claimRequest: ContractCreateClaimRequest = {
          tripId: BigInt(createClaimRequest.tripId),
          claimType: createClaimRequest.claimType,
          description: createClaimRequest.description,
          amountInUsdCents: BigInt(createClaimRequest.amountInUsdCents),
          photosUrl: saveFilesResult.value.urls.join("|"),
        };

        const result = await rentalityContracts.gateway.createClaim(claimRequest, createClaimRequest.toInsurance);

        // const message = encodeClaimChatMessage(createClaimRequest);
        // chatContextInfo.sendMessage(
        //   createClaimRequest.guestAddress,
        //   createClaimRequest.tripId,
        //   message,
        //   "SYSTEM|CLAIM_REQUEST"
        // );
        return result;
      } catch (error) {
        logger.error("createClaim error:" + error);
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

export default useCreateClaim;
