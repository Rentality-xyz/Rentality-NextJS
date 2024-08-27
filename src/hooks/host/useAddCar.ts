import { useState } from "react";
import { HostCarInfo, UNLIMITED_MILES_VALUE, UNLIMITED_MILES_VALUE_TEXT, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { getMoneyInCentsFromString } from "@/utils/formInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractLocationInfo } from "@/model/blockchain/schemas";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { emptyLocationInfo } from "@/model/LocationInfo";

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
  locationInfo: emptyLocationInfo,
  isLocationEdited: true,
  currentlyListed: true,
  engineTypeText: "",
  fullBatteryChargePrice: "",
  timeBufferBetweenTripsInMin: 0,
  isInsuranceIncluded: false,
};

const useAddCar = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
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
    ];
    const nftJSON = {
      name,
      description,
      image,
      attributes,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON, "RentalityNFTMetadata", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo?.walletAddress ?? "",
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId ?? 0,
      });
      if (response.success === true) {
        return response.pinataURL;
      }
    } catch (e) {
      console.error("error uploading JSON metadata:", e);
    }
  };

  const saveCar = async (image: File) => {
    if (!ethereumInfo) {
      console.error("saveCar error: ethereumInfo is null");
      return false;
    }

    if (!rentalityContract) {
      console.error("saveCar error: rentalityContract is null");
      return false;
    }

    try {
      setDataSaved(false);
      const response = await uploadFileToIPFS(image, "RentalityCarImage", {
        createdAt: new Date().toISOString(),
        createdBy: ethereumInfo.walletAddress,
        version: SMARTCONTRACT_VERSION,
        chainId: ethereumInfo?.chainId,
      });

      if (response.success !== true) {
        console.error("Uploaded image to Pinata error");
        return false;
      }

      const dataToSave = {
        ...carInfoFormParams,
        image: response.pinataURL,
      };

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      if (!metadataURL) {
        console.error("Upload JSON to Pinata error");
        return false;
      }

      const pricePerDayInUsdCents = BigInt(getMoneyInCentsFromString(dataToSave.pricePerDay));
      const securityDepositPerTripInUsdCents = BigInt(getMoneyInCentsFromString(dataToSave.securityDeposit));

      const engineParams: bigint[] = [];
      if (carInfoFormParams.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
        engineParams.push(BigInt(dataToSave.tankVolumeInGal));
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.fuelPricePerGal)));
      } else if (carInfoFormParams.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(getMoneyInCentsFromString(dataToSave.fullBatteryChargePrice)));
      }

      const milesIncludedPerDay =
        dataToSave.milesIncludedPerDay === UNLIMITED_MILES_VALUE_TEXT
          ? BigInt(UNLIMITED_MILES_VALUE)
          : BigInt(dataToSave.milesIncludedPerDay);

      const hostAddressArray = dataToSave.locationInfo.address.split(",").map((i) => i.trim());

      hostAddressArray[hostAddressArray.length - 1] = dataToSave.locationInfo.country;
      hostAddressArray[hostAddressArray.length - 2] = dataToSave.locationInfo.state;
      hostAddressArray[hostAddressArray.length - 3] = dataToSave.locationInfo.city;

      const hostAddress = hostAddressArray.join(", ");

      const locationInfo: ContractLocationInfo = {
        userAddress: hostAddress,
        country: dataToSave.locationInfo.country,
        state: dataToSave.locationInfo.state,
        city: dataToSave.locationInfo.city,
        latitude: dataToSave.locationInfo.latitude.toFixed(6),
        longitude: dataToSave.locationInfo.longitude.toFixed(6),
        timeZoneId: dataToSave.locationInfo.timeZoneId,
      };

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: BigInt(dataToSave.releaseYear),
        pricePerDayInUsdCents: pricePerDayInUsdCents,
        securityDepositPerTripInUsdCents: securityDepositPerTripInUsdCents,
        milesIncludedPerDay: milesIncludedPerDay,
        geoApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        engineType: getEngineTypeCode(dataToSave.engineTypeText),
        engineParams: engineParams,
        timeBufferBetweenTripsInSec: BigInt(carInfoFormParams.timeBufferBetweenTripsInMin * 60),
        insuranceIncluded: dataToSave.isInsuranceIncluded,
        locationInfo: locationInfo,
      };

      const transaction = await rentalityContract.addCar(request);
      await transaction.wait();
      setCarInfoFormParams(emptyNewCarInfo);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      return false;
    } finally {
      setDataSaved(true);
    }
  };

  return [carInfoFormParams, setCarInfoFormParams, dataSaved, saveCar] as const;
};

export default useAddCar;
