import { useCallback, useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractInsuranceInfo, ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { PlatformFile } from "@/model/FileToUpload";
import { bigIntReplacer } from "@/utils/json";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { Err, Ok, Result } from "@/model/utils/result";

const EMPTY_GUEST_GENERAL_INSURANCE = { photo: "" };

const useGuestInsurance = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdateRequired, setIsUpdateRequired] = useState<boolean>(true);
  const [guestInsurance, setGuestInsurance] = useState<GuestGeneralInsurance>(EMPTY_GUEST_GENERAL_INSURANCE);

  const saveGuestInsurance = useCallback(
    async (file: PlatformFile): Promise<Result<boolean, string>> => {
      if (!rentalityContract) {
        console.error("saveGuestInsurance: rentalityContract is null");
        return Err("rentalityContract is null");
      }
      if (!("file" in file) && !file.isDeleted) {
        console.error("Only add new file or delete existing is allowed");
        return Err("Only add new file or delete existing is allowed");
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

        console.debug("insuranceInfo", JSON.stringify(insuranceInfo, bigIntReplacer, 2));
        const transaction = await rentalityContract.saveGuestInsurance(insuranceInfo);
        await transaction.wait();
        setIsUpdateRequired(true);
        return Ok(true);
      } catch (e) {
        console.error("saveGuestInsurance error:" + e);
        return Err("saveGuestInsurance error:" + e);
      }
    },
    [ethereumInfo, rentalityContract]
  );

  useEffect(() => {
    const fetchGuestInsurance = async () => {
      if (!rentalityContract) return;
      if (!isUpdateRequired) return;

      setIsLoading(true);

      try {
        const insurancesView: ContractInsuranceInfo[] = await rentalityContract.getMyInsurancesAsGuest();

        if (
          insurancesView.length === 0 ||
          insurancesView[insurancesView.length - 1].insuranceType !== InsuranceType.General
        )
          return;

        setGuestInsurance({ photo: getIpfsURI(insurancesView[insurancesView.length - 1].photo) });
      } catch (e) {
        console.error("fetchGuestInsurance error:" + e);
        return;
      } finally {
        setIsLoading(false);
        setIsUpdateRequired(false);
      }
    };

    fetchGuestInsurance();
  }, [rentalityContract, isUpdateRequired]);

  return {
    isLoading,
    guestInsurance,
    saveGuestInsurance,
  } as const;
};

export default useGuestInsurance;
