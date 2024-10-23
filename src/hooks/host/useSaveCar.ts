import { useState } from "react";
import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractUpdateCarInfoRequest } from "@/model/blockchain/schemas";
import { deleteFileFromIPFS, uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { getIpfsHashFromUrl, getNftJSONFromCarInfo } from "@/utils/ipfsUtils";
import { ContractTransactionResponse } from "ethers";
import { env } from "@/utils/env";
import { UploadedCarImage } from "@/model/FileToUpload";

const useSaveCar = () => {
  const rentalityContract = useRentality();
  const ethereumInfo = useEthereum();
  const [dataSaved, setDataSaved] = useState<Boolean>(true);

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

  async function addNewCar(hostCarInfo: HostCarInfo) {
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

      const savedImages: UploadedCarImage[] = [];

      if (hostCarInfo.images.length > 0) {
        for (const image of hostCarInfo.images) {
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

      const dataToSave = {
        ...hostCarInfo,
        images: savedImages,
      };

      const metadataURL = await uploadMetadataToIPFS(dataToSave);

      if (!metadataURL) {
        console.error("Upload JSON to Pinata error");
        return false;
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
        console.error("Sign location error");
        return false;
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

      const transaction = await rentalityContract.addCar(request);
      await transaction.wait();
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      return false;
    } finally {
      setDataSaved(true);
    }
  }

  async function updateCar(hostCarInfo: HostCarInfo) {
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

      const engineParams: bigint[] = [];
      if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
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
        insuranceRequired: hostCarInfo.isGuestInsuranceRequired,
        insurancePriceInUsdCents: BigInt(hostCarInfo.insurancePerDayPriceInUsd * 100),
      };

      let transaction: ContractTransactionResponse;

      if (hostCarInfo.isLocationEdited) {
        const locationResult = await getSignedLocationInfo(
          mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
          ethereumInfo.chainId
        );
        if (!locationResult.ok) {
          console.error("Sign location error");
          return false;
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

      if (hostCarInfo.isCarMetadataEdited) {
        const savedImages: UploadedCarImage[] = [];
        if (hostCarInfo.images.length > 0) {
          for (const image of hostCarInfo.images) {
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

        const dataToSave = {
          ...hostCarInfo,
          images: savedImages,
        };

        const metadataURL = await uploadMetadataToIPFS(dataToSave);

        if (!metadataURL) {
          console.error("Upload JSON to Pinata error");
          return false;
        }
        transaction = await rentalityContract.updateCarTokenUri(updateCarRequest.carId, metadataURL);
      }

      await transaction.wait();

      setDataSaved(true);
      return true;
    } catch (e) {
      console.error("Upload error" + e);
      setDataSaved(true);
      return false;
    }
  }

  return { dataSaved, addNewCar, updateCar } as const;
};

export default useSaveCar;
