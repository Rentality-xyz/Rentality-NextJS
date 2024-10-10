import { useEffect, useState } from "react";
import { useRentality } from "@/contexts/rentalityContext";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractInsuranceDTO, ContractSaveInsuranceRequest, InsuranceType } from "@/model/blockchain/schemas";
import { uploadFileToIPFS } from "@/utils/pinata";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { GuestGeneralInsurance } from "@/model/GuestInsurance";
import { FileToUpload } from "@/model/FileToUpload";
import { bigIntReplacer } from "@/utils/json";

const useGuestInsurance = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [guestInsurance, setGuestInsurance] = useState<GuestGeneralInsurance>({ photo: "" });

  const saveGuestInsurance = async (file: FileToUpload) => {
    if (rentalityContract === null) {
      console.error("saveGuestInsurance: rentalityContract is null");
      return false;
    }

    try {
      const response = await uploadFileToIPFS(file.file, "RentalityGuestInsurance", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo?.walletAddress ?? "",
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId ?? 0,
      });

      if (!response.success || !response.pinataURL) {
        throw new Error("Uploaded image to Pinata error");
      }

      const insuranceInfo: ContractSaveInsuranceRequest = {
        companyName: "",
        policyNumber: "",
        photo: response.pinataURL,
        comment: "",
        insuranceType: InsuranceType.General,
      };

      console.log("insuranceInfo", JSON.stringify(insuranceInfo, bigIntReplacer, 2));
      const transaction = await rentalityContract.saveGuestInsurance(insuranceInfo);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("saveGuestInsurance error:" + e);
      return false;
    }
  };

  useEffect(() => {
    const getGuestInsurance = async (rentalityContract: IRentalityContract): Promise<GuestGeneralInsurance> => {
      try {
        if (rentalityContract == null) {
          console.error("getGuestInsurance error: contract is null");
          return { photo: "" };
        }
        const insurancesView: ContractInsuranceDTO[] = await rentalityContract.getInsurancesBy(false);
        console.log("getInsurancesBy", JSON.stringify(insurancesView, bigIntReplacer, 2));

        const insurancesView1 = await rentalityContract.getMyInsurancesAsGuest();
        console.log("getMyInsurancesAsGuest", JSON.stringify(insurancesView1, bigIntReplacer, 2));

        const generalInsurances = insurancesView.filter((i) => i.insuranceInfo.insuranceType === InsuranceType.General);
        if (generalInsurances.length === 0) return { photo: "" };

        generalInsurances.sort((a, b) => {
          return Number(b.insuranceInfo.createdTime - a.insuranceInfo.createdTime);
        });
        return { photo: generalInsurances[generalInsurances.length - 1].insuranceInfo.photo };
      } catch (e) {
        console.error("getGuestInsurance error:" + e);
        return { photo: "" };
      }
    };

    if (!rentalityContract) return;

    setIsLoading(true);

    getGuestInsurance(rentalityContract)
      .then((data) => {
        setGuestInsurance(data);
      })
      .finally(() => setIsLoading(false));
  }, [rentalityContract]);

  return {
    isLoading,
    guestInsurance,
    saveGuestInsurance,
  } as const;
};

export default useGuestInsurance;
