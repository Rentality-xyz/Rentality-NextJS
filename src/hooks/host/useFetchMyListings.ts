import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { useQuery } from "@tanstack/react-query";
import { BaseCarInfo } from "@/model/BaseCarInfo";
import { getFileURI, getMetaData, parseMetaData } from "@/features/filestore/utils";
import { validateContractCarInfoDTO } from "@/model/blockchain/schemas_utils";

export const MY_LISTINGS_QUERY_KEY = "MyListings";

type QueryData = BaseCarInfo[];

function useFetchMyListings() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [MY_LISTINGS_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchMyListings(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? [];
  return { ...queryResult, data: data };
}

async function fetchMyListings(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getMyCars();
  if (!result.ok) {
    throw result.error;
  }

  if (result.value.length > 0) {
    validateContractCarInfoDTO(result.value[0]);
  }

  const myListingsData =
    (await Promise.all(
      result.value.map(async (carDto) => {
        const metaData = parseMetaData(await getMetaData(carDto.metadataURI));

        const pricePerDay = Number(carDto.carInfo.pricePerDayInUsdCents) / 100;
        const securityDeposit = Number(carDto.carInfo.securityDepositPerTripInUsdCents) / 100;
        const milesIncludedPerDay = Number(carDto.carInfo.milesIncludedPerDay);

        let item: BaseCarInfo = {
          carId: Number(carDto.carInfo.carId),
          ownerAddress: carDto.carInfo.createdBy.toString(),
          image: getFileURI(metaData.mainImage),
          brand: carDto.carInfo.brand,
          model: carDto.carInfo.model,
          year: carDto.carInfo.yearOfProduction.toString(),
          licensePlate: metaData.licensePlate,
          pricePerDay: pricePerDay,
          securityDeposit: securityDeposit,
          milesIncludedPerDay: milesIncludedPerDay,
          currentlyListed: carDto.carInfo.currentlyListed,
          isEditable: carDto.isEditable,
          vinNumber: carDto.carInfo.carVinNumber,
          dimoTokenId: Number(carDto.dimoTokenId),
        };
        return item;
      })
    )) ?? [];

  return myListingsData;
}

export default useFetchMyListings;
