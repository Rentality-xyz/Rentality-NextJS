import { Signer } from "ethers";
import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import {
  ContractCarInfo,
  ENGINE_TYPE_ELECTRIC_STRING,
  ENGINE_TYPE_PATROL_STRING,
  getEngineTypeString,
} from "@/model/blockchain/ContractCarInfo";
import { getIpfsURIfromPinata, getMetaDataFromIpfs } from "@/utils/ipfsUtils";
import {
  HostCarInfo,
  UNLIMITED_MILES_VALUE,
  UNLIMITED_MILES_VALUE_TEXT,
  getMilesIncludedPerDayText,
} from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ContractUpdateCarInfoRequest } from "@/model/blockchain/ContractUpdateCarInfoRequest";
import { getMoneyInCentsFromString, getStringFromMoneyInCents } from "@/utils/formInput";

const emptyHostCarInfo: HostCarInfo = {
  carId: -1,
  ownerAddress: "",
  vinNumber: "",
  brand: "",
  model: "",
  releaseYear: "",
  image: "",
  name: "",
  licensePlate: "",
  licenseState: "",
  seatsNumber: "",
  doorsNumber: "",
  tankVolumeInGal: "",
  wheelDrive: "",
  transmission: "",
  trunkSize: "",
  color: "",
  bodyType: "",
  description: "",
  pricePerDay: "",
  milesIncludedPerDay: "",
  securityDeposit: "",
  fuelPricePerGal: "",
  country: "",
  state: "",
  city: "",
  locationLatitude: "",
  locationLongitude: "",
  locationAddress: "",
  currentlyListed: true,
  engineTypeString: "",
  batteryPrice_0_20: "",
  batteryPrice_21_50: "",
  batteryPrice_51_80: "",
  batteryPrice_81_100: "",
  timeBufferBetweenTripsInMin: 0,
};

const useEditCarInfo = (carId: number) => {
  const rentalityInfo = useRentality();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyHostCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const saveCar = async () => {
    if (!rentalityInfo) {
      console.error("saveCar error: rentalityInfo is null");
      return false;
    }

    try {
      setDataSaved(false);

      const pricePerDayInUsdCents = BigInt(getMoneyInCentsFromString(carInfoFormParams.pricePerDay));
      const securityDepositPerTripInUsdCents = BigInt(getMoneyInCentsFromString(carInfoFormParams.securityDeposit));

      const engineParams: bigint[] = [];
      if (carInfoFormParams.engineTypeString === ENGINE_TYPE_PATROL_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.fuelPricePerGal)));
      } else if (carInfoFormParams.engineTypeString === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.batteryPrice_0_20)));
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.batteryPrice_21_50)));
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.batteryPrice_51_80)));
        engineParams.push(BigInt(getMoneyInCentsFromString(carInfoFormParams.batteryPrice_81_100)));
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
        timeBufferBetweenTripsInSec: carInfoFormParams.timeBufferBetweenTripsInMin * 60,
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
      };

      let transaction = await rentalityInfo.rentalityContract.updateCarInfo(updateCarRequest);

      const result = await transaction.wait();
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
        const signerAddress = await signer.getAddress();
        if (carInfo.createdBy !== signerAddress) {
          return emptyHostCarInfo;
        }

        const tokenURI = await rentalityContract.getCarMetadataURI(carInfo.carId);
        const meta = await getMetaDataFromIpfs(tokenURI);

        const price = Number(carInfo.pricePerDayInUsdCents) / 100;
        const securityDeposit = Number(carInfo.securityDepositPerTripInUsdCents) / 100;
        const engineTypeString = getEngineTypeString(carInfo.engineType);

        const fuelPricePerGal =
          engineTypeString === ENGINE_TYPE_PATROL_STRING ? getStringFromMoneyInCents(carInfo.engineParams[1]) : "";
        const batteryPrice_0_20 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING ? getStringFromMoneyInCents(carInfo.engineParams[0]) : "";
        const batteryPrice_21_50 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING ? getStringFromMoneyInCents(carInfo.engineParams[1]) : "";
        const batteryPrice_51_80 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING ? getStringFromMoneyInCents(carInfo.engineParams[2]) : "";
        const batteryPrice_81_100 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING ? getStringFromMoneyInCents(carInfo.engineParams[3]) : "";

        let item: HostCarInfo = {
          carId: Number(carInfo.carId),
          ownerAddress: carInfo.createdBy.toString(),
          image: getIpfsURIfromPinata(meta.image),
          vinNumber: carInfo.carVinNumber,
          brand: carInfo.brand,
          model: carInfo.model,
          releaseYear: Number(carInfo.yearOfProduction).toString(),
          name: meta.name ?? "",
          licensePlate: meta.attributes?.find((x: any) => x.trait_type === "License plate")?.value ?? "",
          licenseState: meta.attributes?.find((x: any) => x.trait_type === "License state")?.value ?? "",
          seatsNumber: meta.attributes?.find((x: any) => x.trait_type === "Seats number")?.value ?? "",
          doorsNumber: meta.attributes?.find((x: any) => x.trait_type === "Doors number")?.value ?? "",
          tankVolumeInGal: meta.attributes?.find((x: any) => x.trait_type === "Tank volume(gal)")?.value ?? "",
          wheelDrive: meta.attributes?.find((x: any) => x.trait_type === "Wheel drive")?.value ?? "",
          transmission: meta.attributes?.find((x: any) => x.trait_type === "Transmission")?.value ?? "",
          trunkSize: meta.attributes?.find((x: any) => x.trait_type === "Trunk size")?.value ?? "",
          color: meta.attributes?.find((x: any) => x.trait_type === "Color")?.value ?? "",
          bodyType: meta.attributes?.find((x: any) => x.trait_type === "Body type")?.value ?? "",
          description: meta.description ?? "",
          pricePerDay: price.toString(),
          milesIncludedPerDay: getMilesIncludedPerDayText(carInfo.milesIncludedPerDay),
          securityDeposit: securityDeposit.toString(),
          country: "",
          state: "",
          city: "",
          locationLatitude: "",
          locationLongitude: "",
          locationAddress: "",
          currentlyListed: carInfo.currentlyListed,
          engineTypeString: engineTypeString,
          fuelPricePerGal: fuelPricePerGal,
          batteryPrice_0_20: batteryPrice_0_20,
          batteryPrice_21_50: batteryPrice_21_50,
          batteryPrice_51_80: batteryPrice_51_80,
          batteryPrice_81_100: batteryPrice_81_100,
          timeBufferBetweenTripsInMin: Number(carInfo.timeBufferBetweenTripsInSec) / 60,
        };
        return item;
      } catch (e) {
        console.error("getCarInfo error:" + e);
      }
    };

    if (isNaN(carId) || carId == -1) return;
    if (!rentalityInfo) return;

    getCarInfo(rentalityInfo.rentalityContract, rentalityInfo.signer)
      .then((data) => {
        setCarInfoFormParams(data ?? emptyHostCarInfo);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [carId, rentalityInfo]);

  return [isLoading, carInfoFormParams, setCarInfoFormParams, dataSaved, saveCar] as const;
};

export default useEditCarInfo;
