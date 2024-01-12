import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../../utils/pinata";
import { ContractCreateCarRequest } from "@/model/blockchain/ContractCreateCarRequest";
import { HostCarInfo, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { getIntFromString, getUIntFromString } from "@/utils/numericFormatters";
import {
  ENGINE_TYPE_ELECTRIC_STRING,
  ENGINE_TYPE_PATROL_STRING,
  getEngineTypeCode,
} from "@/model/blockchain/ContractCarInfo";
import { getMoneyInCentsFromString } from "@/utils/formInput";

const emptyNewCarInfo: HostCarInfo = {
  carId: 0,
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
};

const useAddCar = () => {
  const rentalityInfo = useRentality();
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyNewCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const uploadMetadataToIPFS = async ({
    vinNumber,
    brand,
    model,
    releaseYear,
    image,
    name,
    licensePlate,
    licenseState,
    seatsNumber,
    doorsNumber,
    tankVolumeInGal,
    wheelDrive,
    transmission,
    trunkSize,
    color,
    bodyType,
    description,
  }: HostCarInfo) => {
    if (!verifyCar(carInfoFormParams)) {
      return;
    }

    const attributes = [
      {
        trait_type: "VIN number",
        value: vinNumber,
      },
      {
        trait_type: "License plate",
        value: licensePlate,
      },
      {
        trait_type: "License state",
        value: licenseState,
      },
      // {
      //   trait_type: "State",
      //   value: state,
      // },
      {
        trait_type: "Brand",
        value: brand,
      },
      {
        trait_type: "Model",
        value: model,
      },
      {
        trait_type: "Release year",
        value: releaseYear,
      },
      {
        trait_type: "Body type",
        value: bodyType,
      },
      {
        trait_type: "Color",
        value: color,
      },
      {
        trait_type: "Doors number",
        value: doorsNumber,
      },
      {
        trait_type: "Seats number",
        value: seatsNumber,
      },
      {
        trait_type: "Trunk size",
        value: trunkSize,
      },
      {
        trait_type: "Transmission",
        value: transmission,
      },
      {
        trait_type: "Wheel drive",
        value: wheelDrive,
      },
      {
        trait_type: "Tank volume(gal)",
        value: tankVolumeInGal,
      },
      // {
      //   trait_type: "Distance included(mi)",
      //   value: milesIncludedPerDay,
      // },
      // {
      //   trait_type: "Price per Day (USD cents)",
      //   value: pricePerDay,
      // }
    ];
    const nftJSON = {
      name,
      description,
      image,
      attributes,
    };

    try {
      //upload the metadata JSON to IPFS
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.error("error uploading JSON metadata:", e);
    }
  };

  const saveCar = async (image: File) => {
    if (!rentalityInfo) {
      console.error("saveCar error: rentalityInfo is null");
      return false;
    }

    try {
      setDataSaved(false);
      const response = await uploadFileToIPFS(image);

      if (response.success !== true) {
        console.error("Uploaded image to Pinata error");

        setDataSaved(true);
        return false;
      }

      console.log("Uploaded image to Pinata: ", response.pinataURL);
      const dataToSave = {
        ...carInfoFormParams,
        image: response.pinataURL,
      };

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      const pricePerDayInUsdCents = BigInt(getMoneyInCentsFromString(dataToSave.pricePerDay));
      const securityDepositPerTripInUsdCents = BigInt(getMoneyInCentsFromString(dataToSave.securityDeposit));

      const engineType = getEngineTypeCode(dataToSave.engineTypeString);

      const engineParams: bigint[] = [];
      if (carInfoFormParams.engineTypeString === ENGINE_TYPE_PATROL_STRING) {
        engineParams.push(BigInt(dataToSave.tankVolumeInGal));
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.fuelPricePerGal)));
      } else if (carInfoFormParams.engineTypeString === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.batteryPrice_0_20)));
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.batteryPrice_21_50)));
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.batteryPrice_51_80)));
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.batteryPrice_81_100)));
      }

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: Number(dataToSave.releaseYear),
        pricePerDayInUsdCents: pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
        milesIncludedPerDay: BigInt(dataToSave.milesIncludedPerDay),
        geoApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        engineType: Number(engineType),
        engineParams: engineParams,
        locationAddress: dataToSave.locationAddress,
		//TODO EDIT
        timeBufferBetweenTripsInSec: 90,
      };

      console.log("request", request);

      let transaction = await rentalityInfo.rentalityContract.addCar(request);

      const result = await transaction.wait();
      setCarInfoFormParams(emptyNewCarInfo);
      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      setDataSaved(true);
      return false;
    }
  };

  return [carInfoFormParams, setCarInfoFormParams, dataSaved, saveCar] as const;
};

export default useAddCar;
