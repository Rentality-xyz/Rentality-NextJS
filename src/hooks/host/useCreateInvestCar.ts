import { HostCarInfo, isUnlimitedMiles, UNLIMITED_MILES_VALUE } from "@/model/HostCarInfo";
import { useRentality } from "@/contexts/rentalityContext";
import { ENGINE_TYPE_ELECTRIC_STRING, ENGINE_TYPE_PETROL_STRING, getEngineTypeCode } from "@/model/EngineType";
import { useEthereum } from "@/contexts/web3/ethereumContext";
import { ContractCreateCarRequest, ContractSignedLocationInfo } from "@/model/blockchain/schemas";
import { mapLocationInfoToContractLocationInfo } from "@/utils/location";
import { Err, Result } from "@/model/utils/result";
import { ETH_DEFAULT_ADDRESS } from "@/utils/constants";
import { saveCarImages, uploadMetadataToIPFS } from "./useSaveNewCar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUserHasEnoughFunds } from "@/utils/wallet";
import { INVESTMENTS_LIST_QUERY_KEY } from "../guest/useGetInvestments";

function useCreateInvestCar() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hostCarInfo,
      carPrice,
      hostPercents,
      nftName,
    }: {
      hostCarInfo: HostCarInfo;
      carPrice: number;
      hostPercents: number;
      nftName: string;
      nftSym: string;
    }): Promise<Result<boolean, Error>> => {
      try {
        if (!ethereumInfo || !rentalityContracts) {
          console.error("createInvestCar error: Missing required contracts or ethereum info");
          return Err(new Error("Missing required contracts or ethereum info"));
        }

        if (!(await isUserHasEnoughFunds(ethereumInfo.signer))) {
          console.error("createInvestCar error: user don't have enough funds");
          return Err(new Error("NOT_ENOUGH_FUNDS"));
        }

        const savedImages = await saveCarImages(hostCarInfo.images, ethereumInfo);

        const dataToSave = {
          ...hostCarInfo,
          images: savedImages,
        };

        const metadataURL = await uploadMetadataToIPFS(dataToSave, ethereumInfo);

        if (!metadataURL) {
          console.error("Upload JSON to Pinata error");
          return Err(new Error("ERROR"));
        }

        const engineParams: bigint[] = [];
        if (dataToSave.engineTypeText === ENGINE_TYPE_PETROL_STRING) {
          engineParams.push(BigInt(dataToSave.tankVolumeInGal));
          engineParams.push(BigInt(dataToSave.fuelPricePerGal * 100));
        } else if (dataToSave.engineTypeText === ENGINE_TYPE_ELECTRIC_STRING) {
          engineParams.push(BigInt(dataToSave.fullBatteryChargePrice * 100));
        }

        const location: ContractSignedLocationInfo = {
          locationInfo: mapLocationInfoToContractLocationInfo(dataToSave.locationInfo),
          signature: "",
        };
        console.debug(`location: ${JSON.stringify(location)}`);

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
          insuranceRequired: dataToSave.isGuestInsuranceRequired,
          insurancePriceInUsdCents: BigInt(dataToSave.insurancePerDayPriceInUsd),
          locationInfo: { ...location, signature: "0x" },
          currentlyListed: dataToSave.currentlyListed,
          dimoTokenId: BigInt(0),
          signedDimoTokenId: "0x",
        };

        const createInvestRequest = {
          car: request,
          priceInUsd: BigInt(carPrice * 100),
          creatorPercents: BigInt(hostPercents),
          inProgress: true,
        };

        const result = await rentalityContracts.investment.createCarInvestment(
          createInvestRequest,
          nftName,
          ETH_DEFAULT_ADDRESS
        );

        return result;
      } catch (error) {
        console.error("createInvestCar error: ", error);
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
