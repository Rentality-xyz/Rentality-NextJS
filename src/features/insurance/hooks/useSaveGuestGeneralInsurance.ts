import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { PlatformFile } from "@/model/FileToUpload";
import { bigIntReplacer } from "@/utils/json";
import { Err, Result } from "@/model/utils/result";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INSURANCE_GUEST_QUERY_KEY } from "./useFetchGuestGeneralInsurance";
import { INSURANCE_LIST_QUERY_KEY } from "./useFetchInsurances";
import { logger } from "@/utils/logger";

const useSaveGuestGeneralInsurance = () => {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: PlatformFile): Promise<Result<boolean, Error>> => {
      if (!rentalityContracts) {
        logger.error("saveGuestInsurance: rentalityContract is null");
        return Err(new Error("rentalityContract is null"));
      }
      if (!("file" in file) && !file.isDeleted) {
        logger.error("Only add new file or delete existing is allowed");
        return Err(new Error("Only add new file or delete existing is allowed"));
      }

      let insuranceInfo: ContractSaveInsuranceRequest;

      try {
        if ("file" in file) {
          const response = await uploadFileToIPFS(file.file, "RentalityGuestInsurance", {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo?.walletAddress ?? "",
            version: SMARTCONTRACT_VERSION,
            chainId: ethereumInfo?.chainId ?? 0,
          });

          if (!response.success || !response.pinataURL) {
            throw new Error("Uploaded image to Pinata error");
          }
          insuranceInfo = {
            companyName: "",
            policyNumber: "",
            photo: response.pinataURL,
            comment: "",
            insuranceType: InsuranceType.General,
          };
        } else {
          insuranceInfo = {
            companyName: "",
            policyNumber: "",
            photo: "",
            comment: "",
            insuranceType: InsuranceType.None,
          };
        }

        const result = await rentalityContracts.gateway.saveGuestInsurance(insuranceInfo);

        return result.ok ? result : Err(new Error("saveGuestInsurance error: " + result.error));
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
};

export default useSaveGuestGeneralInsurance;
