import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { SMARTCONTRACT_VERSION } from "@/abis";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest } from "@/model/blockchain/schemas";
import { deleteFileFromIPFS, uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { getIpfsHashFromUrl, getNftJSONFromCarInfo } from "@/utils/ipfsUtils";
import { PlatformCarImage, UploadedCarImage } from "@/model/FileToUpload";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import axios from "axios";
import { useDimoAuthState } from "@dimo-network/login-with-dimo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MY_LISTINGS_QUERY_KEY } from "./useFetchMyListings";
import { logger } from "@/utils/logger";

function useSaveNewCar() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const { walletAddress } = useDimoAuthState();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostCarInfo: HostCarInfo): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          logger.error("saveNewCar error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          logger.error("saveNewCar error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);

        const dataToSave = {
          ...hostCarInfo,
          images: savedImages,
        };

        const metadataURL = await uploadMetadataToIPFS(dataToSave, ethereumInfo);

        if (!metadataURL) {
          logger.error("saveNewCar error: Upload JSON to Pinata error");
          return Err(new Error("ERROR"));
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
          logger.error("saveNewCar error: Sign location error");
          return Err(new Error("ERROR"));
        }

        const dimoToken = walletAddress === null ? 0 : dataToSave.dimoTokenId;

        const dimoSignature =
          walletAddress === null || dimoToken === 0
            ? "0x"
            : await axios
                .post("/api/dimo/signDIMOId", {
                  address: walletAddress,
                  chainId: ethereumInfo.chainId,
                  dimoToken,
                })
                .then((response) => {
                  logger.info("SIGN", response.data.signature);
                  return response.data.signature;
                })
                .catch((error) => {
                  if (error.response && error.response.status === 404) {
                    return "0x";
                  } else {
                    throw error;
                  }
                });

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
          geoApiKey: "",
          engineType: getEngineTypeCode(dataToSave.engineTypeText),
          engineParams: engineParams,
          timeBufferBetweenTripsInSec: BigInt(dataToSave.timeBufferBetweenTripsInMin * 60),
          locationInfo: locationResult.value,
          currentlyListed: dataToSave.currentlyListed,
          insuranceRequired: dataToSave.isGuestInsuranceRequired,
          insurancePriceInUsdCents: BigInt(dataToSave.insurancePerDayPriceInUsd * 100),
          dimoTokenId: BigInt(dataToSave.dimoTokenId),
          signedDimoTokenId: dimoSignature,
        };

        logger.debug("SIGNATURE", request);
        const result = await rentalityContracts.gateway.addCar(request);

        return result;
      } catch (error) {
        logger.error("saveNewCar error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [MY_LISTINGS_QUERY_KEY] });
      }
    },
  });
}

export async function uploadMetadataToIPFS(hostCarInfo: HostCarInfo, ethereumInfo: EthereumInfo) {
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
  } catch (error) {
    logger.error("error uploading JSON metadata:", error);
  }
}

export async function saveCarImages(
  carImages: PlatformCarImage[],
  ethereumInfo: EthereumInfo
): Promise<UploadedCarImage[]> {
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

export default useSaveNewCar;
