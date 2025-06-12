import { IRentalityContracts, useRentality } from "@/contexts/rentalityContext";
import { EthereumInfo, useEthereum } from "@/contexts/web3/ethereumContext";
import { useQuery } from "@tanstack/react-query";

export type TripDiscounts = {
  discount3DaysAndMoreInPercents: number;
  discount7DaysAndMoreInPercents: number;
  discount30DaysAndMoreInPercents: number;
  isInitialized: boolean;
};

export const TRIP_DISCOUNTS_QUERY_KEY = "TripDiscounts";
type QueryData = TripDiscounts;
const INITIAL_DATA: TripDiscounts = {
  discount3DaysAndMoreInPercents: 0,
  discount7DaysAndMoreInPercents: 0,
  discount30DaysAndMoreInPercents: 0,
  isInitialized: false,
};

function useFetchTripDiscounts() {
  const ethereumInfo = useEthereum();
  const { rentalityContracts } = useRentality();

  const queryResult = useQuery<QueryData>({
    queryKey: [TRIP_DISCOUNTS_QUERY_KEY, rentalityContracts, ethereumInfo?.walletAddress],
    queryFn: async () => fetchTripDiscounts(rentalityContracts, ethereumInfo),
    refetchOnWindowFocus: false,
  });

  const data = queryResult.data ?? INITIAL_DATA;
  return { ...queryResult, data: data };
}

async function fetchTripDiscounts(
  rentalityContracts: IRentalityContracts | null | undefined,
  ethereumInfo: EthereumInfo | null | undefined
) {
  if (!rentalityContracts || !ethereumInfo) {
    throw new Error("Contracts or wallet not initialized");
  }

  const result = await rentalityContracts.gateway.getDiscount(ethereumInfo.walletAddress);
  if (!result.ok) {
    throw result.error;
  }

  const tripDiscounts: TripDiscounts = {
    discount3DaysAndMoreInPercents: Number(result.value.threeDaysDiscount) / 10_000,
    discount7DaysAndMoreInPercents: Number(result.value.sevenDaysDiscount) / 10_000,
    discount30DaysAndMoreInPercents: Number(result.value.thirtyDaysDiscount) / 10_000,
    isInitialized: result.value.initialized,
  };

  return tripDiscounts;
}

export default useFetchTripDiscounts;
