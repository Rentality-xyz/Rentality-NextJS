import { useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateClaimRequest } from "@/model/blockchain/schemas";
import { CreateClaimRequest } from "@/features/claims/models/CreateClaimRequest";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { FileToUpload } from "@/model/FileToUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLAIMS_LIST_QUERY_KEY } from "./useFetchClaims";

const useCreateClaim = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createClaimRequest: CreateClaimRequest): Promise<Result<boolean, Error>> => {
      if (!ethereumInfo) {
        console.error("createClaim error: ethereumInfo is null");
        return Err(new Error("ERROR"));
      }

      if (!rentalityContracts) {
        console.error("createClaim error: rentalityContract is null");
        return Err(new Error("ERROR"));
      }

      if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
        console.error("createClaim error: user don't have enough funds");
        return Err(new Error("NOT_ENOUGH_FUNDS"));
      }

      try {
        const savedFiles = await saveClaimFiles(createClaimRequest.localFileUrls, ethereumInfo);

        const claimRequest: ContractCreateClaimRequest = {
          tripId: BigInt(createClaimRequest.tripId),
          claimType: createClaimRequest.claimType,
          description: createClaimRequest.description,
          amountInUsdCents: BigInt(createClaimRequest.amountInUsdCents),
          photosUrl: savedFiles.join("|"),
        };

        const result = await rentalityContracts.gateway.createClaim(claimRequest);

        // const message = encodeClaimChatMessage(createClaimRequest);
        // chatContextInfo.sendMessage(
        //   createClaimRequest.guestAddress,
        //   createClaimRequest.tripId,
        //   message,
        //   "SYSTEM|CLAIM_REQUEST"
        // );
        return result;
      } catch (e) {
        console.error("createClaim error:" + e);
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

async function saveClaimFiles(filesToSave: FileToUpload[], ethereumInfo: EthereumInfo): Promise<string[]> {
  filesToSave = filesToSave.filter((i) => i);

  const savedFiles: string[] = [];

  if (filesToSave.length > 0) {
    for (const file of filesToSave) {
      const response = await uploadFileToIPFS(file.file, "RentalityClaimFile", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo?.walletAddress ?? "",
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId ?? 0,
      });

      if (!response.success || !response.pinataURL) {
        throw new Error("Uploaded image to Pinata error");
      }
      savedFiles.push(response.pinataURL);
    }
  }
  return savedFiles;
}

export default useCreateClaim;
