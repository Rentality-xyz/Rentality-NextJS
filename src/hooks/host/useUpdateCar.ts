import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE } from "@/model/HostCarInfo";
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
import { saveCarImages, uploadMetadataToIPFS } from "./useSaveNewCar";

function useUpdateCar() {
  const { rentalityContracts } = useRentality();
  const ethereumInfo = useEthereum();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hostCarInfo: HostCarInfo): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          console.error("updateCar error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          console.error("updateCar error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        let metadataURL: string | undefined = hostCarInfo.metadataUrl;

        if (hostCarInfo.isCarMetadataEdited) {
          const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);

          const dataToSave = {
            ...hostCarInfo,
            images: savedImages,
          };

          metadataURL = await uploadMetadataToIPFS(dataToSave, ethereumInfo);
        }

        if (!metadataURL) {
          console.error("updateCar error: Upload JSON to Pinata error");
          return Err(new Error("ERROR"));
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

        let locationInfo: ContractSignedLocationInfo = {
          locationInfo: emptyContractLocationInfo,
          signature: "0x",
        };

        if (hostCarInfo.isLocationEdited) {
          const locationResult = await getSignedLocationInfo(
            mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
            ethereumInfo.chainId
          );
          if (!locationResult.ok) {
            console.error("updateCar error: Sign location error");
            return Err(new Error("ERROR"));
          }
          locationInfo = locationResult.value;
        }

        const result = await rentalityContracts.gatewayProxy.updateCarInfoWithLocation(updateCarRequest, locationInfo);

        return result;
      } catch (error) {
        console.error("updateCar error: ", error);
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
