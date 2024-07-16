import { useState } from "react";
import {
  emptyHostCarInfo,
  HostCarInfo,
  UNLIMITED_MILES_VALUE,
  UNLIMITED_MILES_VALUE_TEXT,
  verifyCar,
} from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { getMoneyInCentsFromString } from "@/utils/formInput";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { bigIntReplacer } from "@/utils/json";
import { getNftJSONFromCarInfo } from "@/utils/ipfsUtils";

const useAddCar = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [carInfoFormParams, setCarInfoFormParams] = useState<HostCarInfo>(emptyHostCarInfo);
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

  const uploadMetadataToIPFS = async (hostCarInfo: HostCarInfo) => {
    if (!verifyCar(carInfoFormParams)) {
      return;
    }

    const nftJSON = getNftJSONFromCarInfo(hostCarInfo);

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

      const location: ContractSignedLocationInfo = {
        locationInfo: mapLocationInfoToContractLocationInfo(dataToSave.locationInfo),
        signature: "",
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
        locationInfo: location,
      };

      const transaction = await rentalityContract.addCar(request);
      await transaction.wait();
      setCarInfoFormParams(emptyHostCarInfo);
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
