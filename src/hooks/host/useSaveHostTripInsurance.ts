import { useCallback, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { PlatformFile } from "@/model/FileToUpload";
import { GENERAL_INSURANCE_TYPE_ID, ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";

const useSaveHostTripInsurance = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveTripInsurance = useCallback(
    async (
      insuranceType: string,
      photos?: PlatformFile,
      tripId?: number,
      companyName?: string,
      policeNumber?: string,
      comment?: string
    ): Promise<Result<boolean, string>> => {
      if (!ethereumInfo) {
        return Err("ethereumInfo is null");
      }
      if (!rentalityContract) {
        return Err("rentalityContract is null");
      }
      if (tripId === undefined) return Err("tripId is undefined");

      let contractSaveInsuranceRequest: ContractSaveInsuranceRequest;

      switch (insuranceType) {
        case GENERAL_INSURANCE_TYPE_ID:
          if (photos === undefined) return Err("photos is undefined");

          let photoUrl = "";
          try {
            if ("file" in photos) {
              const response = await uploadFileToIPFS(photos.file, "RentalityGuestInsurance", {
                createdAt: new Date().toISOString(),
                createdBy: ethereumInfo?.walletAddress ?? "",
                version: SMARTCONTRACT_VERSION,
                chainId: ethereumInfo?.chainId ?? 0,
              });

              if (!response.success || !response.pinataURL) {
                return Err(`saveTripInsurance save photo error`);
              }
              photoUrl = response.pinataURL;
            }
          } catch (e) {
            return Err(`saveTripInsurance error: ${e}`);
          }

          contractSaveInsuranceRequest = {
            insuranceType: InsuranceType.General,
            photo: photoUrl,
            companyName: "",
            policyNumber: "",
            comment: comment ?? "",
          };
          break;
        case ONE_TIME_INSURANCE_TYPE_ID:
          if (companyName === undefined) return Err("companyName is undefined");
          if (policeNumber === undefined) return Err("policeNumber is undefined");

          contractSaveInsuranceRequest = {
            insuranceType: InsuranceType.OneTime,
            photo: "",
            companyName: companyName,
            policyNumber: policeNumber,
            comment: comment ?? "",
          };
          break;
        default:
          return Err("insuranceType is incorrect");
      }

      try {
        const transaction = await rentalityContract.saveTripInsuranceInfo(BigInt(tripId), contractSaveInsuranceRequest);
        await transaction.wait();
        return Ok(true);
      } catch (e) {
        return Err(`saveTripInsurance error: ${e}`);
      }
    },
    [rentalityContract, ethereumInfo]
  );

  return { isLoading, saveTripInsurance } as const;
};

export default useSaveHostTripInsurance;
