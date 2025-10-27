import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE, verifyCar } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest } from "@/model/blockchain/schemas";
import { getSignedLocationInfo, mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { Err, Result } from "@/model/utils/result";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { useDimoAuthState } from "@dimo-network/login-with-dimo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MY_LISTINGS_QUERY_KEY } from "./useFetchMyListings";
import { logger } from "@/utils/logger";
import { deleteFilesByUrl, saveCarMetadata } from "@/features/filestore";
import { getDimoSignature } from "@/features/dimo/utils";
import { REFERRAL_OWN_POINTS_QUERY_KEY } from "@/features/referralProgram/hooks/useFetchOwnReferralPoints";

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

        if (!verifyCar(hostCarInfo)) {
          logger.error("saveNewCar error: hostCarInfo is not valid");
          return Err(new Error("hostCarInfo is not valid"));
        }

        const engineParams: bigint[] = [];
        if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
          engineParams.push(BigInt(hostCarInfo.tankVolumeInGal));
          engineParams.push(BigInt(hostCarInfo.fuelPricePerGal * 100));
        } else if (hostCarInfo.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
          engineParams.push(BigInt(hostCarInfo.fullBatteryChargePrice * 100));
        }

        const locationResult = await getSignedLocationInfo(
          mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
          ethereumInfo.chainId
        );
        if (!locationResult.ok) {
          logger.error("saveNewCar error: Sign location error");
          return Err(new Error("ERROR"));
        }
        logger.debug(`Location info to save: ${JSON.stringify(locationResult.value)}`);

        const dimoToken = walletAddress === null ? 0 : hostCarInfo.dimoTokenId;
        const dimoSignatureResult = await getDimoSignature(walletAddress, dimoToken, ethereumInfo.chainId);
        if (!dimoSignatureResult.ok) {
          return Err(new Error("ERROR"));
        }

        const saveMetadataResult = await saveCarMetadata(hostCarInfo.images, ethereumInfo.chainId, hostCarInfo, {
          createdAt: new Date().toISOString(),
          createdBy: ethereumInfo.walletAddress,
        });

        if (!saveMetadataResult.ok) {
          return saveMetadataResult;
        }

        const request: ContractCreateCarRequest = {
          tokenUri: saveMetadataResult.value.metadataUrl,
          carVinNumber: hostCarInfo.vinNumber,
          brand: hostCarInfo.brand,
          model: hostCarInfo.model,
          yearOfProduction: BigInt(hostCarInfo.releaseYear),
          pricePerDayInUsdCents: BigInt(hostCarInfo.pricePerDay * 100),
          securityDepositPerTripInUsdCents: BigInt(hostCarInfo.securityDeposit * 100),
          milesIncludedPerDay: BigInt(
            isUnlimitedMiles(hostCarInfo.milesIncludedPerDay) ? UNLIMITED_MILES_VALUE : hostCarInfo.milesIncludedPerDay
          ),
          geoApiKey: "",
          engineType: getEngineTypeCode(hostCarInfo.engineTypeText),
          engineParams: engineParams,
          timeBufferBetweenTripsInSec: BigInt(hostCarInfo.timeBufferBetweenTripsInMin * 60),
          locationInfo: locationResult.value,
          currentlyListed: hostCarInfo.currentlyListed,
          insuranceRequired: hostCarInfo.isGuestInsuranceRequired,
          insurancePriceInUsdCents: BigInt(hostCarInfo.insurancePerDayPriceInUsd * 100),
          dimoTokenId: BigInt(hostCarInfo.dimoTokenId),
          signedDimoTokenId: dimoSignatureResult.value,
        };

        const result = await rentalityContracts.gateway.addCar(request);

        await deleteFilesByUrl(
          result.ok ? saveMetadataResult.value.urlsToDelete : saveMetadataResult.value.newUploadedUrls
        );

        return result;
      } catch (error) {
        logger.error("saveNewCar error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [MY_LISTINGS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [REFERRAL_OWN_POINTS_QUERY_KEY] });
      }
    },
  });
}

export default useSaveNewCar;
