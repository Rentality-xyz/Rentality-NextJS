import { ContractTransactionResponse, Signer } from "ethers";
import { useEffect, useState } from "react";
import { IRentalityContract } from "@/model/blockchain/IRentalityContract";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PATROL_STRING, getEngineTypeString } from "@/model/EngineType";
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
import { ContractCarDetails } from "@/model/blockchain/ContractCarDetails";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCarInfo } from "@/model/blockchain/ContractCarInfo";

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
  isLocationAddressEdited: false,
  currentlyListed: true,
  engineTypeString: "",
  batteryPrice_0_20: "",
  batteryPrice_21_50: "",
  batteryPrice_51_80: "",
  batteryPrice_81_100: "0",
  timeBufferBetweenTripsInMin: 0,
};

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
      let transaction: ContractTransactionResponse;

      if (carInfoFormParams.isLocationAddressEdited) {
        transaction = await rentalityContract.updateCarInfoWithLocation(
          updateCarRequest,
          carInfoFormParams.locationAddress,
          carInfoFormParams.locationLatitude,
          carInfoFormParams.locationLongitude,
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
        );
      } else {
        transaction = await rentalityContract.updateCarInfo(updateCarRequest);
      }

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
        const carInfoDetails: ContractCarDetails = await rentalityContract.getCarDetails(BigInt(carId));

        const signerAddress = await signer.getAddress();
        if (carInfoDetails.host !== signerAddress) {
          return emptyHostCarInfo;
        }

        const tokenURI = await rentalityContract.getCarMetadataURI(carInfoDetails.carId);
        const meta = await getMetaDataFromIpfs(tokenURI);

        const price = Number(carInfoDetails.pricePerDayInUsdCents) / 100;
        const securityDeposit = Number(carInfoDetails.securityDepositPerTripInUsdCents) / 100;
        const engineTypeString = getEngineTypeString(carInfoDetails.engineType);

        const fuelPricePerGal =
          engineTypeString === ENGINE_TYPE_PATROL_STRING
            ? getStringFromMoneyInCents(carInfoDetails.engineParams[1])
            : "";
        const batteryPrice_0_20 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING
            ? getStringFromMoneyInCents(carInfoDetails.engineParams[0])
            : "";
        const batteryPrice_21_50 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING
            ? getStringFromMoneyInCents(carInfoDetails.engineParams[1])
            : "";
        const batteryPrice_51_80 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING
            ? getStringFromMoneyInCents(carInfoDetails.engineParams[2])
            : "";
        const batteryPrice_81_100 =
          engineTypeString === ENGINE_TYPE_ELECTRIC_STRING
            ? getStringFromMoneyInCents(carInfoDetails.engineParams[3])
            : "";

        let item: HostCarInfo = {
          carId: Number(carInfoDetails.carId),
          ownerAddress: carInfoDetails.host.toString(),
          image: getIpfsURIfromPinata(meta.image),
          vinNumber: carInfo.carVinNumber,
          brand: carInfoDetails.brand,
          model: carInfoDetails.model,
          releaseYear: Number(carInfoDetails.yearOfProduction).toString(),
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
          milesIncludedPerDay: getMilesIncludedPerDayText(carInfoDetails.milesIncludedPerDay),
          securityDeposit: securityDeposit.toString(),
          country: carInfoDetails.country,
          state: carInfoDetails.state,
          city: carInfoDetails.city,
          locationLatitude: carInfoDetails.locationLatitude,
          locationLongitude: carInfoDetails.locationLongitude,
          locationAddress: "",
          isLocationAddressEdited: false,
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
