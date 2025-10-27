import { emptyHostCarInfo } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING } from "@/model/EngineType";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest } from "@/model/blockchain/schemas";
import { Err, Result } from "@/model/utils/result";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { INVESTMENTS_LIST_QUERY_KEY } from "./useFetchInvestments";
import { logger } from "@/utils/logger";
import { deleteFilesByUrl, saveCarMetadata } from "@/features/filestore";
import { emptyContractLocationInfo } from "@/model/blockchain/schemas_utils";
import { PlatformCarImage } from "@/model/FileToUpload";

type CreateInvestCarRequest = {
  images: PlatformCarImage[];
  brand: string;
  model: string;
  releaseYear: number;
  carPrice: number;
  hostPercents: number;
  nftName: string;
  nftSym: string;
};

function useCreateInvestCar() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      images,
      brand,
      model,
      releaseYear,
      carPrice,
      hostPercents,
      nftName,
    }: CreateInvestCarRequest): Promise<Result<boolean>> => {
      const hostCarInfo = {
        ...emptyHostCarInfo,
        images,
        brand,
        model,
        releaseYear,
      };

      try {
        if (!ethereumInfo || !rentalityContracts) {
          logger.error("createInvestCar error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          logger.error("createInvestCar error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const engineParams: bigint[] = [];
        if (hostCarInfo.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
          engineParams.push(BigInt(hostCarInfo.tankVolumeInGal));
          engineParams.push(BigInt(hostCarInfo.fuelPricePerGal * 100));
        } else if (hostCarInfo.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
          engineParams.push(BigInt(hostCarInfo.fullBatteryChargePrice * 100));
        }

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
          pricePerDayInUsdCents: BigInt(0),
          securityDepositPerTripInUsdCents: BigInt(0),
          milesIncludedPerDay: BigInt(0),
          geoApiKey: "",
          engineType: BigInt(0),
          engineParams: [],
          timeBufferBetweenTripsInSec: BigInt(0),
          insuranceRequired: false,
          insurancePriceInUsdCents: BigInt(0),
          locationInfo: { locationInfo: emptyContractLocationInfo, signature: "0x" },
          currentlyListed: false,
          dimoTokenId: BigInt(0),
          signedDimoTokenId: "0x",
        };

        const createInvestRequest = {
          car: request,
          priceInCurrency: BigInt(carPrice),
          creatorPercents: BigInt(hostPercents),
          inProgress: true,
        };

        const result = await rentalityContracts.investment.createCarInvestment(
          createInvestRequest,
          nftName,
          ETH_DEFAULT_ADDRESS
        );

        await deleteFilesByUrl(
          result.ok ? saveMetadataResult.value.urlsToDelete : saveMetadataResult.value.newUploadedUrls
        );

        return result;
      } catch (error) {
        logger.error("createInvestCar error: ", error);
        return Err(error instanceof Error ? error : new Error("Unknown error occurred"));
      }
    },
    onSuccess: (data) => {
      if (data.ok) {
        queryClient.invalidateQueries({ queryKey: [INVESTMENTS_LIST_QUERY_KEY] });
      }
    },
  });
}

export default useCreateInvestCar;
