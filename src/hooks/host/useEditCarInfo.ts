import { ContractTransactionResponse, Signer } from "ethers";
import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import { HostCarInfo, UNLIMITED_MILES_VALUE, UNLIMITED_MILES_VALUE_TEXT, emptyHostCarInfo } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { getMoneyInCentsFromString } from "@/utils/formInput";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import {
  ContractCarDetails,
  ContractCarInfo,
  ContractSignedLocationInfo,
  ContractUpdateCarInfoRequest,
} from "@/model/blockchain/schemas";
import { bigIntReplacer } from "@/utils/json";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { mapContractCarToCarDetails } from "@/model/mappers/contractCarToCarDetails";

const useEditCarInfo = (carId: number) => {
  const ethereumInfo = useEthereum();
  const rentalityContract = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyHostCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const saveCar = async () => {
    if (!rentalityContract) {
      console.error("saveCar error: rentalityContract is null");
      return false;
    }

    try {
      setDataSaved(false);

      const pricePerDayInUsdCents = BigInt(getMoneyInCentsFromString(carInfoFormParams.pricePerDay));
      const securityDepositPerTripInUsdCents = BigInt(getMoneyInCentsFromString(carInfoFormParams.securityDeposit));

      const engineParams: bigint[] = [];
      if (carInfoFormParams.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.fuelPricePerGal)));
      } else if (carInfoFormParams.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.fullBatteryChargePrice)));
      }

      const milesIncludedPerDay =
        carInfoFormParams.milesIncludedPerDay === UNLIMITED_MILES_VALUE_TEXT
          ? BigInt(UNLIMITED_MILES_VALUE)
          : BigInt(carInfoFormParams.milesIncludedPerDay);

      const updateCarRequest: ContractUpdateCarInfoRequest = {
        carId: BigInt(carId),
        currentlyListed: carInfoFormParams.currentlyListed,
        engineParams: engineParams,
        pricePerDayInUsdCents: pricePerDayInUsdCents,
        milesIncludedPerDay: milesIncludedPerDay,
        timeBufferBetweenTripsInSec: BigInt(carInfoFormParams.timeBufferBetweenTripsInMin * 60),
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
      };

      const location: ContractSignedLocationInfo = {
        locationInfo: mapLocationInfoToContractLocationInfo(carInfoFormParams.locationInfo),
        signature: "",
      };
      let transaction: ContractTransactionResponse;

      if (carInfoFormParams.isLocationEdited) {
        transaction = await rentalityContract.updateCarInfoWithLocation(
          updateCarRequest,
          location,
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
        );
      } else {
        transaction = await rentalityContract.updateCarInfo(updateCarRequest);
      }

      await transaction.wait();
      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      setDataSaved(true);
      return false;
    }
  };

  useEffect(() => {
    const getCarInfo = async (rentalityContract: IRentalityContract, signer: Signer) => {
      if (rentalityContract == null) {
        console.error("getCarInfo error: contract is null");
        return;
      }

      try {
        const carInfo: ContractCarInfo = await rentalityContract.getCarInfoById(BigInt(carId));
        const carInfoDetails: ContractCarDetails = await rentalityContract.getCarDetails(BigInt(carId));

        const signerAddress = await signer.getAddress();
        if (carInfoDetails.host !== signerAddress) {
          return emptyHostCarInfo;
        }

        const tokenURI = await rentalityContract.getCarMetadataURI(carInfoDetails.carId);
        return mapContractCarToCarDetails(carInfo, carInfoDetails, tokenURI);
      } catch (e) {
        console.error("getCarInfo error:" + e);
      }
    };

    if (isNaN(carId) || carId == -1) return;
    if (!ethereumInfo) return;
    if (!rentalityContract) return;

    getCarInfo(rentalityContract, ethereumInfo.signer)
      .then((data) => {
        setCarInfoFormParams(data ?? emptyHostCarInfo);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [carId, rentalityContract, ethereumInfo]);

  return [isLoading, carInfoFormParams, setCarInfoFormParams, dataSaved, saveCar] as const;
};

export default useEditCarInfo;
