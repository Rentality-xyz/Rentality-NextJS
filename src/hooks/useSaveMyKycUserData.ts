import { useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractCivicKYCInfo } from "@/model/blockchain/schemas";
import { Err, Ok, Result } from "@/model/utils/result";
import { getBlockchainTimeFromDate } from "@/utils/formInput";

const useSaveMyKycUserData = () => {
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function saveMyKycUserData(
    fullName: string,
    licenseNumber: string,
    expirationDate: Date,
    issueCountry: string,
    email: string
  ): Promise<Result<boolean, string>> {
    if (!rentalityContracts) {
      console.error("saveProfileSettings error: rentalityContract is null");
      return Err("rentalityContract is null");
    }

    setIsLoading(true);
    try {
      const myCivicKYCInfo: ContractCivicKYCInfo = {
        fullName: fullName,
        licenseNumber: licenseNumber,
        expirationDate: getBlockchainTimeFromDate(expirationDate),
        issueCountry: issueCountry,
        email: email,
      };
      const result = await rentalityContracts.gatewayProxy.setMyCivicKYCInfo(myCivicKYCInfo);

      if (!result.ok) {
        console.error("save MyKycUserData error:" + result.error);
        return Err("save MyKycUserData error:" + result.error);
      }
      return Ok(true);
    } catch (e) {
      console.error("save MyKycUserData error:" + e);
      return Err("save MyKycUserData error:" + e);
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, saveMyKycUserData } as const;
};

export default useSaveMyKycUserData;
