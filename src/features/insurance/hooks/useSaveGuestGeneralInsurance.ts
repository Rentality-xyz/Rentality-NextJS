import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { PlatformFile } from "@/model/FileToUpload";
import { Err, Result } from "@/model/utils/result";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INSURANCE_GUEST_QUERY_KEY } from "./useFetchGuestGeneralInsurance";
import { INSURANCE_LIST_QUERY_KEY } from "./useFetchInsurances";
import { logger } from "@/utils/logger";
import { deleteFileByUrl, saveGeneralInsurancePhoto } from "@/features/filestore";
import { isEmpty } from "@/utils/string";

function useSaveGuestGeneralInsurance() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: PlatformFile): Promise<Result<boolean>> => {
      if (!rentalityContracts || !ethereumInfo) {
        logger.error("saveGuestInsurance error: Missing required contracts or ethereum info");
        return Err(new Error("Missing required contracts or ethereum info"));
      }
      if (!("file" in file) && !file.isDeleted) {
        logger.error("Only add new file or delete existing is allowed");
        return Err(new Error("Only add new file or delete existing is allowed"));
      }

      try {
        if ("isDeleted" in file && file.isDeleted) {
          const insuranceInfo: ContractSaveInsuranceRequest = {
            companyName: "",
            policyNumber: "",
            photo: "",
            comment: "",
            insuranceType: InsuranceType.None,
          };

          const result = await rentalityContracts.gateway.saveGuestInsurance(insuranceInfo);

          if (result.ok) {
            await deleteFileByUrl(file.url);
          }

          return result;
        } else if ("file" in file) {
          const uploadResult = await saveGeneralInsurancePhoto(file.file, ethereumInfo.chainId, {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo.walletAddress,
          });

          if (!uploadResult.ok) return uploadResult;

          const insuranceInfo: ContractSaveInsuranceRequest = {
            companyName: "",
            policyNumber: "",
            photo: uploadResult.value.url,
            comment: "",
            insuranceType: InsuranceType.General,
          };

          const result = await rentalityContracts.gateway.saveGuestInsurance(insuranceInfo);

          if (!result.ok) {
            await deleteFileByUrl(uploadResult.value.url);
          } else if (file.oldUrl !== undefined && !isEmpty(file.oldUrl)) {
            await deleteFileByUrl(file.oldUrl);
          }

          return result;
        }
        return Err(new Error("Only add new file or delete existing is allowed"));
      } catch (error) {
        logger.error("saveGuestInsurance error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [INSURANCE_GUEST_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [INSURANCE_LIST_QUERY_KEY] });
      }
    },
  });
}

export default useSaveGuestGeneralInsurance;
