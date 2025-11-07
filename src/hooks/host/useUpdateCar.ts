import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractSignedLocationInfo, ContractUpdateCarInfoRequest } from "@/model/blockchain/schemas";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MY_LISTINGS_QUERY_KEY } from "./useFetchMyListings";
import { logger } from "@/utils/logger";
import { deleteFilesByUrl, saveCarMetadata } from "@/features/filestore/pinata/utils";

function useUpdateCar() {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostCarInfo: HostCarInfo): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          logger.error("updateCar error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          logger.error("updateCar error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        if (!verifyCar(hostCarInfo)) {
          logger.error("updateCar error: hostCarInfo is not valid");
          return Err(new Error("hostCarInfo is not valid"));
        }

           const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
                        if(!defaultChainId) {
                          console.error("Default chain id not found")
                          return Err(new Error("ERROR"));
                        }

        const engineParams: bigint[] = [];
        if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
          engineParams.push(BigInt(hostCarInfo.tankVolumeInGal));
          engineParams.push(BigInt(hostCarInfo.fuelPricePerGal * 100));
        } else if (hostCarInfo.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
          engineParams.push(BigInt(hostCarInfo.fullBatteryChargePrice * 100));
        }

        let locationInfo: ContractSignedLocationInfo = {
          locationInfo: emptyContractLocationInfo,
          signature: "0x",
        };

        if (hostCarInfo.isLocationEdited) {
          const locationResult = await getSignedLocationInfo(
            mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
            Number(defaultChainId)
          );
          if (!locationResult.ok) {
            logger.error("updateCar error: Sign location error");
            return Err(new Error("ERROR"));
          }
          locationInfo = locationResult.value;
        }

        let metadataURL = hostCarInfo.metadataUrl;
        let newUploadedUrls: string[] = [];
        let urlsToDelete: string[] = [];

        if (hostCarInfo.isCarMetadataEdited) {
          const saveMetadataResult = await saveCarMetadata(hostCarInfo.images, ethereumInfo.chainId, hostCarInfo, {
            createdAt: new Date().toISOString(),
            createdBy: ethereumInfo.walletAddress,
          });

          if (!saveMetadataResult.ok) {
            return saveMetadataResult;
          }

          metadataURL = saveMetadataResult.value.metadataUrl;
          newUploadedUrls = saveMetadataResult.value.newUploadedUrls;
          urlsToDelete = saveMetadataResult.value.urlsToDelete;
        }

        const updateCarRequest: ContractUpdateCarInfoRequest = {
          tokenUri: metadataURL,
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
          insuranceRequired: hostCarInfo.isGuestInsuranceRequired,
          insurancePriceInUsdCents: BigInt(hostCarInfo.insurancePerDayPriceInUsd * 100),
        };

        const result = await rentalityContracts.gateway.updateCarInfoWithLocation(updateCarRequest, locationInfo);

        await deleteFilesByUrl(result.ok ? urlsToDelete : newUploadedUrls);

        return result;
      } catch (error) {
        logger.error("updateCar error: ", error);
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

export default useUpdateCar;
