import { useCallback, useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractInsuranceInfo, ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { PlatformFile } from "@/model/FileToUpload";
import { bigIntReplacer } from "@/utils/json";
import { getIpfsURI } from "@/utils/ipfsUtils";
import { Err, Ok, Result } from "@/model/utils/result";

const useGuestInsurance = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [isUpdateRequired, setIsUpdateRequired] = useState<Boolean>(true);
  const [guestInsurance, setGuestInsurance] = useState<GuestGeneralInsurance>({ photo: "" });

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
    const getGuestInsurance = async (rentalityContract: IRentalityContract): Promise<GuestGeneralInsurance> => {
      try {
        if (rentalityContract == null) {
          console.error("getGuestInsurance error: contract is null");
          return { photo: "" };
        }
        const insurancesView: ContractInsuranceInfo[] = await rentalityContract.getMyInsurancesAsGuest();

        const generalInsurances = insurancesView.filter((i) => i.insuranceType === InsuranceType.General);
        if (generalInsurances.length === 0) return { photo: "" };

        generalInsurances.sort((a, b) => {
          return Number(b.createdTime - a.createdTime);
        });
        return { photo: getIpfsURI(generalInsurances[generalInsurances.length - 1].photo) };
      } catch (e) {
        console.error("getGuestInsurance error:" + e);
        return { photo: "" };
      }
    };

    if (!rentalityContract) return;
    if (!isUpdateRequired) return;

    setIsLoading(true);

    getGuestInsurance(rentalityContract)
      .then((data) => {
        setGuestInsurance(data);
      })
      .finally(() => {
        setIsLoading(false);
        setIsUpdateRequired(false);
      });
  }, [rentalityContract, isUpdateRequired]);

  return {
    isLoading,
    guestInsurance,
    saveGuestInsurance,
  } as const;
};

export default useGuestInsurance;
