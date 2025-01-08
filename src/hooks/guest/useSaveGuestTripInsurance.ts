import { useCallback, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { Err, Ok, Result } from "@/model/utils/result";
import { PlatformFile } from "@/model/FileToUpload";
import { GENERAL_INSURANCE_TYPE_ID, ONE_TIME_INSURANCE_TYPE_ID } from "@/utils/constants";
import { InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";

const useSaveGuestTripInsurance = () => {
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

      switch (insuranceType) {
        case GENERAL_INSURANCE_TYPE_ID:
          if (photos === undefined) return Err("photos is undefined");

          try {
            let photoUrl = "";
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

            const transaction = await rentalityContract.saveGuestInsurance({
              insuranceType: InsuranceType.General,
              photo: photoUrl,
              companyName: "",
              policyNumber: "",
              comment: comment ?? "",
            });
            await transaction.wait();
            return Ok(true);
          } catch (e) {
            return Err(`saveTripInsurance error: ${e}`);
          }
        case ONE_TIME_INSURANCE_TYPE_ID:
          if (tripId === undefined) return Err("tripId is undefined");
          if (companyName === undefined) return Err("companyName is undefined");
          if (policeNumber === undefined) return Err("policeNumber is undefined");

          try {
            const transaction = await rentalityContract.saveTripInsuranceInfo(BigInt(tripId), {
              insuranceType: InsuranceType.OneTime,
              photo: "",
              companyName: companyName,
              policyNumber: policeNumber,
              comment: comment ?? "",
            });
            await transaction.wait();
            return Ok(true);
          } catch (e) {
            return Err(`saveTripInsurance error: ${e}`);
          }
        default:
          return Err("insuranceType is incorrect");
      }
    },
    [rentalityContract, ethereumInfo]
  );

  return { isLoading, saveTripInsurance } as const;
};

export default useSaveGuestTripInsurance;
