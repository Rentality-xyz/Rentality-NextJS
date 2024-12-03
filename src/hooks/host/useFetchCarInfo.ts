import { Signer } from "ethers";
import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { HostCarInfo, emptyHostCarInfo } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCarDetails, ContractCarInfo, ContractCarInfoWithInsurance } from "@/model/blockchain/schemas";
import { bigIntReplacer } from "@/utils/json";
import { mapContractCarToCarDetails } from "@/model/mappers/contractCarToCarDetails";

const useFetchCarInfo = (carId: number) => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hostCarInfo, setHostCarInfo] = useState<HostCarInfo>(emptyHostCarInfo);

  useEffect(() => {
    const getCarInfo = async (rentalityContract: IRentalityContract, signer: Signer) => {
      if (rentalityContract == null) {
        console.error("getCarInfo error: contract is null");
        return;
      }

      try {
        const carInfo: ContractCarInfoWithInsurance = await rentalityContract.getCarInfoById(BigInt(carId));
        const carInfoDetails: ContractCarDetails = await rentalityContract.getCarDetails(BigInt(carId));

        const signerAddress = await signer.getAddress();
        if (carInfoDetails.host !== signerAddress) {
          return emptyHostCarInfo;
        }

        const tokenURI = await rentalityContract.getCarMetadataURI(carInfoDetails.carId);
        return mapContractCarToCarDetails(carInfo.carInfo, carInfo.insuranceInfo, carInfoDetails, tokenURI);
      } catch (e) {
        console.error("getCarInfo error:" + e);
      }
    };

    if (isNaN(carId) || carId == -1) return;
    if (!ethereumInfo) return;
    if (!rentalityContract) return;

    getCarInfo(rentalityContract, ethereumInfo.signer)
      .then((data) => {
        setHostCarInfo(data ?? emptyHostCarInfo);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [carId, rentalityContract, ethereumInfo]);

  return { isLoading, hostCarInfo } as const;
};

export default useFetchCarInfo;
