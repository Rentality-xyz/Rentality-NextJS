import { useState } from "react";
import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractUpdateCarInfoRequest } from "@/model/blockchain/schemas";
import { deleteFileFromIPFS, uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { getIpfsHashFromUrl, getNftJSONFromCarInfo } from "@/utils/ipfsUtils";
import { ContractTransactionResponse } from "ethers";
import { env } from "@/utils/env";
import { PlatformCarImage, UploadedCarImage } from "@/model/FileToUpload";
import { Err, Ok, Result, TransactionErrorCode } from "@/model/utils/result";
import { isUserHasEnoughFunds, ZERO_HASH } from "@/utils/wallet";

const useSaveCar = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [dataSaved, setDataSaved] = useState<boolean>(true);

  const uploadMetadataToIPFS = async (hostCarInfo: HostCarInfo) => {
    if (!verifyCar(hostCarInfo)) {
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

  async function addNewCar(hostCarInfo: HostCarInfo): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("addNewCar error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContract) {
      console.error("addNewCar error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("addNewCar error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    setDataSaved(false);

    try {
      const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);

      const dataToSave = {
        ...hostCarInfo,
        images: savedImages,
      };

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      if (!metadataURL) {
        console.error("addNewCar error: Upload JSON to Pinata error");
        return Err("ERROR");
      }

      const engineParams: bigint[] = [];
      if (dataToSave.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
        engineParams.push(BigInt(dataToSave.tankVolumeInGal));
        engineParams.push(BigInt(dataToSave.fuelPricePerGal * 100));
      } else if (dataToSave.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
        engineParams.push(BigInt(dataToSave.fullBatteryChargePrice * 100));
      }

      const locationResult = await getSignedLocationInfo(
        mapLocationInfoToContractLocationInfo(dataToSave.locationInfo),
        ethereumInfo.chainId
      );
      if (!locationResult.ok) {
        console.error("addNewCar error: Sign location error");
        return Err("ERROR");
      }

      const request: ContractCreateCarRequest = {
        tokenUri: metadataURL,
        carVinNumber: dataToSave.vinNumber,
        brand: dataToSave.brand,
        model: dataToSave.model,
        yearOfProduction: BigInt(dataToSave.releaseYear),
        pricePerDayInUsdCents: BigInt(dataToSave.pricePerDay * 100),
        securityDepositPerTripInUsdCents: BigInt(dataToSave.securityDeposit * 100),
        milesIncludedPerDay: BigInt(
          isUnlimitedMiles(dataToSave.milesIncludedPerDay) ? UNLIMITED_MILES_VALUE : dataToSave.milesIncludedPerDay
        ),
        geoApiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        engineType: getEngineTypeCode(dataToSave.engineTypeText),
        engineParams: engineParams,
        timeBufferBetweenTripsInSec: BigInt(dataToSave.timeBufferBetweenTripsInMin * 60),
        locationInfo: locationResult.value,
        currentlyListed: dataToSave.currentlyListed,
        insuranceRequired: dataToSave.isGuestInsuranceRequired,
        insurancePriceInUsdCents: BigInt(dataToSave.insurancePerDayPriceInUsd * 100),
      };

                                                  /// TODO: get from input                
      const transaction = await rentalityContract.addCar(request, ZERO_HASH);
      await transaction.wait();
      return Ok(true);
    } catch (e) {
      console.error("addNewCar error: Upload error" + e);
      return Err("ERROR");
    } finally {
      setDataSaved(true);
    }
  }

  async function updateCar(hostCarInfo: HostCarInfo): Promise<Result<boolean, TransactionErrorCode>> {
    if (!ethereumInfo) {
      console.error("updateCar error: ethereumInfo is null");
      return Err("ERROR");
    }

    if (!rentalityContract) {
      console.error("updateCar error: rentalityContract is null");
      return Err("ERROR");
    }

    if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
      console.error("updateCar error: user don't have enough funds");
      return Err("NOT_ENOUGH_FUNDS");
    }

    setDataSaved(false);

    let metadataURL: string | undefined = hostCarInfo.metadataUrl;

    if (hostCarInfo.isCarMetadataEdited) {
      const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);

      const dataToSave = {
        ...hostCarInfo,
        images: savedImages,
      };

      metadataURL = await uploadMetadataToIPFS(dataToSave);
    }

    if (!metadataURL) {
      console.error("updateCar error: Upload JSON to Pinata error");
      return Err("ERROR");
    }

    const engineParams: bigint[] = [];
    if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
      engineParams.push(BigInt(hostCarInfo.tankVolumeInGal));
      engineParams.push(BigInt(hostCarInfo.fuelPricePerGal * 100));
    } else if (hostCarInfo.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
      engineParams.push(BigInt(hostCarInfo.fullBatteryChargePrice * 100));
    }

    const updateCarRequest: ContractUpdateCarInfoRequest = {
      carId: BigInt(hostCarInfo.carId),
      currentlyListed: hostCarInfo.currentlyListed,
      engineParams: engineParams,
      pricePerDayInUsdCents: BigInt(hostCarInfo.pricePerDay * 100),
      milesIncludedPerDay: BigInt(
        isUnlimitedMiles(hostCarInfo.milesIncludedPerDay) ? UNLIMITED_MILES_VALUE : hostCarInfo.milesIncludedPerDay
      ),
      timeBufferBetweenTripsInSec: BigInt(hostCarInfo.timeBufferBetweenTripsInMin * 60),
      securityDepositPerTripInUsdCents: BigInt(hostCarInfo.securityDeposit * 100),
      engineType: getEngineTypeCode(hostCarInfo.engineTypeText),
      tokenUri: metadataURL,
      insuranceRequired: hostCarInfo.isGuestInsuranceRequired,
      insurancePriceInUsdCents: BigInt(hostCarInfo.insurancePerDayPriceInUsd * 100),
    };

    let transaction: ContractTransactionResponse;

    try {
      if (hostCarInfo.isLocationEdited) {
        const locationResult = await getSignedLocationInfo(
          mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
          ethereumInfo.chainId
        );
        if (!locationResult.ok) {
          console.error("updateCar error: Sign location error");
          return Err("ERROR");
        }

        transaction = await rentalityContract.updateCarInfoWithLocation(
          updateCarRequest,
          locationResult.value,
          env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        );
      } else {
        transaction = await rentalityContract.updateCarInfo(updateCarRequest);
      }

      await transaction.wait();

      return Ok(true);
    } catch (e) {
      console.error("updateCar error: Upload error" + e);
      return Err("ERROR");
    } finally {
      setDataSaved(true);
    }
  }

  return { dataSaved, addNewCar, updateCar } as const;
};

async function saveCarImages(carImages: PlatformCarImage[], ethereumInfo: EthereumInfo): Promise<UploadedCarImage[]> {
  const savedImages: UploadedCarImage[] = [];

  if (carImages.length > 0) {
    for (const image of carImages) {
      if ("file" in image) {
        const response = await uploadFileToIPFS(image.file, "RentalityCarImage", {
          createdAt: new Date().toISOString(),
          createdBy: ethereumInfo?.walletAddress ?? "",
          version: SMARTCONTRACT_VERSION,
          chainId: ethereumInfo?.chainId ?? 0,
        });

        if (!response.success || !response.pinataURL) {
          throw new Error("Uploaded image to Pinata error");
        }
        savedImages.push({ url: response.pinataURL, isPrimary: image.isPrimary });
      } else if (image.isDeleted) {
        await deleteFileFromIPFS(getIpfsHashFromUrl(image.url));
      } else {
        savedImages.push(image);
      }
    }
  }

  return savedImages;
}

export default useSaveCar;
