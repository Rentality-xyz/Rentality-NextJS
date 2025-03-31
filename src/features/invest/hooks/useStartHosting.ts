import { useRentality } from "@/contexts/rentalityContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";
import { logger } from "@/utils/logger";
import { Err } from "@/model/utils/result";
import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE } from "@/model/HostCarInfo";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { saveCarMetadata } from "@/features/filestore/pinata/utils";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";

type ClaimAndCreateCarRequest = {
  hostCarInfo: HostCarInfo;
  investId: number;
};

const useStartHosting = () => {
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();
  const ethereumInfo = useEthereum();

  return useMutation({
    mutationFn: async ({ investId, hostCarInfo }: ClaimAndCreateCarRequest) => {
      if (!rentalityContracts) {
        logger.error("startHosting error: rentalityContract is null");
        return Err(new Error("rentalityContract is null"));
      }

      if (!ethereumInfo || !rentalityContracts) {
        logger.error("createInvestCar error: Missing required contracts or ethereum info");
        return Err(new Error("Missing required contracts or ethereum info"));
      }
      try {
        //  if (!verifyCar(hostCarInfo)) {
        //         logger.error("createInvestCar error: hostCarInfo is not valid");
        //         return Err(new Error("hostCarInfo is not valid"));
        //       }

        const engineParams: bigint[] = [];
        if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
          engineParams.push(BigInt(hostCarInfo.tankVolumeInGal));
          engineParams.push(BigInt(hostCarInfo.fuelPricePerGal * 100));
        } else if (hostCarInfo.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
          engineParams.push(BigInt(hostCarInfo.fullBatteryChargePrice * 100));
        }
        const location: ContractSignedLocationInfo = {
          locationInfo: mapLocationInfoToContractLocationInfo(hostCarInfo.locationInfo),
          signature: "0x",
        };
        logger.debug(`Location info to save: ${JSON.stringify(location)}`);

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
          insuranceRequired: hostCarInfo.isGuestInsuranceRequired,
          insurancePriceInUsdCents: BigInt(hostCarInfo.insurancePerDayPriceInUsd),
          locationInfo: { ...location, signature: "0x" },
          currentlyListed: hostCarInfo.currentlyListed,
          dimoTokenId: BigInt(0),
          signedDimoTokenId: "0x",
        };

        const result = await rentalityContracts.investment.claimAndCreatePool(investId, request);

        return result.ok ? result : Err(new Error("startHosting error: " + result.error));
      } catch (error) {
        logger.error("startHosting error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [INVESTMENTS_LIST_QUERY_KEY] });
      }
    },
  });
};

export default useStartHosting;
