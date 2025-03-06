import { Signer } from "ethers";
import { useEffect, useState } from "react";
import { HostCarInfo, emptyHostCarInfo } from "@/model/HostCarInfo";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCarDetails, ContractCarInfoWithInsurance } from "@/model/blockchain/schemas";
import { mapContractCarToCarDetails } from "@/model/mappers/contractCarToCarDetails";
import { logger } from "@/utils/logger";

const useFetchCarInfo = (carId: number) => {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hostCarInfo, setHostCarInfo] = useState<HostCarInfo>(emptyHostCarInfo);

  useEffect(() => {
    const getCarInfo = async (rentalityContracts: IRentalityContracts, signer: Signer) => {
      if (!rentalityContracts) {
        logger.error("getCarInfo error: contract is null");
        return;
      }

      try {
        const carInfoResult = await rentalityContracts.gateway.getCarInfoById(BigInt(carId));
        const carInfoDetailsResult = await rentalityContracts.gateway.getCarDetails(BigInt(carId));

        if (!carInfoResult.ok) {
          logger.error("getCarInfo error:" + carInfoResult.error);
          return;
        }

        if (!carInfoDetailsResult.ok) {
          logger.error("getCarInfo error:" + carInfoDetailsResult.error);
          return;
        }

        const signerAddress = await signer.getAddress();
        if (carInfoDetailsResult.value.host !== signerAddress) {
          return emptyHostCarInfo;
        }

        return mapContractCarToCarDetails(
          carInfoResult.value.carInfo,
          carInfoResult.value.insuranceInfo,
          carInfoDetailsResult.value,
          carInfoResult.value.carMetadataURI
        );
      } catch (error) {
        logger.error("getCarInfo error:" + error);
      }
    };

    if (isNaN(carId) || carId == -1) return;
    if (!ethereumInfo) return;
    if (!rentalityContracts) return;

    getCarInfo(rentalityContracts, ethereumInfo.signer)
      .then((data) => {
        setHostCarInfo(data ?? emptyHostCarInfo);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [carId, rentalityContracts, ethereumInfo]);

  return { isLoading, hostCarInfo } as const;
};

export default useFetchCarInfo;
